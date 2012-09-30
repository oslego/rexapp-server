var request = require('request');
var jsdom = require("jsdom");
var currency = require("./currency.js").currency;
var banks = require("./bank-list.js").banks;

function getValue(row, selector, handler){
    var node = row.find(selector)

    if (!node.length){
        return
    }
    return handler.call(null, node.text())
}

function extractData(body, config){
    jsdom.env({
      html: body,
      scripts: [
        'http://code.jquery.com/jquery-1.8.1.min.js'
      ]
    }, function (err, window) {
      var $ = window.jQuery,
          rows = $(config.selector.tableRow)
      
      if (!rows.length){
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
          
          console.log({
              bankId: config.id,
              currency: curr,
              buy: (buy / multiple).toFixed(4), 
              sell: (sell / multiple).toFixed(4)
          })
      })
    });
}

exports.crawl = function(){
    banks.forEach(function(bank){
        
        request(bank.url, function(error, response, body){
            if (!error && response.statusCode == 200){
                extractData(body, bank)
            } 
        })
    })
}