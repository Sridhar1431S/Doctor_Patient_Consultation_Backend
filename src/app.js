require('dotenv').config();
const express = require('express');
const { errorHandler } = require('./utils/errors');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.get('/profile', ...authRoutes.getProfile);
app.use('/doctors', doctorRoutes);
app.use('/consultations', consultationRoutes);
// Nested under consultations since messages always belong to one.
app.use('/consultations/:id/messages', messageRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Must be registered LAST — Express uses arity (4 args) to identify error handlers.
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
