var pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev',
    noop = function() {},
    isFunction = function(fn){
        return typeof fn === "function"
    }

function getData(callback){
    var updated_on = new Date,
        callback = isFunction(callback) ? callback : noop,
        client = new pg.Client(connectionString),
        query;

    query = client.query('SELECT data FROM rates WHERE updated_on = $1', [updated_on])
    query.on('row', function(result){
        callback.call(null, result.data)
    })
      
    client.on('drain', function(){
        client.end()
    })
    
    client.connect()
}

function storeData(data, callback){
    var updated_on = new Date,
        callback = isFunction(callback) ? callback : noop,
        client = new pg.Client(connectionString),
        query;
        
    // updated_on is a UNIQUE field in the DB. It is not necessary to use LIMIT in the query.
    query = client.query('UPDATE rates SET data = $2 WHERE updated_on = $1', [updated_on, data], function(err, result){
        if (result.rowCount === 0){
            query = client.query('INSERT INTO rates (updated_on, data) VALUES ($1, $2)', [updated_on, data])
            query.on("row", callback)
        }
    })
    
    client.on('drain', function(){
        client.end()
    })
    
    client.connect()
}

function RateStore(){
    var _cache = null,
        _pool = [] // rate data before aggregating and storing into the db
    
    function _getControl(rate){
        if (!_cache || !_cache.rates || !_cache.rates[rate.currency]){
            return
        }

        return _cache.rates[rate.currency].filter(function(item){
            return item.id === rate.id
        }).pop()
    }

    function _getUpdatedOn(rate, control){
        
        function _equals(a, b){
            return a === b
        }

        return ( _equals(rate.sell, control.sell) && _equals(rate.buy, control.buy) ) 
            ? control.updated_on
            : +new Date
    }
    
    return {
        add: function(rateData){
            _pool.push(rateData)
            return this
        },
        
        get: function(currency){
            if (!_cache || !_cache.rates || !_cache.rates[currency]){
                return null
            }
            
            return _cache.rates[currency]
        },
        
        getAll: function(){
            return _cache
        },
        
        aggregate: function(){
            var obj = {
                updated_on: new Date,
                rates: {}
            }

            _pool.forEach(function(rate, index){
                var control = _getControl(rate)

                if (!obj.rates[rate.currency]){
                    obj.rates[rate.currency] = []
                }

                rate.updated_on = control ? _getUpdatedOn(rate, control) : new Date

                obj.rates[rate.currency].push(rate)
            })
            
            _cache = obj
            _pool = []
            this.persist()
            
            return this
        },

        init: function(callback){
            getData(function(data){
                _cache = JSON.parse(data)
                callback.call(null, this)
            }.bind(this))
            
            return this
        },

        persist: function(){
            storeData(JSON.stringify(_cache))
            return this
        }
    }
}

module.exports.RateStore = new RateStore