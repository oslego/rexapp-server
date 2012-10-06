var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    crawler = require('./crawler.js'),
    cronJob = require('cron').CronJob,
    fs = require('fs'),
    filename = "rates.json",
    cache = null,
    job,
    results = [];
    
crawler.on('start', function(){
    results = []
})

crawler.on("result", function(data){
    results.push(data)
})

crawler.on("done", function(data){
    cache = buildResponse(results)
    fs.writeFile(filename, JSON.stringify(cache), function(err){
        if (err) throw err;
        console.log("write cache", cache.updated_on)
    })
})

function buildResponse(rates){
    var resp = {
        updated_on: new Date,
        rates: {},
        sources: {}
    }

    rates.forEach(function(rate, index){
        var rates = resp.rates,
            control = getControl(rate)

        if (!rates[rate.currency]){
            rates[rate.currency] = []
        }

        rate.updated_on = control ? getUpdatedOn(rate, control) : +new Date

        rates[rate.currency].push(rate)
    }) 
    
    return resp
}

function getControl(rate){
    if (!cache || !cache.rates || !cache.rates[rate.currency]){
        return
    }
    
    return cache.rates[rate.currency].filter(function(item){
        return item.id === rate.id
    }).pop()
}

function getUpdatedOn(rate, control){
    return ( equals(rate.sell, control.sell) && equals(rate.buy, control.buy) ) 
        ? control.updated_on
        : +new Date
}

function equals(a, b){
    return a === b
}

function refresh(){
    fs.readFile(filename, function (err, data) {
        if (err) return;
        cache = JSON.parse(data)
        console.log("new cache: ", cache.updated_on)
    })
}

app.get('/', function(req, res) {
    res.send("No API here")
});

app.get('/rates', function(req, res) {
    res.jsonp(cache);
});

job = new cronJob({
    // Runs once an hour, between 7 and 18, every day of the week
    // cronTime: '0 0 7-18 * * 0-6',
    cronTime: '*/10 * * * * 0-6',
    onTick: function() {
        // crawler.init()
    },
    start: true,
    timeZone: "Europe/Bucharest"
});

app.listen(port, function() {
    refresh()
    console.log('Listening on:', port);
});