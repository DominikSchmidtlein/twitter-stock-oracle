function renderTweetChart(data) {
  var ctx = document.getElementById("tweetChart");
  var tweetChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(x => x.date),
      datasets: [{
        label: '# of tweets',
        data: data.map(x => x.tweet_count),
        borderWidth: 1
      }]
    }
  });
};
