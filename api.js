var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    rateStore = require('./ratestore.js').RateStore,
    banks = require("./lib/bank-list.js").banks,
    worker = require("./worker.js"),
    cache = {};

app.use(express.compress())
app.get('/', function(req, res) {
    res.send("No API here")
});

// endpoint to ping to prevent Heroku from idling
app.get('/ping', handlePing)

app.get('/v1/banks', getBanks);
app.get('/v1/rates', getRates);
app.get('/v1/rates/:currency', getRates);

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
    var response = {}

    if (!cache['banks']){
        cache['banks'] = {}

        banks.slice(0).forEach(function(bank){
            var id = bank.id

            // discard crawling details and id, which is used as key
            delete bank.selector
            delete bank.id

            cache['banks'][id] = bank
        })
    }

    response.status = "ok"
    response.banks = cache['banks']

    res.jsonp(response)
}

/* Heroku idles any web process with inactivity for 1 hour
Ping is called regularly by a remote worker to keep the web process alive */
function handlePing(req, res){
    var response = { ping: new Date } 
    res.jsonp(response)
}

app.listen(port, function() {
    console.log('API listening on:', port);
});
