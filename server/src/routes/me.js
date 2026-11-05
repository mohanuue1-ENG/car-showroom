const express = require('express');
const mongoose = require('mongoose');
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const { authRequired } = require('../middleware/auth');

// Customer-only routes. Every query is scoped to req.user, so customers never see others' data.
const router = express.Router();
router.use(authRequired);

const validId = (id) => mongoose.isValidObjectId(id);

// GET /api/me/wishlist
router.get('/wishlist', async (req, res) => {
  await req.user.populate({ path: 'wishlist', populate: { path: 'category', select: 'name slug' } });
  res.json({ items: req.user.wishlist.filter((c) => c && c.status !== 'sold') });
});

// POST /api/me/wishlist/:carId
router.post('/wishlist/:carId', async (req, res) => {
  if (!validId(req.params.carId) || !(await Car.exists({ _id: req.params.carId, status: { $ne: 'sold' } }))) {
    return res.status(404).json({ error: 'Car not found' });
  }
  await req.user.updateOne({ $addToSet: { wishlist: req.params.carId } });
  res.json({ message: 'Saved to your wishlist' });
});

// DELETE /api/me/wishlist/:carId
router.delete('/wishlist/:carId', async (req, res) => {
  await req.user.updateOne({ $pull: { wishlist: req.params.carId } });
  res.json({ message: 'Removed from your wishlist' });
});

// GET /api/me/inquiries
router.get('/inquiries', async (req, res) => {
  const items = await Inquiry.find({ user: req.user._id, type: 'inquiry' })
    .sort({ createdAt: -1 })
    .populate('car', 'make model year images');
  res.json({ items });
});

// GET /api/me/test-drives
router.get('/test-drives', async (req, res) => {
  const items = await Inquiry.find({ user: req.user._id, type: 'test_drive' })
    .sort({ createdAt: -1 })
    .populate('car', 'make model year images');
  res.json({ items });
});

// GET /api/me/recently-viewed
router.get('/recently-viewed', async (req, res) => {
  await req.user.populate({ path: 'recentlyViewed', populate: { path: 'category', select: 'name slug' } });
  res.json({ items: req.user.recentlyViewed.filter((c) => c) });
});

module.exports = router;
