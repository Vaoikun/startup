const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// In-memory user database. In production this would be a real database.
let users = [];
let vehicles = [];
let appointments = [];

app.use(express.json());
app.use(cookieParser());
// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user account
apiRouter.post('/auth/create', async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    if (!email || !password) {
      return res.status(400).send({ msg: 'Email and password required' });
    }
    if (await findUser('email', email)) {
      return res.status(409).send({ msg: 'Existing user' });
    }
    const user = await createUser(email, password);
    setAuthCookie(res, user.token);
    res.send({
      userName: user.userName,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    if (!email || !password) {
      return res.status(400).send({ msg: 'Email and password required' });
    }
    const user = await findUser('email', email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ msg: 'Invalid email or password' });
    }
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({
      userName: user.userName,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const token = req.cookies[authCookieName];
  const user = await findUser('token', token);
  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// Delete the current user's account infromation
apiRouter.delete('/auth/logout', verifyAuth, async(req, res) => {
  delete req.user.token;
  res.clearCookie(authCookieName);
  res.status(204).end();
})

// Get the current user's account information
apiRouter.get('/account', verifyAuth, async (req, res) => {
  res.send({
    userName: req.user.userName,
    email: req.user.email,
    displayName: req.user.displayName || '',
  });
});

apiRouter.put('/account', verifyAuth, async (req, res) => {
  const displayName = (req.body.displayName || '').trim();
  req.user.displayName = displayName;

  res.send({
    userName: req.user.userName,
    email: req.user.email,
    displayName: req.user.displayName,
  });
})

apiRouter.delete('/account', verifyAuth, async (req, res) => {
  const userId = req.user.id;
  const userName = req.user.userName;
  vehicles = vehicles.filter((v) => v.userId !== userId);
  appointments = appointments.filter((a) => a.userName !== userName);
  users = users.filter((u) => u.id !== userId);

  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Get the current user's vehicles
apiRouter.get('/vehicles', verifyAuth, async (req, res) => {
  const userVehicles = vehicles.filter((v) => v.userId === req.user.id);
  res.send(userVehicles);
});

// Add a vehicle to the current user's account
apiRouter.post('/vehicles', verifyAuth, async (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  const year = (req.body.year || '').trim();
  const make = (req.body.make || '').trim();
  const model = (req.body.model || '').trim();
  const trim = (req.body.trim || '').trim();
  const vinLast4 = (req.body.vinLast4 || '').trim();

  if(!year || !make || !model) {
    return res.status(400).send({
      msg: 'Please fill out Year, Make and Model.',
    });
  }

  if (vinLast4 && vinLast4.length !== 4) {
    return res.status(400).send({
      msg: 'VIN last 4 must be exactly 4 characters (or leave blank).',
    });
  }

  const vehicle = {
    id: uuidv4(),
    userId: req.user.id,
    userName: req.user.userName,
    nickname,
    year,
    make,
    model,
    trim,
    vinLast4,
    createdAt: new Date().toISOString(),
  };
  vehicles.push(vehicle);
  res.send(vehicle);
});

apiRouter.delete('/vehicles/:id', verifyAuth, async (req, res) =>{
  const before = vehicles.length;
  vehicles = vehicles.filter(
    (v) => !(v.id === req.params.id && v.userId === req.user.id)
  );
  if (vehicles.length === before) {
    return res.status(404).send({ msg: 'Vehicle not found.'});
  }
  res.status(204).end();
});

// Get the current user's appointments
apiRouter.get('/appointments', verifyAuth, async (req, res) => {
  const userAppointments = appointments.filter(
    (a) => a.userName === req.user.userName
  );
  res.send(userAppointments);
});

// Add an appointment to the current user's account
apiRouter.post('/appointments', verifyAuth, async (req, res) => {
  const date = (req.body.date || '').trim();
  const time = (req.body.time || '').trim();
  const service = (req.body.service || '').trim();
  const vehicleId = (req.body.vehicleId || '').tirm();

  if (!date) {
    return res.status(400).send({ msg: 'Pick a date.'});
  }
  if (!time) {
    return res.status(400).send({ msg: 'Pick a time slot.'});
  }
  if (!service) {
    return res.status(400).send({ msg: 'Select a service.'});
  }

  const validServices = ['tune', 'inspect', 'diagnostic', 'consult'];
  if (!validServices.includes(service)) {
    return res.status(400).send({msg:'Invalid service.'})
  }
  const duplicate = appointments.find(
    (a) => 
      a.userName === req.user.userName && a.date === date && a.time === time
  );

  if (duplicate) {
    return res.status(409).send({
      msg: 'Time slot taken already.'
    });
  }

  let linkedVehicleId = '';
  if (vehicleId) {
    const vehicle = vehicles.find(
      (v) => v.id === vehicleId && v.userId === req.user.id
    );
    if (!vehicle) {
      return res.status(400).send({ msg: 'Invalid vehicleId.'});
    }
    linkedVehicleId = vehicleId;
  }

  const appt = {
    id: uuidv4(),
    userName: req.user.userName,
    userId: req.user.id,
    vehicleId: linkedVehicleId,
    date,
    time,
    service,
    createdAt: new Date().toISOString(),
  };

  appointments.push(appt)
  res.send(appt);
});

apiRouter.delete('/appointments/:id', verifyAuth, async (req, res) => {
  const before = appointments.length;
  appointments = appointments.filter(
    (a) => !(a.id === req.params.id && a.userName == req.user.userName)
  );
  if (appointments.length === before) {
    return res.status(404).send({msg:'Appointment not found.'});
  }
  res.status(204).end();
})

// Return the application's default page if the path is unknown
app.get('/service', (_req, res) => {
  res.send({ msg: 'Startup service' });
});

// SPA fallback
app.use((req, res, next) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

app.use((req, res) => {
  res.status(404).send({ msg: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create a new user account
async function createUser(email, password) {
  const user = {
    id: uuidv4(),
    userName: email,
    email,
    displayName: '',
    password: await bcrypt.hash(password, 10),
    token: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

// Find a user by a specific field and value
async function findUser(field, value) {
  return users.find((u) => u[field] === value);
}

// Set the authentication cookie for a user
function setAuthCookie(res, token) {
    res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Service running on port ${port}`);
});

