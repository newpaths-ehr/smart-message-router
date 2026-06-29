const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Verify env loaded correctly
if (!process.env.SUPABASE_URL) {
  console.error('ERROR: .env file not loaded — SUPABASE_URL is missing');
  console.error('Expected .env at:', path.resolve(__dirname, '../.env'));
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const inboundRoutes = require('./routes/inbound');
const rulesRoutes = require('./routes/rules');
const forwardRoutes = require('./routes/forward');
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const logRoutes = require('./routes/log');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/inbound', inboundRoutes);
app.use('/clients', requireAuth, clientsRoutes);
app.use('/rules', requireAuth, rulesRoutes);
app.use('/log', requireAuth, logRoutes);
app.use('/forward', requireAuth, forwardRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Smart Message Router running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
