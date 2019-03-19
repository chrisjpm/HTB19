var express = require('express');
const Gfycat = require('gfycat-sdk');
var fs = require('fs');
var request = require('request');

var Jimp = require('jimp');
var gm = require('gm');
var router = express.Router();
var gfycat = new Gfycat({clientId: "2_ObQOfp", clientSecret: "rQsWNDcmEXsXh2uiy5kkR0TKv5TiX63Qyhp3c4_F2JqF20avE53f6wm2tinq2bHt"});


const Search = require('azure-cognitiveservices-imagesearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let serviceKey = "f148ccc669144780a3ce3bee25d7f8a0";

//instantiate the image search client
let credentials = new CognitiveServicesCredentials(serviceKey);
let imageSearchApiClient = new Search(credentials);

var wefuckedup = "http://www.quickmeme.com/img/05/0554a12c6f1393537ee7ecf2279fc88cb5361d81d7c48ecfb53705dd9a4ea2e1.jpg";
var memesDict = {};
var prodReadyMemes = [];
var acceptableMemes = ["deepfried","classic","animated"];

const Nexmo = require('nexmo');


var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speechToText = new SpeechToTextV1({
  iam_apikey: "S0vp4jZJOsaGZEzCkbpcCHQ_soV31nMID3SmqzpcJ54r",
  url: 'https://gateway-lon.watsonplatform.net/speech-to-text/api'
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
  res.render('index', { domain: '1-800-MEME', layout: 'layout.hbs', memes: prodReadyMemes});
});





const onInboundCall = (request, response) => {
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Amy',
      text: 'Whats up dog, its ya boy one eight hundred meme. Imma ask you what meme you want. What can I do you for? Animated or deep fried'
    },
    {
      action: 'record',
      endOnSilence : 3,
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/type`
        ],
      eventMethod: 'GET'
  },
    {
      action: 'talk',
      voiceName: 'Russell',
      text: 'Sick homie can do, what picture do you want in the meme, it can be anything?'
    },
    {
      action: 'record',
      endOnSilence : 3,
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/search`
        ],
      eventMethod: 'GET'
    },
    {
      action: 'talk',
      voiceName: 'Russell',
      text: 'This is shaping up to be a hearty meme bruh, if you dont want text hang up. If you do then say the top text then pause until the beep then say the bottom text.'
    },
    {
      action: 'record',
      endOnSilence : 3,
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/toptext`
        ],
      eventMethod: 'GET'
    },
    {
      action: 'record',
      endOnSilence : 3,
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/bottomtext`
        ],
      eventMethod: 'GET'
    }

  ]

  response.json(ncco);
}


function maybeSearch(conversation_uuid){
    if(memesDict[conversation_uuid].tracker != 0){
        console.log("Not ready yet");
        return setTimeout(function(){maybeSearch(conversation_uuid)}, 5000);
    }

    if(memesDict[conversation_uuid].type == "animated" && memesDict[conversation_uuid].search != ""){
        getGif(memesDict[conversation_uuid].search , function(data){
            memesDict[conversation_uuid].image = data;

            if(memesDict[conversation_uuid].toptext && memesDict[conversation_uuid].bottomtext){
                caption(conversation_uuid, function(captionedImg){
                    memesDict[conversation_uuid].image = captionedImg;
                    prodReadyMemes.push(memesDict[conversation_uuid]);
                });
            }else{
                prodReadyMemes.push(memesDict[conversation_uuid]);
            }
        });
    }

    if(memesDict[conversation_uuid].type == "deepfried" &&  memesDict[conversation_uuid].search != ""){
        bingSearch(memesDict[conversation_uuid].search, function(img){
            deepFry(img, function(deepfriedmeme){
                memesDict[conversation_uuid].image = deepfriedmeme;

                if(memesDict[conversation_uuid].toptext && memesDict[conversation_uuid].bottomtext){
                    caption(conversation_uuid, function(captionedImg){
                        memesDict[conversation_uuid].image = captionedImg;
                        prodReadyMemes.push(memesDict[conversation_uuid]);
                    });
                }else{
                    prodReadyMemes.push(memesDict[conversation_uuid]);
                }
            });
        });
    }


    if(memesDict[conversation_uuid].type == "classic" &&  memesDict[conversation_uuid].search != ""){
        bingSearch(memesDict[conversation_uuid].search, function(img){
            memesDict[conversation_uuid].image = img;

            if(memesDict[conversation_uuid].toptext && memesDict[conversation_uuid].bottomtext){
                caption(conversation_uuid, function(captionedImg){
                    memesDict[conversation_uuid].image = captionedImg;
                    prodReadyMemes.push(memesDict[conversation_uuid]);
                });
            }else{
                prodReadyMemes.push(memesDict[conversation_uuid]);
            }
        });
    }
}

