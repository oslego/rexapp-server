var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    crawler = require('./crawler.js'),
    cronJob = require('cron').CronJob,
    fs = require('fs'),
    filename = "rates.json",
    _cache = null,
    job,
    results = [];

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
    results = []
})

crawler.on("result", function(data){
    results.push(data)
})

crawler.on("done", function(data){
    setCache(buildResponse(results))
})

function setCache(data){
    _cache = data
    
    fs.writeFile(filename, JSON.stringify(data), function(err){
        if (err) throw err;
        console.log("write cache", _cache.updated_on)
    })
}

function getCache(){
    return _cache
}

function buildResponse(rates){
    var resp = {
        updated_on: new Date,
        rates: {}
    }

    rates.forEach(function(rate, index){
        var rates = resp.rates,
            control = getControl(rate)

        if (!rates[rate.currency]){
            rates[rate.currency] = []
        }

        rate.updated_on = control ? getUpdatedOn(rate, control) : new Date

        rates[rate.currency].push(rate)
    }) 
    
    return resp
}

function getControl(rate){
    var cache = getCache()
    if (!cache || !cache.rates || !cache.rates[rate.currency]){
        return
    }
    
    return cache.rates[rate.currency].filter(function(item){
        return item.id === rate.id
    }).pop()
}

function getUpdatedOn(rate, control){
    function equals(a, b){
        return a === b
    }
    
    return ( equals(rate.sell, control.sell) && equals(rate.buy, control.buy) ) 
        ? control.updated_on
        : +new Date
}

app.get('/', function(req, res) {
    res.send("No API here")
});

app.get('/rates', getRates);
app.get('/rates/:currency', getRates);

function getRates(req, res){
    var cache = getCache(),
        curr = req.params.currency,
        data = {
            status: "ok"
        };
        
    if (cache){
        data.updated_on = cache.updated_on

        if (curr){
            curr = curr.toUpperCase()
            if (cache.rates[curr]){
                data.rates = cache.rates[curr]
            }
            else{
                data.status = "error",
                data.message = "Invalid currency code."
                delete data.updated_on
            }
        }
        else{
            // drown them in data!
            data.rates = cache.rates
        }
    }
    else{
        data.status = "warning",
        data.message = "Update pending. Come back later"
    }
    
    res.jsonp(data);
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
    fs.readFile(filename, function (err, data) {
        if (err){
            crawler.init()
        }
        else{
            setCache(JSON.parse(data))
            console.log("new cache: ", getCache().updated_on)
        }
    })
    console.log('Listening on:', port);
});