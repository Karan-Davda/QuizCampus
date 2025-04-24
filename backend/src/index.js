require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(require(path.join(__dirname, '..', 'serviceAccountKey.json')))
});

const app = express();
app.use(cors());
app.use(express.json());

// Route imports
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Quiz backend is live');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
