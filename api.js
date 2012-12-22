var express = require('express'),
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
app.get('/v1/banks', getBanks)
app.get('/v1/currencies', getCurrencies)
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

function getBanks(req, res){
    var response = {
        status: "ok",
        banks: cache['banks']
    }
    res.jsonp(response)
}

function getCurrencies(req, res){
    var response = {
        status: "ok",
        currencies: cache['currencies']
    }
    res.jsonp(response)
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
    banks.forEach(function(bank){
        var id = bank.id
        
        for (var prop in bank){
            cache['banks']
        }
    
        // discard crawling details and id, which is used as key
        delete bank.selector
        delete bank.id
        cache['banks'][id] = bank
    })
    
    // prepare currencies API response object data
    // cache['currencies'] = currencyMap
    // for (var key in currencyMap){
    //     for (var prop in currencyMap[key]){
    //         cache['currencies'][key][prop] = currencyMap[key][prop]
    //     }
    //     // cache['currencies'][key] = currencyMap[key]
    // 
    //     // discard matching pattern
    //     // delete cache['currencies'][key].pattern
    // }
})()

app.listen(port, function() {
    console.log('API listening on:', port);
});
