/* Currency util functions */

var currencyMap = {
	// euro
	eur: {
		pattern: /\beuro?\b>*/gi,
		code: "EUR"
	},

	// dolar american
	usd: {
		pattern: /\bdolar(ul|i{0,2})?\b\s*\bamerica(n|ni)?|s\.?u\.?a\.?\b/gi,
		code: "USD"
	},

	// dolar australian
	aud: {
		pattern: /\bdolar(ul|i{0,1})?\b(\s*\baustrali(a|an|ani|eni)\b)/gi,
		code: "AUD"
	},

	// dolar canada
	cad: {
		pattern: /\bdolar(ul|i{0,1})?\b\s*\bcanad(a|ian|ieni)\b/gi,
		code: "CAD"
	},

	// franc elvetian
	chf: {
		pattern: /\bfranc(ul|i{0,1})?\b\s*\belveti(an|eni)\b/gi,
		code: "CHF"
	},

	// coroana suedeza
	sek: {
		pattern: /\bcoroan(a|e)\b\s*\bsued(ia|eza|eze)\b/gi,
		code: "SEK"
	},

	// coroana daneza
	dkk: {
		pattern: /\bcoroan(a|e)\b\s*\bdane(marca|za|ze)\b/gi,
		code: "DKK"
	},

	// coroana islandeza
	ikk: {
		pattern: /\bcoroan(a|e)\b\s*\bisland(a|eza|eze)\b/gi,
		code: "IEK"
	},

	// coroana norvegiana
	nok: {
		pattern: /\bcoroan(a|e)\b\s*\bnorvegi(a|ana|ene)\b/gi,
		code: "NOK"
	},

	// lira sterlina
	gbp: {
		pattern: /\blir(a|e)\b\s*\bsterlin(a|e)\b/gi,
		code: "GBP"
	},

	// yen japonez
	jpy: {
		pattern: /\byen(i{0,1}|ul)\b\s*\bjapon(ia|ez|ezi)\b/gi,
		code: "JPY"
	},

	// forint maghiar
	huf: {
		pattern: /\bforint(i{0,1}|ul)\b\s*\bung(aria|uresc|uresti)\b/gi,
		code: "HUF"
	},

	// zlot polonez
	pln: {
		pattern: /\bzlot(i{0,1}|ul)\b\s*\bpolon(ia|ez|ezi)\b/gi,
		code: "PLN"
	},

	// corona ceha
	czk: {
		pattern: /\bcoroan(a|e)\b\s*\bceh(a|ia|e|esti)\b/gi,
		code: "CZK"
	},

	// rubla ruseasca
	rub: {
		pattern: /\brubl(a|e)\b\s*\brus(a|ia|easca|esti)\b/gi,
		code: "RUB"
	},

	// leva bulgara
	bgn: {
		pattern: /\bleva\b\s*\bbulgar(a|ia|easca|e|esti)\b/gi,
		code: "BGN"
	}
};

exports.currency = {
    map: currencyMap,

    getValue : function(string){
        if (!string || typeof string !== "string"){
            return null
        }

        var floatString = string.replace(",",".")
        var value = parseFloat(floatString)

        if (!isNaN(value)){
            return value
        }
    },

    /*
    Takes a Romanian natural language string and tries to match a valid currency code.
    @param {String} string
    	natural language string to be decoded.

    @return {String}, null
    	string with the currency code. Example: USD
    	null if no currency code could be found.

    Example: getCode("USD") -> USD
    Example: getCode("usd") -> USD
    Example: getCode("Dolar american") -> USD
    Example: getCode("100 Forinti Ungaria") -> HUF
    Example: getCode("Skittles") -> null
    */
    getCode : function(string){
        // remove non-word characters and digits optionally borderd by whitespace
        var string = string.replace(/\s*[\*]+\s*/, "").replace(/\s*\d+\s*/,""),
        // replace whitespace in string
            shortString = string.replace(/\s/,'');

    	// run a quick ckech on keys for simple currency codes
    	if (shortString.length == 3){
        	for (var key in currencyMap){
        	    if (key === shortString.toLowerCase()){
        	        return key.toUpperCase()
        	    }
        	}
    	}

    	// check against the regex values
    	for (var key in currencyMap){
    		if (currencyMap[key].pattern.test(string)){
    		    return key.toUpperCase()
    		}
    	}
    },

    getMultiplier: function(string){
    	var digits = string.match(/\d+/);
    	return digits ? parseInt(digits[0], 10) : 1;
    }
}
