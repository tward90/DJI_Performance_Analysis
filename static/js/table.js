

const jsonLink = '/max_date'

const tbody = d3.select("tbody");

d3.json(jsonLink).then(djiData => {

    const data = Object.values(djiData)
    
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

    })

    $(document).ready( function () {
      $('#stock_data').DataTable();
    })

})