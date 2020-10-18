const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/:room', (req, res) => {
  res.render('room', { room: req.params.room });
});

module.exports = router;
