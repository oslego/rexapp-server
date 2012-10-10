var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    crawler = require('./crawler.js'),
    rateStore = require('./ratestore.js').RateStore,
    cronJob = require('cron').CronJob,
    job;

// all environments, using env.NODE_ENV to match
app.configure(function(){
    app.set('timezone', 'Europe/Bucharest')
})

// development only
app.configure('development', function(){
    app.set('crontime', '*/5 * * * * 0-6');
    
})

// production only
app.configure('production', function(){
    // Runs once every 30 minutes, between 7AM and 6PM, every day of the week
    app.set('crontime', '0 */30 7-18 * * 0-6');
})

crawler.on('start', function(){
    // results = []
})

crawler.on("result", function(data){
    rateStore.add(data)
})

crawler.on("done", function(data){
    rateStore.aggregate()
})

app.get('/', function(req, res) {
    res.send("No API here")
});

app.get('/rates', getRates);
app.get('/rates/:currency', getRates);

function getRates(req, res){
    var cache = rateStore.getAll(),
        curr = req.params.currency ? req.params.currency.toUpperCase() : undefined,
        rates,
        response = {
            status: "ok"
        };

    if (cache){
        response.updated_on = cache.updated_on

        if (curr){
            rates = rateStore.get(curr)

            if (rates){
                response.rates = rates
            }
            else{
                response.status = "error",
                response.message = "Invalid currency code."
                delete response.updated_on
            }
        }
        else{
            // drown them in data!
            response.rates = cache.rates
        }
    }
    else{
        response.status = "warning",
        response.message = "Update pending. Come back later"
    }
    
    res.jsonp(response);
}

job = new cronJob({
    cronTime: app.get('crontime'),
    onTick: function() {
        console.log('tick')
        crawler.init()
    },
    start: true,
    timeZone: "Europe/Bucharest"
});

app.listen(port, function() {
    
    rateStore.init(function(store){
        if (!store.get('EUR')){
            // cold start, need data
            crawler.init()
        }
    })

    console.log('Listening on:', port);
});