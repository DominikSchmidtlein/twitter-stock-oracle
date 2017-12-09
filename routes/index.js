var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var request = require('request');
var url = require('url');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  // bearer_token: process.env.TWITTER_BEARER_TOKEN
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

/* GET home page. */

router.get('/', function(req, res, next) {
  var search = `${req.query.search}`;

  // search company stock symbol
  request({
    url: 'http://d.yimg.com/autoc.finance.yahoo.com/autoc',
    qs: { query: search, region: 1, lang: 'en' }
  }, function(error, response, body) {
    if (error) throw error;
    var symbol = JSON.parse(body).ResultSet.Result[0].symbol;
    let q = search + " filter:verified";

    // search user by input query
    client.get('users/search', { q, count: 5 }, function(error, body, response) {
      if (error) throw error;
      let t_account = body.reduce((a, b) => a.followers_count > b.followers_count ? a : b);
      var company = t_account.name;
      var handle = t_account.screen_name;
      let q = `from:${handle}`;

      // search tweets by input company's handle
      searchTweets('search/tweets', { q, count: 100 }, function(tweets) {
        res.render('index', {
          search,
          symbol,
          company,
          handle,
          count: tweets.length
        });
      });
    });
  });
});

// get all the pages of tweets
function searchTweets(urlString, params, callback, tweets = []) {
  client.get(urlString, params, function(error, body, response) {
    if (error) throw error;
    tweets.push(...body.statuses);
    let next = body.search_metadata.next_results;
    if (next) { // more tweets available
      params.max_id = url.parse(next, true).query.max_id;
      searchTweets(urlString, params, callback, tweets);
    } else { // no more tweets
      callback(tweets);
    }
  });
}

module.exports = router;
