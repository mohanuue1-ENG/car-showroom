const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings  (public showroom information)
router.get('/', async (req, res) => {
  const s = (await Settings.findOne({ key: 'main' })) || new Settings({ key: 'main' });
  res.json({
    showroomName: s.showroomName,
    tagline: s.tagline,
    supportEmail: s.supportEmail,
    supportPhone: s.supportPhone,
    address: s.address,
    currency: s.currency,
    socials: { instagram: s.instagramUrl, facebook: s.facebookUrl, twitter: s.twitterUrl },
  });
});

module.exports = router;
