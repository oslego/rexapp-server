# REX App Server

Crawler, currency aggregation logic and API for [REX App](https://github.com/oslego/rexapp).

Install
=====

Requirements: 

- [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/)

- [Postgresql](http://www.postgresql.org/) database


Install dependencies

`$ npm install` 


Setup the DB schema. See db-setup.js for database connection string.

`$ node db-setup.js`

Run
=====
`$ node worker.js` for crawler and aggregator. Runs on Cron

`$ node api.js` for exposing API endpoints over HTTP


API
=====

The REX App API returns currency exchange rates available from banks in Romania. All rates are in RON, the national Romanian currency.

All endpoints described in this document must be prefixed with the URL where the server is running, for example `http://localhost:3000`. For brevity, this URL was omitted from the examples below.

Response format
----

All responses come in JSON format.

Get JSONP for easy cross-domain calls by appending `?callback={functionName}` to each call, where {functionName} is the name of your handler function.


Response status
----

**Success**

If the request was successful the response object will have the `status` property set to `ok` along with the requested data.

Example:
`
{
    "status": "ok",
    "rates": ...
}`


**Error**

If the request results in an error the response object will have the `status` property set to `error` and a `message` property with a description of the error.

Example
`
{
    "status": "error",
    "message": "Invalid currency code."
}`


Rates API
----

`GET /v1/rates`

Get all the latest currency exchange rates.


`GET /v1/rates/{currency_code}`

Get all the latest currency exchange rates for a currency code. 

Currency codes are alphabetic codes from the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) standard. 
Supported codes: EUR, USD, AUD, CAD, CHF, SEK, DKK, IKK, NOK, GBP, JPY, HUF, PLN, CZK, RUB, BGN. 


Banks API
-----

`GET /v1/banks`

Get details of banks that provide currency rates: name, url, etc.

Response
<pre>
{
  "status": "ok",
  "banks": {
    "cec": {
      "name": "CEC Bank",
      "url": "https://www.cec.ro/curs-valutar.aspx"
    },
    
    "bcr": {
      "name": "BCR",
      "url": "http://www.bcr.ro/ro/curs-valutar"
    }

    ...
}
</pre>

