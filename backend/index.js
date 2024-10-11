const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection using Mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
const shelterRoutes = require('./routes/shelters');
app.use('/api/shelters', shelterRoutes);

const adminRoutes = require('./routes/adminLogin');
app.use('/api/admin', adminRoutes);

const adminShelterApprovalRoutes = require('./routes/adminShelterApproval');
app.use('/api/admin/shelters', adminShelterApprovalRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
