var request = require('request');
var http = require('http');
var jsdom = require("jsdom");
var bankutils = require("./bankutils.js");

var banks = [
    {
        id: "cec",
        name: "CEC Bank",
        url: "https://www.cec.ro/curs-valutar.aspx",
        selector: {
            tableRow: '.list_table:first tr',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(2)',
            sell: 'td:nth-child(3)'
        }
    },
    {
        id: "bcr",
        name: "Banca Comerciala Romana",
        url: "http://www.bcr.ro/ro/curs-valutar",
        selector: {
            tableRow: '.fxrates table tr',
            currency: 'td:nth-child(2)',
            buy: 'td:nth-child(3)',
            sell: 'td:nth-child(4)'
        }        
    }
]

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
      var $ = window.jQuery
      var rows = $(config.selector.tableRow)
      var results = []
      
      if (!rows.length){
          return
      }
      
      $.each(rows, function(index, row){
          var curr = getValue($(row), config.selector.currency, BankUtils.getCurrencyCode)
          var buy = getValue($(row), config.selector.buy, BankUtils.getCurrencyValue)
          var sell = getValue($(row), config.selector.sell, BankUtils.getCurrencyValue)
          
          if (!curr || !buy || !sell){
              return
          }
          
          var multiple = BankUtils.getCurencyMultiplier(curr)

          console.log({
              bankId: config.id,
              currency: curr,
              buy: buy / multiple, 
              sell: sell / multiple
          })
      })
    });
}

(function(){
    banks.forEach(function(bank){
        
        request(bank.url, function(error, response, body){
            if (!error && response.statusCode == 200){
                extractData(body, bank)
            } 
        })
        
    })
})()