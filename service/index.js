const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
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
  if (await findUser('email', req.body.email)) {
    return res.status(409).send({ msg: 'Existing user' });
  }
  const user = await createUser(req.body.email, req.body.password);
  setAuthCookie(res, user.token);
  res.send({ email: user.email });
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);

  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    return res.send({ email: user.email });
  }
  res.status(401).send({ msg: 'Invalid email or password' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Get the current user's account information
apiRouter.get('/account', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  res.send({ email: user.email });
});

// Get the current user's vehicles
apiRouter.get('/vehicles', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const userVehicles = vehicles.filter((v) => v.userId === user.id);
  res.send(userVehicles);
});

// Add a vehicle to the current user's account
apiRouter.post('/vehicles', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (!req.body.make || !req.body.model || !req.body.year) {
    return res.status(400).send({ msg: 'Missing vehicle information' });
  }
  const vehicle = {
    id: uuid.v4(),
    userId: user.id,
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
  };
  vehicles.push(vehicle);
  res.send(vehicle);
});

// Get the current user's appointments
apiRouter.get('/appointments', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const userAppointments = appointments.filter((a) => a.userId === user.id);
  res.send(userAppointments);
});

// Add an appointment to the current user's account
apiRouter.post('/appointments', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const appointment = {
    id: uuid.v4(),
    userId: user.id,
    vehicleId: req.body.vehicleId,
    date: req.body.date,
    service: req.body.service,
  };
  appointments.push(appointment);
  res.send(appointment);
});

// Default error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Return the application's default page if the path is unknown

app.get('/service', (_req, res) => {
  res.send({ msg: 'Startup service' });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Create a new user account
async function createUser(email, password) {
  const user = {
    id: uuid.v4(),
    email,
    password: await bcrypt.hash(password, 10),
    token: uuid.v4(),
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
  res.cookie(authCookieName, token, { httpOnly: true });
}

// Start the server
app.listen(port, () => {
  console.log(`Service running on port ${port}`);
});

