
// const djiStocks = ['AXP', 'AMGN', 'AAPL', 'BA', 'CAT', 'CSCO', 'CVX', 'GS', 'HD', 'HON', 'IBM', 'INTC', 'JNJ', 'KO', 'JPM', 'MCD', 'MMM', 'MRK', 'MSFT', 'NKE', 
//                     'PG', 'TRV', 'UNH', 'CRM', 'VZ', 'V', 'WBA', 'WMT', 'DIS', 'DOW']

// const jsonLink = 'http://127.0.0.1:5000/jsonified/'

const jsonLink = 'https://pet-pal88.herokuapp.com/max_date'


const tbody = d3.select("tbody");

d3.json(jsonLink).then(djiData => {

    const data = Object.values(djiData)

    // console.log(data)
    
    data.forEach(stock_day => {

        let row = tbody.append("tr");
        let date = new Date(stock_day['date_close']);
        let day = date.getDate() + 1
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        row.append('td').text(year + "-" + month + "-" + day);
        row.append('td').text(stock_day['company']);
        row.append('td').text(stock_day['ticker']);
        row.append('td').text(stock_day['open']);
        row.append('td').text(stock_day['low']);
        row.append('td').text(stock_day['high']);
        row.append('td').text(stock_day['close']);
        row.append('td').text(stock_day['volume']);

        // Object.entries(day).forEach(([key, value]) => {
        //         row.append("td").text(value['']);
        // });
    })

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