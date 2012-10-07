# REX App Server

Crawler, currency aggregation logic and API for [REX App](https://github.com/oslego/rexapp).

Run
=====
`$ node app.js`

API
=====

All queries prefixed with the URL where the server is running.

`GET /rates`

Get all the latest currency exchange rates.

`GET /rates/{currency_code}`

Get all the latest currency exchange rates for a currency code. 

Currency codes are alphabetic codes from the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) standard. 

Supported codes: EUR, USD, AUD, CAD, CHF, SEK, DKK, IKK, NOK, GBP, JPY, HUF, PLN, CZK, RUB, BGN. 
