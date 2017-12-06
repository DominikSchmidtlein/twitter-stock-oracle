var express = require('express');
var router = express.Router();
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

var count = 100;
var tweetCount = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  var q = `${req.query.search}`;
  getTweets('search/tweets', { q, count, result_type: 'popular' }, () => displayTweets(res, req.query.search));
});

function getTweets(url, params, callback) {
  client.get(url, params, function(error, tweet, response) {
    if (error) throw error;
    tweetCount += tweet.statuses.length;
    if (tweet.search_metadata.next_results) { // more tweets available
      params.max_id = tweet.search_metadata.next_results.match(/max_id=(\d{18})&/)[1];
      getTweets(url, params, callback);
    } else { // no more tweets
      callback();
    }
  });
}

function displayTweets(res, search) {
  res.render('index', { title: 'Express', search, count: tweetCount });
}

module.exports = router;
