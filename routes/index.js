var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { domain: 'HTB19: ', title: 'Home', layout: 'layout.hbs' });
});

module.exports = router;
