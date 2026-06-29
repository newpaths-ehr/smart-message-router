const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const inboundRoutes = require('./routes/inbound');
const rulesRoutes = require('./routes/rules');
const forwardRoutes = require('./routes/forward');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/inbound', inboundRoutes);   // ZeptoMail posts here when email arrives
app.use('/rules', rulesRoutes);       // CRUD for client forwarding rules
app.use('/forward', forwardRoutes);   // Manually trigger a forward (for testing)

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Smart Message Router running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
