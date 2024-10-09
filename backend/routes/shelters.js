const express = require('express');
const router = express.Router();
const Shelter = require('../models/shelter');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for admin authentication

// Get all approved shelters (for displaying on the map)
router.get('/', async (req, res) => {
  try {
    const shelters = await Shelter.find({ approved: true });
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
      approved: false
    });

    const newShelter = await shelter.save();
    res.status(201).json({ message: 'Shelter is pending admin approval', shelter: newShelter });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;