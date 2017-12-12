function renderCharts(data) {
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

  var ctx2 = document.getElementById("stockChart");
  var stockChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: data.map(x => x.date),
      datasets: [{
        label: '# of trades',
        data: data.map(x => x.trading_volume),
        borderWidth: 1
      }]
    }
  });
};
