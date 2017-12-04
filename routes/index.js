var express = require('express');
var router = express.Router();
var Twitter = require('twitter');

/* GET home page. */
router.get('/', function(req, res, next) {
  var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
  });

  client.get('search/tweets', {q: 'trump'}, function(error, tweet, response) {
    if (error) throw error;
    var tweets = tweet.statuses.map(x => x.text);
    console.log(tweets);
  });

  res.render('index', { title: 'Express' });
});

module.exports = router;
