const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const authCookieName = 'token';
// const multer = require('multer');
const DB = require('./database');
const http = require('http');
const { peerProxy } = require('./peerProxy');
const { WebSocket } = require('ws');

// Create the HTTP server and attach the peer proxy to it
const httpServer = http.createServer(app);
const socketServer = peerProxy(httpServer);

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// app.post('/api/upload/car-photo', upload.single('photo'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send({ msg: 'No file uploaded' });
//     }

//     res.send({
//       msg: 'Upload successful',
//       fileName: req.file.filename,
//       filePath: `/uploads/${req.file.filename}`,
//     });
//   } catch (err) {
//     res.status(500).send({ msg: 'Upload failed' });
//   }
// });

// app.use('/uploads', express.static('uploads'));

// CreateAuth a new user account
apiRouter.post('/auth/create', async (req, res) => {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).send({ msg: 'Email and password required' });
  }

  const existingUser = await DB.getUser(email);
  if (existingUser) {
    return res.status(409).send({ msg: 'Existing user' });
  }

  const user = {
    email,
    userName: email,
    displayName: '',
    password: await bcrypt.hash(password, 10),
    token: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  await DB.addUser(user);
  setAuthCookie(res, user.token);

  res.send({
    userName: user.userName,
    email: user.email,
    displayName: user.displayName,
  });
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    if (!email || !password) {
      return res.status(400).send({ msg: 'Email and password required' });
    }
    const user = await DB.getUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ msg: 'Invalid email or password' });
    }
    user.token = uuidv4();
    await DB.updateUser(user);
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
  const user = await DB.getUserByToken(token);
  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// Delete the current user's account infromation
apiRouter.delete('/auth/logout', verifyAuth, async(req, res) => {
  delete req.user.token;
  await DB.removeUserToken(req.user.email);
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
  await DB.updateUser(req.user);
  res.send({
    userName: req.user.userName,
    email: req.user.email,
    displayName: req.user.displayName,
  });
})

apiRouter.delete('/account', verifyAuth, async (req, res) => {
  await DB.deleteVehiclesByUser(req.user.email);
  await DB.deleteAppointmentsByUser(req.user.email);
  await DB.deleteUser(req.user.email);
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Get the current user's vehicles
apiRouter.get('/vehicles', verifyAuth, async (req, res) => {
  const userVehicles = await DB.getVehiclesByUser(req.user.email);
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
    ownerEmail: req.user.email,
    nickname,
    year,
    make,
    model,
    trim,
    vinLast4,
    createdAt: new Date().toISOString(),
  };
  await DB.addVehicle(vehicle);
  res.send(vehicle);
});

apiRouter.delete('/vehicles/:id', verifyAuth, async (req, res) => {
  const result = await DB.deleteVehicle(req.params.id, req.user.email);
  if (result.deletedCount === 0) {
    return res.status(404).send({ msg: 'Vehicle not found.' });
  }
  res.status(204).end();
});

// Get the current user's appointments
apiRouter.get('/appointments', verifyAuth, async (req, res) => {
  const userAppointments = await DB.getAppointmentsByUser(req.user.email);
  res.send(userAppointments);
});

// Add an appointment to the current user's account
apiRouter.post('/appointments', verifyAuth, async (req, res) => {
  try {
    const date = (req.body.date || '').trim();
    const time = (req.body.time || '').trim();
    const service = (req.body.service || '').trim();
    const vehicleId = (req.body.vehicleId || '').trim();

    if (!date) {
      return res.status(400).send({ msg: 'Pick a date.' });
    }
    if (!time) {
      return res.status(400).send({ msg: 'Pick a time slot.' });
    }
    if (!service) {
      return res.status(400).send({ msg: 'Select a service.' });
    }

    const validServices = ['tune', 'inspect', 'diagnostic', 'consult'];
    if (!validServices.includes(service)) {
      return res.status(400).send({ msg: 'Invalid service.' });
    }

    const existingAppointments = await DB.getAppointmentsByUser(req.user.email);
    const duplicate = existingAppointments.some(
      (a) => a.date === date && a.time === time
    );

    if (duplicate) {
      return res.status(409).send({ msg: 'Time slot taken already.' });
    }

    let linkedVehicleId = '';
    if (vehicleId) {
      const userVehicles = await DB.getVehiclesByUser(req.user.email);
      const vehicle = userVehicles.find((v) => String(v._id) === vehicleId);

      if (!vehicle) {
        return res.status(400).send({ msg: 'Invalid vehicleId.' });
      }

      linkedVehicleId = vehicleId;
    }

    const appt = {
      userEmail: req.user.email,
      vehicleId: linkedVehicleId,
      date,
      time,
      service,
      createdAt: new Date().toISOString(),
    };

    const savedAppt = await DB.addAppointment(appt);

    socketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: 'appointment:created',
            data: savedAppt,
          })
        );
      }
    });

    res.send(savedAppt);
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Failed to create appointment.' });
  }
});

apiRouter.delete('/appointments/:id', verifyAuth, async (req, res) => {
  const result = await DB.deleteAppointment(req.params.id, req.user.email);
  if (result.deletedCount === 0) {
    return res.status(404).send({ msg: 'Appointment not found.' });
  }

  socketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'appointment:deleted',
          data: { id: req.params.id },
        })
      );
    }
  });

  res.status(204).end();
});

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
// async function createUser(email, password) {
//   const user = {
//     id: uuidv4(),
//     userName: email,
//     email,
//     displayName: '',
//     password: await bcrypt.hash(password, 10),
//     token: uuidv4(),
//     createdAt: new Date().toISOString(),
//   };
//   users.push(user);
//   return user;
// }

// // Find a user by a specific field and value
// async function findUser(field, value) {
//   return users.find((u) => u[field] === value);
// }

// Set the authentication cookie for a user
function setAuthCookie(res, token) {
    res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

// Start the server
httpServer.listen(port, () => {
  console.log(`Service + WebSocket running on port ${port}`);
});

