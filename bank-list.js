/* Add bank crawling hints here */
exports.banks = [
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
        name: "BCR",
        url: "http://www.bcr.ro/ro/curs-valutar",
        selector: {
            tableRow: '.fxrates table tr',
            currency: 'td:nth-child(2)',
            buy: 'td:nth-child(3)',
            sell: 'td:nth-child(4)'
        }        
    },
    {
        id: "brd",
        name: "BRD",
        url: "http://www.brd.ro/piete-financiare/piata-valutara-si-monetara/curs-de-schimb/",
        selector: {
            tableRow: '#content .description > table tr:nth-child(2) tr',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(6)',
            sell: 'td:nth-child(7)'
        }        
    },
    {
        id: "alpha",
        name: "Alpha Bank",
        url: "https://www.alphabank.ro/ro/rate/rate_si_dobanzi.php",
        selector: {
            // TODO: complain about the poor markup of AlphaBank
            tableRow: 'table[style="border: 1px solid #DDDDDD;"]:first tr[height]',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(5)',
            sell: 'td:nth-child(6)'
        }        
    },
    {
        id: "piraeus",
        name: "Piraeus Bank",
        url: "http://www.piraeusbank.ro/Banca/Unelte/Istoric-Curs-Valutar.html",
        selector: {
            tableRow: 'table.trezorerie tr',
            currency: 'td:nth-child(2) span',
            buy: 'td:nth-child(3) span',
            sell: 'td:nth-child(4) span'
        }        
    },
    // {
    //      id: "bt",
    //      name: "Banca Transilvania",
    //      // no dedicated URL for rates at the bank office
    //      url: "http://www.bancatransilvania.ro/",
    //      selector: {
    //          // Hardcoded rows so as to not accidentally grab SPOT rates.
    //          // I hate this hardcoding just as much as you do.
    //          tableRow: '#rightbox_cursvalutar_container tr:nth-child(8), #rightbox_cursvalutar_container tr:nth-child(9)',
    //          currency: 'td:nth-child(1)',
    //          buy: 'td:nth-child(2)',
    //          sell: 'td:nth-child(3)'
    //      }        
    //  },
    {
      id: "volksbank",
      name: "Volksbank",
      url: "http://www.volksbank.ro/ro/AfisareCursValutar",
      selector: {
          tableRow: '#cv_exchange + tr tr',
          currency: 'td:nth-child(1) span',
          buy: 'td:nth-child(3) span',
          sell: 'td:nth-child(4) span'
      }        
    },
    {
       id: "raiffeisen",
       name: "Raiffeisen Bank",
       url: "http://www.raiffeisen.ro/curs-valutar",
       selector: {
           tableRow: '.rzbContentTextNormal table tr',
           currency: 'td:nth-child(1)',
           buy: 'td:nth-child(4)',
           sell: 'td:nth-child(5)'
       }        
    },
    {
        id: "unicredit",
        name: "Unicredit Tiriac Bank",
        url: "http://www.unicredit-tiriac.ro/exchp",
        selector: {
            tableRow: '#content table tr:nth-child(15) ~ tr',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(2)',
            sell: 'td:nth-child(3)'
        }        
    },
    {
        id: "procredit",
        name: "ProCredit Bank",
        url: "http://www.procreditbank.ro/ro/curs-valutar",
        selector: {
            tableRow: '.licitatii tr',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(8)',
            sell: 'td:nth-child(9)'
        }        
    },
    {
        id: "br",
        name: "Banca Romaneasca",
        url: "http://www.banca-romaneasca.ro/instrumente-utile/curs-valutar/",
        selector: {
            tableRow: '#exchangeRates tbody tr',
            currency: 'td:nth-child(1)',
            buy: 'td:nth-child(4)',
            sell: 'td:nth-child(5)'
        }        
    }
]