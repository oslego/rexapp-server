# REX App Server

Crawler, currency aggregation logic and API for [REX App](https://github.com/oslego/rexapp).

Run
=====
`$ node app.js`

API
=====

The REX App API returns currency exchange rates available from banks in Romania. All rates are in RON, the national Romanian currency.

All endpoints in this document should be prefixed with the URL where the server is running, for example `http://localhost:3000`. For brevity, this URL was omitted from the examples below.

Response format
----

All responses come in JSON format.

Get JSONP for easy cross-domain calls by appending `?callback={functionName}` to each call, where {functionName} is the name of your handler function.


Rates API
----

`GET /rates`

Get all the latest currency exchange rates.

`GET /rates/{currency_code}`

Get all the latest currency exchange rates for a currency code. 

Currency codes are alphabetic codes from the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) standard. 

Supported codes: EUR, USD, AUD, CAD, CHF, SEK, DKK, IKK, NOK, GBP, JPY, HUF, PLN, CZK, RUB, BGN. 
