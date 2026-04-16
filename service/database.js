const { MongoClient, ObjectId } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
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
    console.log(`Connected to database`);
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
  const result = await vehicleCollection.insertOne(vehicle);
  return { ...vehicle, _id: result.insertedId };
}

function getVehiclesByUser(email) {
  return vehicleCollection.find({ ownerEmail: email }).toArray();
}

async function deleteVehicle(vehicleId, email) {
  if (!ObjectId.isValid(vehicleId)) {
    return { deletedCount: 0 };
  }
  return vehicleCollection.deleteOne({
    _id: new ObjectId(vehicleId),
    ownerEmail: email,
  });
}

// Appointment functions
async function addAppointment(appointment) {
  const result = await appointmentCollection.insertOne(appointment);
  return { ...appointment, _id: result.insertedId };
}

function getAppointmentsByUser(email) {
  return appointmentCollection
    .find({ userEmail: email })
    .sort({ date: 1, time: 1 })
    .toArray();
}

function getAllAppointments() {
  return appointmentCollection
    .find({})
    .sort({ date: 1, time: 1 })
    .toArray();
}

async function deleteAppointment(appointmentId, email) {
  if (!ObjectId.isValid(appointmentId)) {
    return { deletedCount: 0 };
  }
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
