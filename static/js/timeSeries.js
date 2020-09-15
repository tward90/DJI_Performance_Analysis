
function initTimeSeries() {
    let width = document.getElementById("timeSeriesID").clientWidth;
    let height = width;
    const margin = 100;


    const svg = d3.select(".timeSeries")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "timeSeriesSvg")

    const g = svg.append("g")
        .attr("id", "timeSeriesGroupID")
        .attr("font-size", 11)
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke-miterlimit", 1)

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
        {"Petro-Chemical": ["CVX", "DWDP"]},
        {"Pharmaceuticals": ["AMGN", "JNJ", "MRK"]},
        {"Telecommunication": ["VZ"]}
    ];
    sectorData.map(d => {
        Object.values(d)[0].map(v => {
            sectorMap.set(v, Object.keys(d)[0])
        })
    });

    let apiString = window.location.href.includes("/djia30")  ? "/time_series" :
            window.location.href.includes("/fang8") ? "/fang_time_series" : "/time_series"

    if (apiString === "/time_series") {
    d3.select(".timeSeries").selectAll("button")
        .data(sectorData)
        .enter()
        .append("button")
            .attr("class", "sector-button")
            .text(d => Object.keys(d)[0])
            .attr("fill", " #c8cddc")
            .property("value",d => Object.keys(d)[0])
            .on("click", () => {
                redraw(event.target.value);
                d3.select("#stock_data_filter").select("input")
                    .property("value", event.target.value);
            });
    }
    
    d3.select(".timeSeries").append("button")
        .attr("class", "sector-button")
        .text("All")
        .property("value", "none")
        .on("click", () => {
            redraw(event.target.value);
            d3.select("#stock_data_filter").select("input")
                .property("value", "")
        })


    function redraw(sector) {
        // console.log(sector);
        
        

        d3.select("#timeSeriesGroupID").selectAll("*").remove();
        d3.select(".timeSeries").selectAll("h4").remove();


    d3.json(apiString).then( timeData => {
        let dataRecords = Object.values(timeData);
        const data = d3.group(dataRecords, d=> d.ticker);

        
        
        let dataArr = [];
        for (const[key, values] of data) {
            dataArr.push(values);
        }
        // console.log(data);

        
        
        
        if (apiString === "/time_series") {
            dataArr.map(d => {
                d.map(j => {
                     j.sector = sectorMap.get(j.ticker)
                });
            })
        }

        if (sector != "none") {
            dataArr = dataArr.filter(d => d[0].sector === sector)
        }
        
        

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

        const tabScale = d3.scaleOrdinal()
            .domain([0, dataArr.length])
            .range(d3.schemeTableau10)

        const color = new Map();
        dataArr.forEach((d, i) => {
            // color.set(d[0].ticker, d3.interpolateViridis(viridisScale(i)))
            color.set(d[0].ticker, tabScale(i))
        })

        // Sorting each array of records by the close date (ascending)
        dataArr.map(d => d.sort(function(a, b) {return d3.ascending(a.date_close, b.date_close)}))


        let line = d3.line()
            .defined(d => !isNaN(d.deltaClose))
            .x(d => xScale(new Date(d.date_close)))
            .y(d => yScale(d.deltaClose));
        
        // console.log(line)

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        
        // console.log(dataArr[0].map(d => xScale(new Date(d.date_close))))
        // console.log(dataArr[0].map(d => yScale(d.deltaClose)))

        // x Axis creation
        const xAxis = g.append("g")
            .attr("class", "axi")
            // .attr("transform", `translate(0, ${yScale(0)})`)
            .attr("transform", `translate(0, ${height - margin})`)
            .style("font-size", 16)
            .style("stroke", "#7482a6")
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(3))
                .tickFormat(d => months[d.getMonth()]+ "-" + d.getFullYear())
                .tickSizeOuter(0))
            .call(g => g.select(".domain").remove());

        // y Axis creation
        const yAxis = g.append("g")
            .attr("class", "axi")
            .attr("transform", `translate(${margin},0)`)
            .style("font-size", 11)
            .style("stroke", "#7482a6")
            .call(d3.axisLeft(yScale).ticks(null, "%"))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width-2*margin)
                .attr("stroke-dasharray", "2, 2")
                .attr("stroke-opacity", 0.5)
                .attr("stroke", " #7482a6"));

        
        d3.select(".timeSeries").insert("h4", ":first-child")
            // .attr("transform", `translate(${margin}, ${margin/2})`)
            .attr("class", "header-title mb-4")
            .text(() => {

                return apiString === "/fang_time_series" ? "Fang+  Stock Group" :
                    sector === "none" ? "DOW Jones" : `DOW Sector: ${sector}`

            })
            
            
            


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
                .attr("fill", "#7482a6")
        
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
                            .attr("font-size", 11)
                            .attr("font-weight", "bold")
                        .transition()
                            .attr("fill", color.get(values[0].ticker))
                            
                            
                    })
                    

                
            }, 200*i);
            
        })

        function resizeTimeSeries() {
            width = document.getElementById("timeSeriesID").clientWidth;
            height = width;
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
                .attr("transform", `translate(0, ${height - margin})`)
                .style("font-size", 16)
                .attr("stroke", "#7482a6")
                .call(d3.axisBottom(xScale)
                    .ticks(d3.timeMonth.every(3))
                    .tickFormat(d => months[d.getMonth()]+ "-" + d.getFullYear())
                    .tickSizeOuter(0))
                .call(g => g.select(".domain").remove());
    
            g.append("g")
                .attr("class", "axi")
                .attr("transform", `translate(${margin},0)`)
                .style("font-size", 11)
                .attr("stroke", "#7482a6")
                .call(d3.axisLeft(yScale).ticks(null, "%"))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").clone()
                    .attr("x2", width-2*margin)
                    .attr("stroke", "#7482a6")
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
                                .attr("font-size", 11)
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
        .attr("class", "sector-button")
        .on("click", resizeTimeSeries)
        .text("reset");  
             
    })
    }
    redraw("none");
    

}
initTimeSeries();

