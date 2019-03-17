var express = require('express');
var router = express.Router();
var Jimp = require('jimp');



router.get('/', function(req, res, next) {

  Jimp.read('public/res/noise.jpg', (err, noise) => {
    Jimp.read('public/res/iloveit.jpg', (err, img) => {
      if (err) throw err;
      img
        .quality(90)
        .contrast(0.6)
        .brightness(-0.1)
        .posterize(6)
        .color([
          { apply: 'saturate', params: [60] }
        ])
        .convolute([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]])
        .write('public/res/iloveit2.jpg'); // save
    });
  });

  res.render('test', {
    domain: '1-800-MEME',
    layout: 'layout.hbs'
  });
});



module.exports = router;
