function init() {
    // let width = document.getElementById("timeSeriesID").clientWidth;
    let width = 1000;
    let height = width;
    const margin = 100;


    const svg = d3.select(".timeSeries")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "timeSeriesSvg")

    const g = svg.append("g")
        .attr("font-size", 16)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)


    d3.json("/fang_time_series").then( timeData => {
        const dataRecords = Object.values(timeData);
        const data = d3.group(dataRecords, d=> d.ticker);

        console.log(data)
        let dataArr = [];
        for (const[key, values] of data) {
            dataArr.push(values);
        }
        
        // dataArr = dataArr.map(d => d.slice().sort((a,b) => d3.ascending(a.date_close, b.date_close)));
        


        const dateMin = d3.min(
            d3.min(dataArr.map(d => d.map(j => j.date_close)))
        );
        const dateMax = d3.max(
            d3.max(dataArr.map(d => d.map(j => j.date_close)))
        );
        
        // console.log(dataArr.map(d => d.map(j => new Date(j.date_close))));
        // Calculating the percentage change of the stock closing price from the min date to the current date
        // console.log(dataArr.map(d => d.find(element => element.ticker === "AAPL")))

        dataArr.map(d => {
            let localMin = d3.min(d.map(j => j.date_close));
            let c0 = d.find(element => element.date_close === localMin).close;
            // console.log(c0)
            d.map(j => {
                j.deltaClose = ((j.close / c0)-1);
            })
            
            
        })
        // console.log(dataArr);
        const deltaRange = [];
        dataArr.forEach(d => {
            // console.log(d3.extent(d.map(j => j.deltaClose)));
            deltaRange.push(d3.extent(d.map(j => j.deltaClose)));
        });
        const dataExtent = d3.extent(deltaRange.flat());


        let xScale = d3.scaleUtc()
            .domain([new Date(dateMin), new Date(dateMax)])
            .range([margin, width - margin]);
        let yScale = d3.scaleLinear()
            .domain(dataExtent)
            .range([height - margin, margin]);


        const viridisScale = d3.scaleLinear()
            .domain([0, dataArr.length])
            .range([0, 1])

        const color = new Map();
        dataArr.forEach((d, i) => {
            color.set(d[0].ticker, d3.interpolateViridis(viridisScale(i)))
        })

        console.log(dataArr.map(d => d.map(j => xScale(j.deltaClose))));

        let line = d3.line()
            .defined(d => !isNaN(d.deltaClose))
            .x(d => xScale(new Date(d.date_close)))
            .y(d => yScale(d.deltaClose));
        

        // x Axis creation
        g.append("g")
            .attr("transform", `translate(0, ${yScale(0)})`)
            .style("font-size", 16)
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(1), "%Y")
                .tickSizeOuter(0));

        // y Axis creation
        const yAxis = g.append("g")
            .attr("transform", `translate(${margin},0)`)
            .style("font-size", 16)
            .call(d3.axisLeft(yScale).ticks(null, "%"))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line").clone()
                .attr("x2", width)
                );

        yAxis.attr("stroke-opacity", 0.4);

        const legendCols = 2;

        window.onresize = resize;

        const legendText = g.append("g")
            .attr("transform", `translate(${margin}, ${margin/2})`)
            .selectAll("text")
            .data(dataArr)
            .enter()
            .append("text")
                .attr("y", (d, i) => i%legendCols===0 ? "0em" : "1em")
                .attr("x", (d, i) => `${Math.floor(i/legendCols) * 5}em` )
                .text(d => d[0].ticker)
                .attr("fill", "black")
        
        const legendColor = g.append("g")
            .attr("transform", `translate(${margin}, ${margin/2})`)
            .selectAll("rect")
            .data(dataArr)
            .enter()
            .append("rect")
            .attr("x", (d, i) => `${Math.floor(i/legendCols) * 5 - 1.5}em`)
            .attr("y", (d, i) => i%legendCols===0 ? "-0.8em" : "0.2em")
            .attr("width", ".9em")
            .attr("height", ".9em")
            .attr("fill", d => color.get(d[0].ticker))

            
        
        let i=0;
        // for(const[key, values] of data) {
        dataArr.forEach(values => {
            i++;
            setTimeout(function() {
                g.append("path")
                    .attr("d", line(values))
                    .attr("stroke", color.get(values[0].ticker))
                    .attr("stroke-dasharray", `0,${this.getTotalLength}`)
                .transition()
                    .duration(500)
                    .ease(d3.easeLinear)
                    .attr("stroke-dasharray", function() {
                        const length = this.getTotalLength();
                        return `${length},${length}`
                    })
                    .on("end", function() {
                        g.append("text")
                            .attr("dx", 4)
                            .attr("dy", "0.32em")
                            .attr("x", xScale(new Date(values[values.length-1].date_close)))
                            .attr("y", yScale(values[values.length-1].deltaClose))
                            .text(values[values.length-1].ticker)
                            .attr("font-size", 17)
                            .attr("font-weight", "bold")
                        .transition()
                            .attr("fill", color.get(values[0].ticker))
                            
                            
                    })
                    

                
            }, 1000*i);
            
        })

        function resize() {
            width = document.getElementById("timeSeriesID").clientWidth;
            height = width/1.6;
            d3.select("#timeSeriesSvg")
                .attr("width", width)
                .attr("height", height);

            xScale = d3.scaleUtc([new Date(dateMin), new Date(dateMax)], [margin, width - margin]);
            yScale = d3.scaleLinear()
                .domain(dataExtent)
                .range([height-margin, margin]);

            line = d3.line()
                .defined(d => !isNaN(d.deltaClose))
                .x(d => xScale(new Date(d.date_close)))
                .y(d => yScale(d.deltaClose));
            
        }
        window.onresize = resize;

    })



}
init();

