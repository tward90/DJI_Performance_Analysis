function init() {
    const width = 1000;
    const height = 1000;
    const margin = 50;

    const svg = d3.select(".timeSeries")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "timeSeriesSvg")

    const g = svg.append("g")
        .attr("font-size", 12)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)
        // .attr("transform", `translate(${width}, 0)`); // Change this later once bootstrap formating is added

    function dashTween() {
        const length = this.getTotalLength();
        return d3.interpolate(`0,${length}, ${length},${length}`);
    }
    
    

    d3.json("aapl.json", ).then( aaplData => {
        d3.json("ibm.json").then( ibmData => {
            // console.log(aaplData);
            // console.log(ibmData);
            let data = new Map();

            data.set("AAPL", aaplData);
            data.set("IBM", ibmData);

            

            const xScale = d3.scaleUtc([Date.UTC(2012, 0, 0), Date.UTC(2019, 0, 0)], [margin, width - margin]);
            const yScale = d3.scaleLinear()
                .domain([
                    0,d3.max([
                        d3.max(aaplData, d => d.close),
                        d3.max(ibmData, x => x.close)
                    ])
                ])
                .range([height-margin, margin]);

            const line = d3.line()
                .defined(d => !isNaN(d.close))
                .x(d => xScale(new Date(d.date_close)))
                .y(d => yScale(d.close));
            
            for(const[key, values] of data) {
                // yield svg.node();
                task(values);

                // g.append("path")
                //     .attr("d", line(values))
                //     .attr("stroke", "black")
                //     .attr("stroke-dasharray", `0,1`)
                // .transition()
                //     .duration(1000)
                //     .ease(d3.easeLinear)
                //     .attr("stroke-dasharray", dashTween)

                
            }

            function task(values) {
                setTimeout(() => {
                g.append("path")
                    .attr("d", line(values))
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", `0,1`)
                .transition()
                    .duration(1000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dasharray", dashTween)
                }, 2000)
            }
        //     console.log(line(data.get("AAPL")));
        //     g.append("path")
        //         .attr("d", line(data.get("AAPL")))
        //         .attr("stroke", "black")
        //         .attr("stroke-dasharray", `0,1`)
        //         .transition()
        //             .duration(1000)
        //             .ease(d3.easeLinear)
        //             .attr("stroke-dasharray", dashTween)


        })
    })



}
init();

// function intrayear(date) {
//     date = new Date(+date);
    
// }
