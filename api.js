var express = require('express'),
    _ = require('underscore'),
    app = express(),
    port = process.env.PORT || 3000,
    rateStore = require('./ratestore.js').RateStore,
    banks = require("./lib/bank-list.js").banks,
    currencyMap = require("./lib/currency.js").currency.map,
    cache = {};
    
// loading crawler worker in the API's web process because Heroku wants money for another dyno to run the worker
require("./worker.js")

app.use(express.compress())

app.get('/', handleInvalidEndpoint);

// ping here more than once an hour to prevent Heroku from idling the web process
app.get('/ping', handlePing)
app.get('/v1/banks', getResponse('banks'))
app.get('/v1/currencies', getResponse('currencies'))
app.get('/v1/config', getResponse('config'))
app.get('/v1/rates', getRates)
app.get('/v1/rates/:currency', getRates)

function getRates(req, res){
    var curr = req.params.currency ? req.params.currency.toUpperCase() : undefined,
        response = {
            status: "ok"
        }
    
    function output(store){
        if (store){
            response.updated_on = store.updated_on
            response.rates = store.rates
        }
        else{
            response.status = "error",
            response.message = (curr)
                ? "Invalid currency code."
                : "No data available."
        }

        res.jsonp(response)
    }
    
    curr ? rateStore.get(curr, output) : rateStore.getAll(output)
}

/* Return a response from the cache */
function getResponse(key){
    return function(req, res){
        
        var data = cache[key],
            response = {}
        
        if (data){
            response.status = "ok"
            response[key] = data
        }
        else{
            response.status = "error"
        }
        
        res.jsonp(response)
    }
}

/* Heroku idles any web process with inactivity for 1 hour
Ping is called regularly by a remote worker to keep the web process alive */
function handlePing(req, res){
    var response = { ping: new Date } 
    res.jsonp(response)
}

function handleInvalidEndpoint(req, res){
    // TODO: investigate API discoverability
    res.send("No API here")
}

// init
(function(){
    // prepare banks API response object data
    cache['banks'] = {}

    _.each(banks, function(bank){
        // copy object without keys
        cache['banks'][bank.id] = _.omit(bank, ['selector', 'id'])
    })

    // prepare currencies API response object data
    cache['currencies'] = {}

    _.each(currencyMap, function(currency){
        cache['currencies'][currency.code] = _.omit(currency, ['pattern'])
    })

    // convenience API for clients
    cache['config'] = {
        "banks": cache['banks'],
        "currencies": cache['currencies']
    }
    
})()

app.listen(port, function() {
    console.log('API listening on:', port);
});
