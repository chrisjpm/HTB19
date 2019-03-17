var express = require('express');
var router = express.Router();
var Jimp = require('jimp');



router.get('/', function(req, res, next) {

  Jimp.read('public/res/noise.jpg', (err, img) => {
    if (err) throw err;
    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => {
      if (err) throw err;
      img
        .print(
          font,
          0,
          0, {
            text: 'Top text',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
          },
          img.bitmap.width,
          (err, image, {
            x,
            y
          }) => {
            img.print(
              font,
              0,
              img.bitmap.height - 40,
              {
                text: 'Bottom text',
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
              },
              img.bitmap.width
            );
          }
        )
        .write('public/res/noise2.jpg');
    });
  });

  res.render('test', {
    domain: '1-800-MEME',
    layout: 'layout.hbs'
  });
});

function deepFry(upload) {
  Jimp.read('public/res/noise.jpg', (err, noise) => {
    Jimp.read('public/res/' + upload, (err, img) => {
      if (err) throw err;
      img
        .quality(90)
        .contrast(0.6)
        .brightness(-0.1)
        .posterize(6)
        .color([{
          apply: 'saturate',
          params: [60]
        }])
        .convolute([
          [-2, -1, 0],
          [-1, 1, 1],
          [0, 1, 2]
        ])
        .write('public/res/iloveit2.jpg'); // save
    });
  });
}

module.exports = router;