const onRecordingType = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  const conversation_uuid = request.query.conversation_uuid;
  console.log(`Recording URL = ${recording_url}`);

  openRecording(conversation_uuid);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000',
            keywords: ['animated','deep fried','classic'],
            keywords_threshold: 0.1
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              //console.log(JSON.stringify(res, null, 2));
              if(res.results.length >= 1){
                  if(res.results.keywords_result){
                       memesDict[conversation_uuid].type = res.results.keywords_result;
                  }else{
                       memesDict[conversation_uuid].type = res.results[0].alternatives[0].transcript.replace(" ","");
                  }

                  if(!(memesDict[conversation_uuid].type in acceptableMemes)){
                      memesDict[conversation_uuid].type = "deepfried";
                  }

              }else{
                  memesDict[conversation_uuid].type == "deepfried";
              }
              closeRecording(conversation_uuid);
              console.log(memesDict);
              //maybeSearch(conversation_uuid);
          });

      }
    });

  response.status(204).send();
}

const onRecordingSearch = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  const conversation_uuid = request.query.conversation_uuid;
  console.log(`Recording URL = ${recording_url}`);

  openRecording(conversation_uuid);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000',
            profanity_filter: "false"
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              //console.log(JSON.stringify(res, null, 2));
              if(res.results.length >= 1){
                  memesDict[conversation_uuid].search = res.results[0].alternatives[0].transcript;
              }else{
                 memesDict[conversation_uuid].search = "we fucked up";
              }

              closeRecording(conversation_uuid);
              console.log(memesDict);
              //maybeSearch(conversation_uuid);
          });

      }
    });

  response.status(204).send();
}

const onRecordingTopText = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  const conversation_uuid = request.query.conversation_uuid;

  openRecording(conversation_uuid);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000',
            profanity_filter: "false"
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              //console.log(JSON.stringify(res, null, 2));
              if(res.results.length >= 1){
                  memesDict[conversation_uuid].toptext = res.results[0].alternatives[0].transcript;
              }else{
                 memesDict[conversation_uuid].toptext = "";
              }

              closeRecording(conversation_uuid);
              console.log(memesDict);
             // maybeSearch(conversation_uuid);
          });

      }
    });

  response.status(204).send();
}


const onRecordingBottomText = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  const conversation_uuid = request.query.conversation_uuid;

  openRecording(conversation_uuid);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000',
            profanity_filter: "false"
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              //console.log(JSON.stringify(res, null, 2));
              if(res.results.length >= 1){
                  memesDict[conversation_uuid].bottomtext = res.results[0].alternatives[0].transcript;
              }else{
                 memesDict[conversation_uuid].bottomtext = "";
              }

              closeRecording(conversation_uuid);
              console.log(memesDict);
              //maybeSearch(conversation_uuid);
          });

      }
    });

  response.status(204).send();
}



router.get('/answer', onInboundCall);
router.get('/recording/type', onRecordingType);
router.get('/recording/search', onRecordingSearch);
router.get('/recording/toptext', onRecordingTopText);
router.get('/recording/bottomtext', onRecordingBottomText);

