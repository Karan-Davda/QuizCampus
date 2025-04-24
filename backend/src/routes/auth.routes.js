const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');

router.post('/signup', async (req, res) => {
  const {
    email, password, firstName, lastName,
    displayName, dateOfBirth
  } = req.body;

  if (!email || !password || !firstName || !lastName || !displayName || !dateOfBirth) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email, password, displayName
    });

    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const localDOB = new Date(year, month - 1, day);

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      firstName, lastName, displayName, email,
      avatarUrl: null,
      bio: null,
      dateOfBirth: admin.firestore.Timestamp.fromDate(localDOB),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        quizzesAttempted: 0,
        quizzesCreated: 0,
        totalScore: 0,
        totalAchievedScore: 0,
        averageScore: 0
      }
    });

    res.status(201).json({ uid: userRecord.uid, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//GetProfile and Update profile
router.get('/profile', authenticate, async (req, res) => {
  const uid = req.user.uid;

  try {
    const doc = await admin.firestore().collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'displayName', 'bio', 'avatarUrl', 'dateOfBirth'];
  const updateData = {};

  for (let key of allowedFields) {
    if (req.body[key] !== undefined) {
      if (key === 'dateOfBirth') {
        // Parse date properly
        const [year, month, day] = req.body.dateOfBirth.split('-').map(Number);
        updateData[key] = admin.firestore.Timestamp.fromDate(new Date(year, month - 1, day));
      } else {
        updateData[key] = req.body[key];
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    await admin.firestore().collection('users').doc(req.user.uid).update(updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


module.exports = router;