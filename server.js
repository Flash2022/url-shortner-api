const express = require('express')
const mongoose = require('mongoose')
const ReRegExp = require('reregexp').default
const ShortUrl = require('./model/shortUrl')
const urlExists = require("url-exists")
const connectDB = require('./config/db');
const app = express()
const regExpStr = "^[0-9a-zA-Z_]{6}$"
const defaultcheck = new ReRegExp(/[0-9a-zA-Z_]{4,}/)//wrong names


//mongoose.connect('mongodb://localhost/urlShort', {
//  useNewUrlParser: true, useUnifiedTopology: true
//})
connectDB();
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }))


app.post('/shorten', async(req, res) => {
  let shortcodes = "";
  let long = req.body.url;
  let eurl;
  urlExists(req.body.url, function(err, exists) {
     eurl=exists
  console.log("url checked");
});
  if (req.body.url.length == 0 ||  eurl == false) {
    return res.status(400).json("URL does not exist or not provided")
  } else {
    if (req.body.shortcode.length > 0) {
      //checking 
     // let matched = mineregexcheck.test(req.body.shortcode);
      let matched = new RegExp(regExpStr).test(req.body.shortcode) 
      console.log("length > 0 checked")
      if (matched == false) {  
        console.log("not matched with regex")
        return res.status(422).json("shortcode does not met with regex")
      }else{
        console.log("regex match passed")
        if ( await ShortUrl.findOne({ short: req.body.shortcode })) {
          console.log("already exist checked")
          return res.status(409).json("Shortcode already in use")
        }else{
          ShortUrl.create({
            full: long,
            short: req.body.shortcode,
            count:0,
            datetime: new Date(),
            lastseen: new Date(),
          })
          console.log("db created")
          let answer = {
            shortcode: req.body.shortcode
          }
          return res.send(answer);

        }
      }
    }else if(req.body.shortcode.length == 0){
      shortcodes = defaultcheck.build();
      console.log("as length == 0  we are creating our own"  + shortcodes);


        ShortUrl.create({
          full: long,
          short: shortcodes,
          count:0,
          datetime: new Date(),
          lastseen: new Date(),
        })
        console.log("db created")
        let answer = {
          shortcode: shortcodes
        }
        return res.send(answer);

      }


    
  

  }

})

app.get('/:shortUrl', async(req, res) => {
  const shortUrl =await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404).json("file not found")

 // let tempurl=shortUrl.full;
  //console.log(tempurl)
  
  shortUrl.lastseen=new Date();
  shortUrl.count++;
  shortUrl.save();


  const respo = {
    status: 302,
    Location: shortUrl.full,

  }

  res.send(respo)
})

app.get('/:shortUrl/stats', async(req, res) => {
  const shortUrl =await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404).json("file not found")

  const respo = {
    startDate :shortUrl.datetime,
    lastseenDate: shortUrl.lastseen,
    redirectCount:shortUrl.count,

  }

  res.status(200).send(respo)
  
})


app.listen(process.env.PORT || 5000);