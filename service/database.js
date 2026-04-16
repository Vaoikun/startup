const { MongoClient, ObjectId } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('users');
const vehicleCollection = db.collection('vehicles');
const appointmentCollection = db.collection('appointments');


// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();
// User functions
function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function removeUserToken(email) {
  await userCollection.updateOne({ email: email }, { $unset: { token: "" } });
}

// Vehicle functions
async function addVehicle(vehicle) {
  return vehicleCollection.insertOne(vehicle);
}

function getVehiclesByUser(email) {
  return vehicleCollection.find({ ownerEmail: email }).toArray();
}

async function deleteVehicle(vehicleId, email) {
  return vehicleCollection.deleteOne({
    _id: new ObjectId(vehicleId),
    ownerEmail: email,
  });
}

// Appointment functions
async function addAppointment(appointment) {
  return appointmentCollection.insertOne(appointment);
}

function getAppointmentsByUser(email) {
  return appointmentCollection
    .find({ userEmail: email })
    .sort({ date: 1 })
    .toArray();
}

function getAllAppointments() {
  return appointmentCollection
    .find({})
    .sort({ date: 1 })
    .toArray();
}

async function deleteAppointment(appointmentId, email) {
  return appointmentCollection.deleteOne({
    _id: new ObjectId(appointmentId),
    userEmail: email,
  });
}

// Account delte cleanup functions
async function deleteUser(email) {
  return userCollection.deleteOne({ email });
}

async function deleteVehiclesByUser(email) {
  return vehicleCollection.deleteMany({ ownerEmail: email });
}

async function deleteAppointmentsByUser(email) {
  return appointmentCollection.deleteMany({ userEmail: email });
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  removeUserToken,
  addVehicle,
  getVehiclesByUser,
  deleteVehicle,
  addAppointment,
  getAppointmentsByUser,
  getAllAppointments,
  deleteAppointment,
  deleteUser,
  deleteVehiclesByUser,
  deleteAppointmentsByUser,
};
