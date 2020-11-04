const express = require('express');
const router = express.Router();
const nanoid = require('nanoid');

/* GET home page. */
router.get('/', (req, res) => {
  // res.render('index');
  res.redirect(`/room/${ nanoid(10) }`);
});

module.exports = router;
