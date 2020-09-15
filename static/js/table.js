

let jsonLink = window.location.href.includes("/fang8")  ? "/fang_max_date" : 
  window.location.href.includes("/sunburst") ? "/max_date" : 
  window.location.href.includes("/djia30") ? "/time_series" : "/max_date"
console.log(jsonLink);

const sectorMap = new Map();
    const sectorData = [
      {"Aerospace/Defense": ["BA"]},
      {"Conglomerate": ["MMM", "HON", "DIS"]},
      {"Construction": ["CAT"]},
      {"Consumer Goods": ["PG", "HD", "WBA", "WMT", "NKE"]},
      {"Financial Services": ["AXP", "GS", "JPM", "TRV", "V"]},
      {"Food Industry": ["KO", "MCD"]},
      {"Information Technology": ["AAPL", "CSCO", "IBM", "INTC", "MSFT", "CRM"]},
      {"Health Care": ["UNH"]},
      {"Petro-Chemical": ["CVX", "DOW"]},
      {"Pharmaceuticals": ["AMGN", "JNJ", "MRK"]}
  ];
  sectorData.map(d => {
    Object.values(d)[0].map(v => {
        sectorMap.set(v, Object.keys(d)[0])
    })
  });


const tbody = d3.select("tbody");

d3.json(jsonLink).then(djiData => {

    // console.log(djiData);

    const data = Object.values(djiData);
    
    if (jsonLink === "/max_date") {
      data.map(d => {
        d.sector = sectorMap.get(d.ticker)
      })
    }
    
  

    data.forEach(stock_day => {

        let row = tbody.append("tr");
        let date = new Date(stock_day['date_close']);
        let day = date.getDate() + 1
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        row.append('td').text(year + "-" + month + "-" + day);
        row.append('td').text(stock_day['company']);
        row.append('td').text(stock_day['ticker']);
        row.append('td').text(stock_day['sector']);
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