const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/:room', (req, res) => {
  res.render('room', { activkey: process.env.ACTIVKEY, peer: process.env.PEER_PORT || 3001 });
});

module.exports = router;
