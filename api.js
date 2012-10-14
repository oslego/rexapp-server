var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    rateStore = require('./ratestore.js').RateStore,
    cache = null;

app.use(express.compress())
app.get('/', function(req, res) {
    res.send("No API here")
});

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

app.listen(port, function() {
    console.log('API listening on:', port);
});
