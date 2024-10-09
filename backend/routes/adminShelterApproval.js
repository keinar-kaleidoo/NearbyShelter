// routes/adminShelterApproval.js
const express = require('express');
const router = express.Router();
const Shelter = require('../models/shelter');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות אדמין

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pendingShelters = await Shelter.find({ approved: false });
    res.json(pendingShelters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    shelter.approved = true;
    const updatedShelter = await shelter.save();
    res.json(updatedShelter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/reject/:id', authMiddleware, async (req, res) => {
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