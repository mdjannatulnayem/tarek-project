const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
 // Import the moment-timezone library
const moment = require('moment-timezone');

const app = express();
const port = 3000;

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./iotapp-83d9d-firebase-adminsdk-rhdzc-291b41db8d.json'); // Replace with your own path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iotapp-83d9d-default-rtdb.firebaseio.com', // Replace with your Firebase Database URL
});

// Data class definition
class Data {
  constructor(amp, volt) {
    this.amp = amp;
    this.volt = volt;
  }
}

// POST endpoint to accept a Data object and send it to Firebase with a timestamp-based key and a dynamic ID
app.post('/data/:id', (req, res) => {
  const { amp, volt } = req.body; // Assuming the JSON body has 'amp' and 'volt' properties
  const { id } = req.params; // Extract the 'id' from the URL

  if (typeof amp === 'number' && typeof volt === 'number') {
    const dataObject = new Data(amp, volt);

    // Generate a timestamp in the Dhaka time zone with periods replaced by underscores
    const timestampKey = moment().tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss_SSSZ').replace(/\./g, '_');

    // Push the data to Firebase Realtime Database with the timestamp-based key under the specified 'id'
    const db = admin.database();
    const ref = db.ref(`data/${id}`); // Use 'id' in the database path

    ref.child(timestampKey).set(dataObject, (error) => {
      if (error) {
        res.status(500).json({ error: 'Error sending data to Firebase' });
      } else {
        res.status(201).json({ timestamp: timestampKey, ...dataObject });
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid input format' });
  }
});


// GET endpoint to fetch a boolean value from the '/switches/main' path
app.get('/switches/:sw', (req, res) => {
  const { sw } = req.params; // Extract the 'sw' from the URL

  // Reference to the '/switches/main' path in Firebase Realtime Database
  const db = admin.database();
  const ref = db.ref(`/switches/${sw}`);

  // Fetch the boolean value
  ref.once('value', (snapshot) => {
    const value = snapshot.val();
    if (value !== null) {
      // If the value exists, return it as a response
      res.status(200).json({ switchValue: value });
    } else {
      // If the value is null (does not exist), return an appropriate response
      res.status(404).json({ error: 'Switch value not found' });
    }
  }, (error) => {
    // Handle any database error
    res.status(500).json({ error: 'Error fetching switch value from Firebase' });
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
