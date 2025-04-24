// seed.js
const admin = require('firebase-admin');
const path  = require('path');

// point to your service account file
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  // 1) users/userPlaceholder
  await db.collection('users').doc('userPlaceholder').set({
    displayName: 'Placeholder',
    email: 'placeholder@example.com',
    avatarUrl: null,
    bio: null,
    stats: { quizzesCreated: 0, quizzesAttempted: 0, totalScore: 0 }
  });

  // 2) quizzes/quizPlaceholder
  const quizRef = db.collection('quizzes').doc('quizPlaceholder');
  await quizRef.set({
    title: 'Placeholder Quiz',
    description: null,
    creatorId: 'userPlaceholder',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    mode: 'public',
    inviteCode: null,
    invitedEmails: [],
    category: 'General',
    tags: [],
    requiresManualGrading: false,
    questionCount: 0,
    totalAttempts: 0,
    sumOfScores: 0,
    averageScore: 0,
    highestScore: 0
  });

  // 2a) quizzes/quizPlaceholder/questions/questionPlaceholder
  await quizRef.collection('questions').doc('questionPlaceholder').set({
    text: 'Placeholder question?',
    marks: 1,
    type: 'single',
    options: ['Option 1', 'Option 2'],
    correctAnswers: ['Option 1']
  });

  // 2b) quizzes/quizPlaceholder/attempts/attemptPlaceholder
  await quizRef.collection('attempts').doc('attemptPlaceholder').set({
    userId: 'userPlaceholder',
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    answers: [
      { questionId: 'questionPlaceholder', selected: ['Option 1'], textAnswer: null }
    ],
    autoScore: 1,
    manualScore: null,
    gradedBy: null,
    gradedAt: null
  });

  // 2c) optional leaderboard entry
  await quizRef.collection('leaderboard').doc('userPlaceholder').set({
    bestScore: 1,
    attemptsCount: 1,
    lastAttemptAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});

