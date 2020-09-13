function init () {

let width = document.getElementById("sunburstID").clientWidth;
let height = width;
console.log (width)
console.log (height)
const margin = 50;
let radius = Math.min(width, height) / 6 - margin;

// window.addEventListener('resize', function(event) {
//         let width = d3.select("#sunburstID").clientWidth
//         let height = d3.select("#sunburstID").clientHeight
//         console.log (width)
//         console.log (height)
//         d3.select(".sunburst")
//         .attr("height", height)
//         .attr("width", width)
// })

function resize () {
        width = document.getElementById("sunburstID").clientWidth;
        height = width;
        radius = Math.min(width, height) / 6 - margin;
        console.log (width)
        console.log (height)
        console.log (radius)
        d3.select(".sunburst").select("svg")
        .attr("height", height)
        .attr("width", width)
    }

// if (!d3.select("#pieSvg"))   
const svg = d3.select(".sunburst")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "pieSvg")
    .append("g")
        .attr("pointer-events", "all")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("id", "gID");


const data = {
    name: "DOW Sectors", children: [
        {
            name: "Aerospace/Defense",
            children: [
                {name: "Boeing", value: 4.04}
            ]
        },
        {
            name: "Conglomerate",
            children: [
                {name: "3M", value: 3.80},
                {name: "Honeywell", value: 3.87},
                {name: "Walt Disney Co.", value: 3.11}
            ]
        },
        {
            name: "Construction",
            children: [
                {name: "Caterpillar Inc.", value: 3.30}
            ]
        },
        {
            name: "Consumer Goods",
            children: [
                {name: "Procter & Gamble", value: 3.19},
                {name: "The Home Depot", value: 6.57},
                {name: "Walgreens-Boots", value: 0.89},
                {name: "Walmart", value: 3.22},
                {name: "Nike", value: 2.58}
            ]
        },
        {
            name: "Financial Services",
            children: [
                {name: "American Express", value: 2.35},
                {name: "Goldman Sachs", value: 4.77},
                {name: "JPMorgan Chase", value: 2.36},
                {name: "The Travelers Co.", value: 2.66},
                {name: "Visa Inc.", value: 4.95}
            ]
        },
        {
            name: "Food Industry",
            children: [
                {name: "Coca-Cola Co.", value: 1.14},
                {name: "McDonald's", value: 4.93}
            ]
        },
        {
            name: "Information Technology",
            children: [
                {name: "Apple Inc.", value: 2.87},
                {name: "Cisco Systems", value: 0.97},
                {name: "IBM", value: 2.87},
                {name: "Intel", value: 1.16},
                {name: "Microsoft", value: 5.26},
                {name: "Salesforce", value: 6.23}
            ]
        },
        {
            name: "Health Care",
            children: [
                {name: "UnitedHealth Group", value: 7.22}
            ]
        },
        {
            name: "Petro-Chemical",
            children: [
                {name: "Chevron Corp.", value: 1.97},
                {name: "Dow Inc.", value: 1.06}
            ]
        },
        {
            name: "Pharmaceuticals",
            children: [
                {name: "Amgen", value: 5.81},
                {name: "Johnson & Johnson", value: 3.53},
                {name: "Merck & Co.", value: 1.97}
            ]
        },
        {
            name: "Telecommunication",
            children: [
                {name: "Verizon", value: 1.36}
            ]
        }
    ]
}



function partition(d) {
    const root = d3.hierarchy(d)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    return d3.partition()
        .size([2 * Math.PI, root.height + 1])
        (root);
}




color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))

arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

bigLabel = svg.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "none")

function update() {
    const root = partition(data)

    root.each(d => d.current = d);

    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
            .attr("fill", d => {while (d.depth > 1) d = d.parent; return color(d.data.name); })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current))
            .on("mouseover", event => {
                d3.select(event.target)
                    .attr("fill-opacity", 1)
            })
            .on("mouseout", event => {
                d3.select(event.target)
                    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            });
        
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name)
            .attr("font-size", 12);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);
    
    

function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y}, 0) rotate(${x < 180 ? 0 : 180})`;
}

function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    path.transition(t)
        .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
        })
        .filter(d => {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
}

}

format = d3.format(",d")


update()
}

init()

window.onresize = init