router.get('/event', function(req, res) {
  const conversation_uuid = req.query.conversation_uuid;
  const eventName = req.query.status;
  console.log("EV:" + eventName);
  if(eventName == "started"){
    memesDict[conversation_uuid] = {};
    memesDict[conversation_uuid].phone = req.query.from;
    memesDict[conversation_uuid].ts = req.query.timestamp;
  }

  if(eventName == "completed"){
      maybeSearch(conversation_uuid);
  }

});

router.get('/meme', function(req, res, next) {
  searchTerm = req.query.s;
  //res.send("<html><body><img src='"+data+"'></body></html>");
  // getGif(searchTerm, function(data){
  //     //res.send("<html><body><img src='"+data+"'></body></html>");
  //     captionImg("public/imgs/4d7.png", "Bazinga", false, function(image){
  //         res.send("<html><body><img src='"+image+"'></body></html>");
  //     });
  // });
});

function getGif(search,callback){
    console.log("Finding gif with search term: " + search);

    let options = {
      search_text: search,
      count: 1,
      first: 1
    };

    gfycat.search(options).then(data => {
      console.log('gfycats', data.gfycats[0].max5mbGif);
      return callback(data.gfycats[0].max5mbGif);
    });
}

function openRecording(conversation_uuid){
    var soFar = 0;
    if(memesDict[conversation_uuid].tracker){
        soFar = memesDict[conversation_uuid].tracker;
    }

    memesDict[conversation_uuid].tracker = soFar + 1;
}

function closeRecording(conversation_uuid){
    var soFar = 0;
    if(memesDict[conversation_uuid].tracker){
        soFar = memesDict[conversation_uuid].tracker;
    }

    memesDict[conversation_uuid].tracker = soFar - 1;
}

function deepFry(upload, callback) {
  Jimp.read('public/res/noise.jpg', (err, noise) => {

    Jimp.read(upload, (err, img) => {
      if (err) throw err;
      var filename = 'public/res/'+new Date().getTime()+"."+img.getExtension();
      img
        .quality(90)
        .contrast(0.6)
        .brightness(-0.1)
        .posterize(6)
        .color([
          { apply: 'saturate', params: [60] }
        ])
        .convolute([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]])
        .write(filename, callback(filename)); // save
    });
  });
}

function caption(conversation_uuid, callback){
    var imageToCaption = memesDict[conversation_uuid].image;
    var imageTopText = memesDict[conversation_uuid].toptext;
    var imageBottomText = memesDict[conversation_uuid].bottomtext;

    Jimp.read(imageToCaption, (err, img) => {
      if (err){
          console.log("I just shit my pants");
          return setTimeout(function() { caption(conversation_uuid, callback) }, 6000);
      }
      Jimp.loadFont('public/fonts/Impact.fnt').then(font => {
        if (err) throw err;
        var filename = 'public/res/'+new Date().getTime()+"."+img.getExtension();
        img
          .print(
            font,
            0,
            0, {
              text: imageTopText,
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
                  text: imageBottomText,
                  alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                  alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                },
                img.bitmap.width
              );
            }
          )
          .write(filename, callback(filename));
      });
    });
}

//---------------------------
//bing image search testing |
//---------------------------

//searchTerm = "Obama";


function bingSearch(searchTerm, callback){
    imageSearchApiClient.imagesOperations.search(searchTerm, function (err, result, request, response) {
     if (err) throw err;
        imageResults = result;
        if (imageResults == null) {
          console.log("No image results were found. We fucked up");
          callback(wefuckedup);

        } else {
          //console.log(`Total number of images returned: ${imageResults.value.length}`);
          let firstImageResult = imageResults.value[0];
          //display the details for the first image result. After running the application,
          //you can copy the resulting URLs from the console into your browser to view the image.
          //console.log(`Total number of images found: ${imageResults.value.length}`);
          //console.log(`Copy these URLs to view the first image returned:`);
          //console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
          //console.log(`First image content url: ${firstImageResult.contentUrl}`);

          callback(firstImageResult.contentUrl);
        }
    });
}



module.exports = router;
