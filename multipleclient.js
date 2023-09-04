const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const moment = require('moment-timezone'); // Import the moment-timezone library

const app = express();
const port = 3000;

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./voltage-guard-firebase-adminsdk-la5o7-12e080e1cc.json'); // Replace with your own path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://voltage-guard-default-rtdb.asia-southeast1.firebasedatabase.app/', // Replace with your Firebase Database URL
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
