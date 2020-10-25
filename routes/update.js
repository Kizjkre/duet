const express = require('express');
const router = express.Router();

router.get('/update', (req, res) => {
  res.render('update');
});

module.exports = router;
