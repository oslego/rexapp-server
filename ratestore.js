var pg = require('pg'),
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev',
    noop = function() {},
    isFunction = function(fn){
        return typeof fn === "function"
    }

function getData(callback, date){
    var updated_on = date || new Date,
        callback = isFunction(callback) ? callback : noop,
        client = new pg.Client(connectionString),
        numRows = 0,
        query;

    query = client.query('SELECT data FROM rates WHERE updated_on = $1', [updated_on])

    query.on('row', function(result){
        numRows++;
        callback.call(null, JSON.parse(result.data))
    })

    query.on('end', function(err){
        // if no rows return it means we don't have results for the specified date
        if (numRows == 0){
            // get the day before
            updated_on.setDate(updated_on.getDate() - 1)

            // attempt to get the day before's data
            getData.call(this, callback, updated_on)
        }
    })

    client.on('drain', function(){
        client.end()
    })

    client.connect(function(err){
        if (err){
            console.error("DB connection fail", err)
        }
    })
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
    var _self = this,
        _expires = 1000 * 60, // cache expiration in milliseconds
        _pool = [] // rate data before aggregating and storing into the db

    function _getControl(rate){
        if (!_self.cache || !_self.cache.rates || !_self.cache.rates[rate.currency]){
            return
        }

        return _self.cache.rates[rate.currency].filter(function(item){
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

    function setCache(data){
        _self.cache = data

        // flush the cache after a set time
        setTimeout(function(){
            _self.cache = null
        }, _expires)
    }

    // init
    getData(function(data){
        if (data){
            setCache(data)
        }
    })

    return {
        // cache of DB results
        cache: null,

        add: function(rateData){
            _pool.push(rateData)
            return this
        },

        get: function(currency, callback){
            var result

            this.getAll(function(data){
                if (!data || !data.rates || !data.rates[currency]){
                    result = null
                }
                else{
                    result = {
                        updated_on: data.updated_on,
                        rates: data.rates[currency]
                    }
                }
                callback.call(null, result)
            })

            return this
        },

        getAll: function(callback){

            if (typeof callback !== 'function'){
                return this
            }

            // Use cache if available to reduce load on DB
            if (_self.cache){
                callback.call(null, _self.cache)
            }
            else{
                // Hit the DB
                getData(function(data){
                    if (data){
                        setCache(data)
                        callback.call(null, data)
                    }
                })
            }

            return this
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

            _self.cache = obj
            _pool = []
            this.persist()

            return this
        },

        persist: function(){
            storeData(JSON.stringify(_self.cache))
            return this
        }
    }
}

module.exports.RateStore = new RateStore
