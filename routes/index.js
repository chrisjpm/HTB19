var express = require('express');
const Gfycat = require('gfycat-sdk');
var fs = require('fs');
var request = require('request');

var Jimp = require('jimp');
var gm = require('gm');
var router = express.Router();
var gfycat = new Gfycat({clientId: "2_ObQOfp", clientSecret: "rQsWNDcmEXsXh2uiy5kkR0TKv5TiX63Qyhp3c4_F2JqF20avE53f6wm2tinq2bHt"});


gfycat.authenticate((err, data) => {
  //Your app is now authenticated
  console.log('token', gfycat.token);
})

router.get('/', function(req, res, next) {
  res.render('index', { domain: 'HTB19: ', title: 'Home', layout: 'layout.hbs' });
});





const onInboundCall = (request, response) => {
  const ncco = [
    {
      action: 'talk',
      text: 'What ma dawg, hit me at the tone then pound that hash brutha'
    },
    {
      action: 'record',
      endOnKey : '#',
      beepStart: 'true',
      eventUrl: [
        `${request.protocol}://${request.get('host')}/recording`
      ]
    },
    {
      action: 'talk',
      text: 'Peace homie.'
    }
  ]

  response.json(ncco)
}


const onRecording = (request, response) => {
    
  const recording_url = request.body.recording_url
  console.log(`Recording URL = ${recording_url}`)

  response.status(204).send()
}

router.get('/answer', onInboundCall);
router.post('/recording', onRecording);



router.get('/meme', function(req, res, next) {
  searchTerm = req.query.s;

  getGif(searchTerm, function(data){
      //res.send("<html><body><img src='"+data+"'></body></html>");
      captionImg("public/imgs/4d7.png", "Bazinga", false, function(image){
          res.send("<html><body><img src='"+image+"'></body></html>");
      });
  });
});

function getGif(search,callback){
    console.log("Finding gif with search term: " + search);

    let options = {
      search_text: search,
      count: 1,
      first: 1
    };

    gfycat.search(options).then(data => {
      console.log('gfycats', data.gfycats[0].max2mbGif);
      return callback(data.gfycats[0].max2mbGif);
    });
}

function captionImg(img, caption, top, callback){
    // Jimp.read(img, function(err, image){
    //       if (err) throw err;
    //       console.log("1");
    //       Jimp.loadFont(Jimp.FONT_SANS_32_BLACK, function(font){
    //           // load font from .fnt file
    //           console.log(image.getExtension())
    //           //x = image.bitmap.width / 2;
    //           //y = 0;
    //
    //           x = 300;
    //           y = 300;
    //           if(!top){
    //               //y = image.bitmap.height - 20;
    //           }
    //           filename = new Date().getTime() + "." + image.getExtension();
    //           console.log("2");
    //           image.print(font, x, y, {
    //                text: caption,
    //                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    //                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    //            }).write("public/imgs/"+filename, function(){callback(filename)});
    //         });
    //     });
        filename = new Date().getTime() + "." + img.split(".")[1];
        console.log(filename);
        gm(img).drawText(0,0,caption).write("public/imgs/"+filename,
            function(err){
                console.log(err);
               callback(filename);
           });
}



module.exports = router;
