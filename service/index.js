const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// In-memory user database. In production this would be a real database.
const users = {
  'alice': {
    username: 'alice',
    passwordHash: bcrypt.hashSync('password123', 10),
  },
  'bob': {
    username: 'bob',
    passwordHash: bcrypt.hashSync('securepassword', 10),
  },
};

// In-memory session store. In production this would be a real session store.
const sessions = {};

app.use(express.json());
app.use(cookieParser());
// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth endpoint for new user registration
apiRouter.post('/createAuth', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (users[username]) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  users[username] = { username, passwordHash };
  res.json({ message: 'User created successfully' });
});

// Login endpoint for user authentication
apiRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = uuid.v4();
  sessions[token] = username;
  res.cookie(authCookieName, token, { httpOnly: true });
  res.json({ message: 'Login successful' });
});

// Logout endpoint for user logout
apiRouter.post('/logout', (req, res) => {
  const token = req.cookies[authCookieName];
  if (token) {
    delete sessions[token];
    res.clearCookie(authCookieName);
  }
  res.json({ message: 'Logout successful' });
});

// Middleware to authenticate requests
function authenticate(req, res, next) {
  const token = req.cookies[authCookieName];
  if (token && sessions[token]) {
    req.username = sessions[token];
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Default error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Service running on port ${port}`);
});

