function initTimeSeries() {
    let width = document.getElementById("timeSeriesID").clientWidth;
    // let width = 1000;
    let height = width;
    const margin = 100;


    const svg = d3.select(".timeSeries")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "timeSeriesSvg")

    const g = svg.append("g")
        .attr("id", "timeSeriesGroupID")
        .attr("font-size", 16)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)

    d3.select(".timeSeries").append("button")
        .text("DOW")
        .property("value", "/time_series")
        .on("click", redraw);

    d3.select(".timeSeries").append("button")
        .text("Fang")
        .property("value", "/fang_time_series")
        .on("click", redraw)

    function redraw() {
        let apiString = this.value ? this.value : "/time_series";
        // const apiString = this.value;
        console.log(apiString);
        d3.select("#timeSeriesGroupID").selectAll("*").remove();


    

    

    d3.json(apiString).then( timeData => {
        const dataRecords = Object.values(timeData);
        const data = d3.group(dataRecords, d=> d.ticker);

        
        let dataArr = [];
        for (const[key, values] of data) {
            dataArr.push(values);
        }
        console.log(dataArr);

        const dateMin = d3.min(
            d3.min(dataArr.map(d => d.map(j => j.date_close)))
        );
        const dateMax = d3.max(
            d3.max(dataArr.map(d => d.map(j => j.date_close)))
        );
        
        dataArr.map(d => {
            let localMin = d3.min(d.map(j => j.date_close));
            let c0 = d.find(element => element.date_close === localMin).close;
            d.map(j => {
                j.deltaClose = ((j.close / c0)-1);
            })
            
            
        })
        const deltaRange = [];
        dataArr.forEach(d => {
            deltaRange.push(d3.extent(d.map(j => j.deltaClose)));
        });
        const dataExtent = d3.extent(deltaRange.flat());


        function shiftMonth(date, shift) {
            let oldDate = new Date(date);
            return new Date(oldDate.getFullYear(),oldDate.getMonth()+shift,oldDate.getDate())
        }

        let xScale = d3.scaleUtc()
            .domain([shiftMonth(dateMin, 0), shiftMonth(dateMax, 1)])
            .range([margin, width - margin]);
        let yScale = d3.scaleLinear()
            .domain([d3.min([-0.2, dataExtent[0]]), dataExtent[1]])
            .range([height - margin, margin]);


        const viridisScale = d3.scaleLinear()
            .domain([0, dataArr.length])
            .range([0, 1])

        const color = new Map();
        dataArr.forEach((d, i) => {
            color.set(d[0].ticker, d3.interpolateViridis(viridisScale(i)))
        })

        // Sorting each array of records by the close date (ascending)
        dataArr.map(d => d.sort(function(a, b) {return d3.ascending(a.date_close, b.date_close)}))


        let line = d3.line()
            .defined(d => !isNaN(d.deltaClose))
            .x(d => xScale(new Date(d.date_close)))
            .y(d => yScale(d.deltaClose));
        

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        


        // x Axis creation
        g.append("g")
            .attr("class", "axi")
            .attr("transform", `translate(0, ${yScale(0)})`)
            .style("font-size", 16)
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(3))
                .tickFormat(d => months[d.getMonth()]+ "-" + d.getFullYear())
                .tickSizeOuter(0));

        // y Axis creation
        g.append("g")
            .attr("class", "axi")
            .attr("transform", `translate(${margin},0)`)
            .style("font-size", 16)
            .call(d3.axisLeft(yScale).ticks(null, "%"))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width-2*margin)
                .attr("stroke-dasharray", "2, 2")
                .attr("stroke-opacity", 0.5));


        const legendCols = 2;

        // window.onresize = resize;

        const legendText = g.append("g")
            .attr("class", "legendTimeSeries")
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
            .attr("class", "legendTimeSeries")
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
        dataArr.forEach(values => {
            i++;
            setTimeout(function() {
                g.append("path")
                    .attr("class", "linePath")
                    .attr("d", line(values))
                    .attr("stroke", color.get(values[0].ticker))
                    .attr("stroke-dasharray", `0,${this.getTotalLength}`)
                .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                    .attr("stroke-dasharray", function() {
                        const length = this.getTotalLength();
                        return `${length},${length}`
                    })
                    .on("end", function() {
                        g.append("text")
                            .attr("class", "tickerLabel")
                            .attr("dx", 4)
                            .attr("dy", "0.32em")
                            .attr("x", xScale(values[values.length-1].date_close))
                            .attr("y", yScale(values[values.length-1].deltaClose))
                            .text(values[values.length-1].ticker)
                            .attr("font-size", 17)
                            .attr("font-weight", "bold")
                        .transition()
                            .attr("fill", color.get(values[0].ticker))
                            
                            
                    })
                    

                
            }, 200*i);
            
        })

        function resizeTimeSeries() {
            width = document.getElementById("timeSeriesID").clientWidth;
            height = width/1.6;
            d3.select("#timeSeriesSvg")
                .attr("width", width)
                .attr("height", height);

            xScale = d3.scaleUtc()
                .domain([shiftMonth(dateMin, 0), shiftMonth(dateMax, 1)])
                .range([margin, width - margin]);

            yScale = d3.scaleLinear()
                .domain([d3.min([-0.2, dataExtent[0]]), dataExtent[1]])
                .range([height-margin, margin]);

            line = d3.line()
                .defined(d => !isNaN(d.deltaClose))
                .x(d => xScale(new Date(d.date_close)))
                .y(d => yScale(d.deltaClose));

            g.selectAll(".axi").remove();

            g.append("g")
                .attr("class", "axi")
                .attr("transform", `translate(0, ${yScale(0)})`)
                .style("font-size", 16)
                .call(d3.axisBottom(xScale)
                    .ticks(d3.timeMonth.every(3))
                    .tickFormat(d => months[d.getMonth()]+ "-" + d.getFullYear())
                    .tickSizeOuter(0));
    
            g.append("g")
                .attr("class", "axi")
                .attr("transform", `translate(${margin},0)`)
                .style("font-size", 16)
                .call(d3.axisLeft(yScale).ticks(null, "%"))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").clone()
                    .attr("x2", width-2*margin)
                    .attr("stroke-dasharray", "2, 2")
                    .attr("stroke-opacity", 0.5));



            g.selectAll(".linePath").remove();
            g.selectAll(".tickerLabel").remove();
            let i=0;
            dataArr.forEach(values => {
                i++;
                setTimeout(function() {
                    g.append("path")
                        .attr("class", "linePath")
                        .attr("d", line(values))
                        .attr("stroke", color.get(values[0].ticker))
                        .attr("stroke-dasharray", `0,${this.getTotalLength}`)
                    .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr("stroke-dasharray", function() {
                            const length = this.getTotalLength();
                            return `${length},${length}`
                        })
                        .on("end", function() {
                            g.append("text")
                                .attr("class", "tickerLabel")
                                .attr("dx", 4)
                                .attr("dy", "0.32em")
                                .attr("x", xScale(values[values.length-1].date_close))
                                .attr("y", yScale(values[values.length-1].deltaClose))
                                .text(values[values.length-1].ticker)
                                .attr("font-size", 17)
                                .attr("font-weight", "bold")
                            .transition()
                                .attr("fill", color.get(values[0].ticker))
                                
                                
                        })
                        
    
                    
                }, 200*i);
                
            })
            
            
        }
        window.onresize = resizeTimeSeries;
        d3.select("#timeReset").remove();

        d3.select(".timeSeries")
        .append("button")
        .attr("id", "timeReset")
        .on("click", resizeTimeSeries)
        .text("reset");  
             
    })
    }
    redraw();
    

}
initTimeSeries();

