const express = require('express');
const router = express.Router();
const Shelter = require('../models/shelter');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for admin authentication

// Get all approved shelters (for displaying on the map)
router.get('/', async (req, res) => {
  try {
    const shelters = await Shelter.find({ approved: true }); // מחזיר רק מרחבים מאושרים
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });
    res.json(shelter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new shelter (no auth, pending approval)
router.post('/', async (req, res) => {
  const { name, latitude, longitude, description } = req.body;

  try {
    const existingShelter = await Shelter.findOne({ latitude, longitude });

    if (existingShelter) {
      return res.status(400).json({ message: 'Shelter already exists at this location' });
    }

    const shelter = new Shelter({
      name,
      latitude,
      longitude,
      description,
      approved: false  // מרחב מוגן ממתין לאישור
    });

    const newShelter = await shelter.save();
    res.status(201).json({ message: 'Shelter is pending admin approval', shelter: newShelter });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a shelter by ID (secured route for admin)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    if (req.body.name != null) shelter.name = req.body.name;
    if (req.body.latitude != null) shelter.latitude = req.body.latitude;
    if (req.body.longitude != null) shelter.longitude = req.body.longitude;
    if (req.body.description != null) shelter.description = req.body.description;

    const updatedShelter = await shelter.save();
    res.json(updatedShelter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a shelter by ID (secured route for admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    await Shelter.deleteOne({ _id: req.params.id });
    res.json({ message: 'Shelter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve a shelter (secured route for admin)
router.post('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    shelter.approved = true;
    await shelter.save();
    res.json({ message: 'Shelter approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject (delete) a shelter (secured route for admin)
router.post('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    await Shelter.deleteOne({ _id: req.params.id });
    res.json({ message: 'Shelter rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;