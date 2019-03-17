var express = require('express');
const Gfycat = require('gfycat-sdk');
var fs = require('fs');
var request = require('request');

var Jimp = require('jimp');
var gm = require('gm');
var router = express.Router();
var gfycat = new Gfycat({clientId: "2_ObQOfp", clientSecret: "rQsWNDcmEXsXh2uiy5kkR0TKv5TiX63Qyhp3c4_F2JqF20avE53f6wm2tinq2bHt"});

var memesDict = {};
var prodReadyMemes = [];

const Nexmo = require('nexmo');


var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speechToText = new SpeechToTextV1({
  iam_apikey: "Ltpj8UasrJN8RoKLZVgykYZ6G-xN1zU7O9oRLPC5uYSp",
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
      text: 'Whats up my dog, do you want a gif or deep fried meme?'
    },
    {
      action: 'record',
      endOnKey : '#',
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/type`
        ],
      eventMethod: 'GET'
    },
    {
      action: 'talk',
      text: 'Peace homie, what you searching for?'
    },
    {
      action: 'record',
      endOnKey : '#',
      beepStart: 'true',
      eventUrl: [
        `https://fded1e6e.ngrok.io/recording/search`
        ],
      eventMethod: 'GET'
    }
  ]

  response.json(ncco)
}


function maybeSearch(conversation_uuid){
    if(memesDict[conversation_uuid].type == "animated" && memesDict[conversation_uuid].search != ""){
        getGif(memesDict[conversation_uuid].search , function(data){
            memesDict[conversation_uuid].image = data;
            prodReadyMemes.push(memesDict[conversation_uuid]);
        });
    }
}

const onRecordingType = (request, response) => {
  console.log(request.query);
  const recording_url = request.query.recording_url;
  const recording_uuid = request.query.recording_uuid;
  const conversation_uuid = request.query.conversation_uuid;
  memesDict[conversation_uuid] = {};
  console.log(`Recording URL = ${recording_url}`);

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000',
            keywords: ['animated','deep fried','classic'],
            keywords_threshold: 0.2
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              console.log(JSON.stringify(res, null, 2));
              memesDict[conversation_uuid].type = res.results[0].alternatives[0].transcript.replace(" ","");

              maybeSearch(conversation_uuid);
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

  nexmo.files.save(recording_url, 'public/recordings/'+recording_uuid+'.mp3', (err, res) => {
      if(err) { console.error(err); }
      else {
          var params = {
            // From file
            audio: fs.createReadStream('public/recordings/'+recording_uuid+'.mp3'),
            content_type: 'audio/mp3; rate=48000'
          };

          speechToText.recognize(params, function(err, res) {
            if (err)
              console.log(err);
            else
              console.log(JSON.stringify(res, null, 2));
              memesDict[conversation_uuid].search = res.results[0].alternatives[0].transcript;

              maybeSearch(conversation_uuid);
          });

      }
    });

  response.status(204).send();
}






router.get('/answer', onInboundCall);
router.get('/recording/type', onRecordingType);
router.get('/recording/search', onRecordingSearch);



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

//---------------------------
//bing image search testing |
//---------------------------
'use strict';
const Search = require('azure-cognitiveservices-imagesearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let serviceKey = "";
// name: 1-800-MEME
// resource group: container
// resource id: /subscriptions/d69f7527-d7d3-4fda-a954-467594fe9981/resourceGroups/container/providers/Microsoft.CognitiveServices/accounts/1-800-MEME
// key 1 f148ccc669144780a3ce3bee25d7f8a0
// key 2 21df632fbb3042769663f4a6532954cd
// subscrioption id d69f7527-d7d3-4fda-a954-467594fe9981


//the search term for the request
// let searchTerm = "why you no";
//
// //instantiate the image search client
// let credentials = new CognitiveServicesCredentials(serviceKey);
// let imageSearchApiClient = new Search.ImageSearchAPIClient(credentials);
//
// //a helper function to perform an async call to the Bing Image Search API
// const sendQuery = async () => {
//     return await imageSearchApiClient.imagesOperations.search(searchTerm);
// };
//
// sendQuery().then(imageResults => {
//     if (imageResults == null) {
//       console.log("No image results were found.");
//     } else {
//       console.log(`Total number of images returned: ${imageResults.value.length}`);
//       let firstImageResult = imageResults.value[0];
//       //display the details for the first image result. After running the application,
//       //you can copy the resulting URLs from the console into your browser to view the image.
//       console.log(`Total number of images found: ${imageResults.value.length}`);
//       console.log(`Copy these URLs to view the first image returned:`);
//       console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
//       console.log(`First image content url: ${firstImageResult.contentUrl}`);
//     }
// })
// .catch(err => console.error(err))


module.exports = router;
