var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { domain: '1-800-MEME', layout: 'layout.hbs' });
});

module.exports = router;
