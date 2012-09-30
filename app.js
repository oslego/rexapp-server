var cronJob = require('cron').CronJob,
    pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev',
    port = process.env.PORT || 3000,
    crawler = require('./crawler.js'),
    client;
    
client = new pg.Client(connectionString);
client.connect();

// client.query({
//   name: 'insert rate',
//   text: "INSERT INTO rates(id, curr, buy, sell, date) values($1, $2, $3, $4, $5)",
//   values: ['George', 70, new Date(1946, 02, 14)]
// })

// query.on('end', function() { client.end(); });

var job = new cronJob({
    // Runs once an hour, between 7 and 18, every day of the week
    cronTime: '0 0 7-18 * * 1-7',
    onTick: function() {
        crawler.crawl()
    },
  start: true,
  timeZone: "Europe/Bucharest"
});
job.start();
    