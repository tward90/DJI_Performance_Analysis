
d3.json("/ticker").then((tickerData) => {
    const data = Object.values(tickerData);

    d3.select(".d-flex").select("marquee")
    .selectAll('a')
    .data(data)
    .enter()
    .append('a')
    .html(d => ` <span class='material-icons ${d.pcnt_change >=0 ?"green_arrow'> trending_up":"red_arrow'> trending_down"}</span>${d.ticker} Daily Close : ${d.close} Prct. Change : ${d.pcnt_change.toFixed(2)}`)
});

