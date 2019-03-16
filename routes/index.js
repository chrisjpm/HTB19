var express = require('express');
const Gfycat = require('gfycat-sdk');
var fs = require('fs');
var request = require('request');

var Jimp = require('jimp');
var gm = require('gm');
var router = express.Router();
var gfycat = new Gfycat({clientId: "2_ObQOfp", clientSecret: "rQsWNDcmEXsXh2uiy5kkR0TKv5TiX63Qyhp3c4_F2JqF20avE53f6wm2tinq2bHt"});
const speech = require('@google-cloud/speech');


const Nexmo = require('nexmo');

const client = new speech.SpeechClient();



const file = fs.readFileSync('public/recordings/meme.raw');
const audioBytes = file.toString('base64');
console.log("audiobytes:"+  audioBytes);
// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const audio = {
  content: audioBytes,
};
const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US'
};
const requestdd = {
  audio: audio,
  config: config
};

client
.recognize(requestdd)
.then(data => {
const response = data[0];
const transcription = response.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
console.log(`Transcription: ${transcription}`);
})
.catch(err => {
console.error('ERROR:', err);
});




const nexmo = new Nexmo({
  apiKey: "fe39c276",
  apiSecret: "DHxVs4FSg5VVRUNv",
  applicationId: "9aec4610-f167-4f70-a6b9-a11e0521df56",
  privateKey: "private.key"
}, {debug: true});


gfycat.authenticate((err, data) => {
  //Your app is now authenticated
  console.log('token', gfycat.token);
});

router.get('/', function(req, res, next) {
  res.render('index', { domain: '1-800-MEME', layout: 'layout.hbs' });
});





const onInboundCall = (request, response) => {
  const ncco = [
    {
      action: 'talk',
      text: 'Whats up ma dawg, hit me at the tone then pound that hash brutha'
    },
    {
      action: 'record',
      endOnKey : '#',
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording`
        ],
      eventMethod: 'GET'
    },
    {
      action: 'talk',
      text: 'Peace homie.'
    }
  ]

  response.json(ncco)
}


const onRecording = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  console.log(`Recording URL = ${recording_url}`);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          // Reads a local audio file and converts it to base64
            const file = fs.readFileSync('public/recordings/'+recording_uuid+'.mp3');
            const audioBytes = file.toString('base64');
            console.log("audiobytes:"+  audioBytes);
            // The audio file's encoding, sample rate in hertz, and BCP-47 language code
            const audio = {
              content: audioBytes,
            };
            const config = {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'en-US'
            };
            const request = {
              audio: audio,
              config: config
            };

            // Detects speech in the audio file

            //const client = new speech.SpeechClient(function(x){
                // client.recognize(request, function(err,data){
                //     if(err){
                //         console.error('ERROR:', err);
                //     }
                //     const response = data[0];
                //     const transcription = response.results
                //       .map(result => result.alternatives[0].transcript)
                //       .join('\n');
                //     console.log(`Transcription: ${transcription}`);
                // });
            //});

        client
          .recognize(request)
          .then(data => {
            const response = data[0];
            const transcription = response.results
              .map(result => result.alternatives[0].transcript)
              .join('\n');
            console.log(`Transcription: ${transcription}`);
          })
          .catch(err => {
            console.error('ERROR:', err);
          });


      }
    });

  response.status(204).send();
}



router.get('/answer', onInboundCall);
router.get('/recording', onRecording);



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
