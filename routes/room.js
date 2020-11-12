const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');

/* GET room page. */
router.get('/:room', (req, res) => {
  if (req.params.room === 'create' || req.params.room.length !== 10) {
    res.redirect(`/room/${ nanoid(10) }`);
  }
  res.render('room', { activkey: process.env.ACTIVKEY, peer: process.env.PEER_PORT || 3001 });
});

module.exports = router;
