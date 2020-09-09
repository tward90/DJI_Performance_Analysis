
const djiStocks = ['AXP', 'AMGN', 'AAPL', 'BA', 'CAT', 'CSCO', 'CVX', 'GS', 'HD', 'HON', 'IBM', 'INTC', 'JNJ', 'KO', 'JPM', 'MCD', 'MMM', 'MRK', 'MSFT', 'NKE', 
                    'PG', 'TRV', 'UNH', 'CRM', 'VZ', 'V', 'WBA', 'WMT', 'DIS', 'DOW']


                
// For Each stock in djiStocks, find all instances of it and locate the max date.
//

console.log(djiStocks);

$(document).ready( function () {
    $('#stock_data').DataTable();
} );