var cronJob = require('cron').CronJob,
    pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev',
    port = process.env.PORT || 3000,
    crawler = require('./crawler.js'),
    client;
    
client = new pg.Client(connectionString);

crawler.on('start', function(){
    client.connect()
})

crawler.on("result", function(data){
    client.query({
      name: 'insert rates',
      text: "INSERT INTO rates(id, currency, buy, sell, date) values($1, $2, $3, $4, CURRENT_TIMESTAMP)",
      values: [data.id, data.currency, data.buy, data.sell]
    })
})

crawler.on("done", function(data){
    client.end()
})

var job = new cronJob({
    // Runs once an hour, between 7 and 18, every day of the week
    cronTime: '0 0 7-18 * * 1-7',
    // cronTime: '*/10 * * * * 1-7',
    onTick: function() {
        crawler.init()
    },
    start: true,
    timeZone: "Europe/Bucharest"
});