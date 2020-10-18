const express = require('express');
const router = express.Router();
const shortid = require('shortid');

/* GET home page. */
router.get('/', (req, res) => {
  // res.render('index');
  res.redirect(`/room/${ shortid.generate() }`);
});

module.exports = router;
