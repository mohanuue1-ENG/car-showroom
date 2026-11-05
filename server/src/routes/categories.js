const express = require('express');
const Category = require('../models/Category');
const Car = require('../models/Car');

const router = express.Router();

// GET /api/categories  (public, with counts of available cars)
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const counts = await Car.aggregate([
    { $match: { status: 'available' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json(categories.map((c) => ({ ...c, carCount: countMap[String(c._id)] || 0 })));
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

module.exports = router;
