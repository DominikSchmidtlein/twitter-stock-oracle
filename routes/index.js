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
  var search = req.query.search;
  if (search == undefined) {
    return res.render('index', { search: '' });
  }
  // search twitter account by input query
  let q = search + ' filter:verified';
  client.get('users/search', { q, count: 5 }, function(error, body, response) {
    if (error) throw error;
    let t_account = body.reduce((a, b) => a.followers_count > b.followers_count ? a : b);
    var company = t_account.name;
    var handle = t_account.screen_name;
    let q = `from:${handle}`;
    // search tweets by input company's handle
    searchTweets('search/tweets', { q, count: 100 }, function(tweets) {
      // search company stock symbol
      request({
        url: 'http://d.yimg.com/autoc.finance.yahoo.com/autoc',
        qs: { query: search, region: 1, lang: 'en' }
      }, function(error, response, body) {
        if (error) throw error;
        let result = JSON.parse(body).ResultSet.Result;
        if (!result.length) {
          return res.render('index', { search });
        }
        var symbol = result[0].symbol;

        // get stock chart for a month
        request({
          url: `https://api.iextrading.com/1.0/stock/${symbol}/chart`
        }, function(error, response, body) {
          if (error) throw error;
          let json = JSON.parse(body);

          // get tweet count and stock price for past week
          let sDate = new Date(tweets[tweets.length - 1].created_at);
          sDate.setHours(-sDate.getTimezoneOffset()/60, 0, 0, 0);
          let eDate = new Date(tweets[0].created_at);
          eDate.setHours(-sDate.getTimezoneOffset()/60, 0, 0, 0);

          var dates = [];
          let date = sDate;
          for (; date <= eDate; date.setDate(date.getDate() + 1)) {
            // count tweets on day
            let tweet_count = tweets.reduce(function(acc, x) {
              let d = new Date(x.created_at);
              d.setHours(-d.getTimezoneOffset()/60, 0, 0, 0);
              return acc + (+d == +date ? 1 : 0);
            }, 0);

            // get stock volume for day
            let chart = json.find(x => +new Date(x.date) == +date);
            let trading_volume = chart ? chart.volume : 0;

            dates.push({ date: new Date(date), tweet_count, trading_volume});
          }
          res.render('index', {
            search,
            symbol,
            company,
            handle,
            count: tweets.length,
            dates
          });
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
