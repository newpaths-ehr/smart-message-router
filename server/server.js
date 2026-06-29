const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const inboundRoutes = require('./routes/inbound');
const rulesRoutes = require('./routes/rules');
const forwardRoutes = require('./routes/forward');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);                        // signup, login, logout
app.use('/inbound', inboundRoutes);                  // ZeptoMail posts here when email arrives
app.use('/rules', requireAuth, rulesRoutes);         // protected — must be logged in
app.use('/forward', requireAuth, forwardRoutes);     // protected — must be logged in

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Smart Message Router running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
