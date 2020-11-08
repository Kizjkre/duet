const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');

/* GET users listing. */
router.get('/:room', (req, res) => {
  if (req.params.room === 'create') {
    res.redirect(`/room/${ nanoid(10) }`);
  }
  res.render('room', { activkey: process.env.ACTIVKEY, peer: process.env.PEER_PORT || 3001 });
});

module.exports = router;
