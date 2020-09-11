
// const djiStocks = ['AXP', 'AMGN', 'AAPL', 'BA', 'CAT', 'CSCO', 'CVX', 'GS', 'HD', 'HON', 'IBM', 'INTC', 'JNJ', 'KO', 'JPM', 'MCD', 'MMM', 'MRK', 'MSFT', 'NKE', 
//                     'PG', 'TRV', 'UNH', 'CRM', 'VZ', 'V', 'WBA', 'WMT', 'DIS', 'DOW']

const jsonLink = 'http://127.0.0.1:5000/jsonified'

const tbody = d3.select("tbody");

d3.json(jsonLink).then(djiData => {

    const data = Object.values(djiData)

    // console.log(data)
    
    data.forEach(day => {
        var row = tbody.append("tr");
        row.append('td').text(new Date(day['date_close']));
        row.append('td').text(day['ticker']);

        // Object.entries(day).forEach(([key, value]) => {
        //         row.append("td").text(value['']);
        // });
    })

    // function formatItem(item) {
    //   return '<td>'+item.date_close + '</td> <td> ' + item.ticker + ' </td><td>' + item.open+'</td><td>'+item.low + '</td> <td> ' + item.high + ' </td><td>' + item.close+'</td><td>' + item.volume + '</td>';
    //   }

    $(document).ready( function () {
      $('#stock_data').DataTable();
    })

})


/*
    function buildTable(data) {
        // First, clear out any existing data
        tbody.html("");
      
        // Next, loop through each object in the data
        // and append a row and cells for each value in the row
        data.forEach((dataRow) => {
          // Append a row to the table body
          const row = tbody.append("tr");
      
          // Loop through each field in the dataRow and add
          // each value as a table cell (td)
          Object.values(dataRow).forEach((val) => {
            let cell = row.append("td");
              cell.text(val);
            }
          );
        });
      }
      buildTable(djiData);
*/
               
// For Each stock in djiStocks, find all instances of it and locate the max date.
//