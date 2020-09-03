const width = 500;
const height = 500;
const margin = 50;

const radius = Math.min(width, height) / 2 - margin;

const svg = d3.select(".donut")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

const data = [{value: 9, name: "a", nest: [{value: 5, name: "aa"}, {value: 8, name: "ab"}]},
            {value: 20, name: "b", nest: [{value: 9, name: "ba"}, {value: 4, name: "bb"}, {value: 7, name: "bc"}]},
            {value: 30, name: "c", nest: [{value: 1, name: "ca"}, {value: 7, name: "cb"}, {value: 3, name: "cc"}]},
            {value: 17, name: "d", nest: [{value: 11, name: "da"}, {value: 12, name: "db"}]}];

const pie = d3.pie()
    .sort(null)
    .value(d => d.value);

const arc = d3.arc()
    .innerRadius(150)
    .outerRadius(Math.min(width, height)/2-1);

const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.schemeCategory10);

let arcs = pie(data)

let pieChart = svg.selectAll("path")
    .data(arcs)
    .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("fill-opacity", 0.5)
        .attr("d", arc);

    
pieChart.append("title")
        .text(d => `${d.data.name}`);
    
// d3.selectAll("path")
pieChart
    .on("mouseover", function(event) {
        // console.log(event.target)
        d3.select(event.target)
            .attr("fill-opacity", 1)
    })
    .on("mouseout", event => {
        d3.select(event.target)
            .attr("fill-opacity", 0.5)
    })
    .on("click", event => {
        console.log(event.target.__data__.data.nest)
        arcs = pie(event.target.__data__.data.nest)
        pieChart
            .data(arcs)
            .join("path")
                .attr("fill", d => color(d.data.name))
                .attr("fill-opacity", 0.5)
                .attr("d", arc)
    });