var port = process.env.PORT || 3000,
    environment = process.env.NODE_ENV || 'development',
    crawler = require('./crawler.js'),
    rateStore = require('./ratestore.js').RateStore,
    cronJob = require('cron').CronJob,
    job,
    config = {
        timeZone: 'Europe/Bucharest'
    };

switch(environment){
    case 'development':
        // Runs every 5 seconds, everyday
        config.cronTime = '*/5 * * * * 0-6'
    break
    
    case 'production':
        // Runs once every 30 minutes, between 7AM and 6PM, everyday
        config.cronTime = '0 */30 7-18 * * 0-6'
    break
}

crawler.on('start', function(){
    console.log('Crawl started at' + new Date)
})

crawler.on("result", function(data){
    rateStore.add(data)
})

crawler.on("done", function(data){
    console.log('Crawl ended at' + new Date)
    rateStore.aggregate()
})

job = new cronJob({
    cronTime: config.cronTime,
    timeZone: config.timeZone,
    start: true,
    onTick: function(){
        crawler.init()
    }
});

// grab fresh data on process start
job.start()
