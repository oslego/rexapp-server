var request = require('request'),
    jsdom = require("jsdom"),
    EventEmitter = require('events').EventEmitter,
    currency = require("currency.js").currency,
    banks = require("bank-list.js").banks,
    jquerySrc = 'http://code.jquery.com/jquery-1.8.1.min.js'
    
function Crawler(){
    // crawl retry queue
    this.queue = []
}

Crawler.prototype = new EventEmitter()

Crawler.prototype.init = function(first_argument) {
    var self = this

    this.emit("start")
    
    banks.forEach(function(config){

        // TODO implement retry from queue on erors
        self.queue.push({
            id: config.id,
            retryCount: 3
        })
        
        self.crawl(config)
    })
}

Crawler.prototype.crawl = function(config){
    var self = this,
        options = {
            url: config.url,
            method: "GET",
            timeout: 10000
        }
    
    request(options, function(error, response, body){
    
        if (!error && response.statusCode == 200){
            self.extractData(body, config)
        }
        else{
            self.retry(config)
        }
    
    }) 
}

Crawler.prototype.retry = function(config){
    var queueItem = this.queue.filter(function(item, index){
            return item.id === config.id
        })[0]

    if (queueItem){
        if (queueItem.retryCount){
            --queueItem.retryCount

            // retry the crawl
            this.crawl(config)
        }
        else{
            // no retries left. remove from queue
            this.removeFromQueue(config)
        }
    }
}

Crawler.prototype.removeFromQueue = function(config){
    var queueIndex = null
    
    this.queue.forEach(function(item, index){
        if (item.id === config.id){
            queueIndex = index
        }
    })
    
    if (queueIndex !== isNaN()){
        this.queue.splice(queueIndex, 1)
    }
    
    if (!this.queue.length){
        this.emit('done')
    }
}

Crawler.prototype.extractData = function(body, config) {
    var self = this,
        options = {
            html: body,
            scripts: [jquerySrc]
        },
        doParse = function(err, window){
            var $ = window.jQuery,
                rows = $(config.selector.tableRow)

            if (!rows.length){
                self.retry(config)
                return
            }

            $.each(rows, function(index, row){
                var curr = getValue($(row), config.selector.currency, currency.getCode)
                var buy = getValue($(row), config.selector.buy, currency.getValue)
                var sell = getValue($(row), config.selector.sell, currency.getValue)

                if (!curr || !buy || !sell){
                    return
                }
                
                var multiple = getValue($(row), config.selector.currency, currency.getMultiplier)
                
                var data = {
                    id: config.id,
                    currency: curr,
                    buy: (buy / multiple).toFixed(4), 
                    sell: (sell / multiple).toFixed(4)
                }
                
                self.emit("result", data)
            })

            self.removeFromQueue(config)
        }

    jsdom.env(options, doParse);
}

function getValue(row, selector, handler){
    var node = row.find(selector)

    if (!node.length){
        return
    }
    return handler.call(null, node.text())
}

module.exports = new Crawler();