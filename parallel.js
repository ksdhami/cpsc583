// http://bl.ocks.org/syntagmatic/raw/3341641/
// https://github.com/d3/d3-brush
// https://stackoverflow.com/questions/4394309/how-do-i-fit-an-image-img-inside-a-div-and-keep-the-aspect-ratio
// https://stackoverflow.com/questions/4476526/do-i-use-img-object-or-embed-for-svg-files
// https://d3js.live/#/Parallel_Coordinates

window.onload = function(){
    setupParallel1();
    setupParallel2();
    setupParallel3();
};

let margin = {top: 80, right: 130, bottom: 10, left: 180},
    width = document.body.clientWidth - margin.left - margin.right - 40,
    height = 500 - margin.top - margin.bottom;

let strType = {
    coerce: String,
    extent: function (data) { return data.sort(); },
    within: function(d, extent, field) { return extent[0] <= field.scale(d) && field.scale(d) <= extent[1]; },
    yScale: d3.scalePoint().range([0, height-2])
};

let numType = {
    coerce: function(d) { return +d; },
    extent: d3.extent,
    within: function(d, extent, field) { return extent[0] <= field.scale(d) && field.scale(d) <= extent[1]; },
    yScale: d3.scaleLinear().range([height-2, 0])
};

let dateType = {
    coerce: function(d) { return new Date(d); },
    extent: d3.extent,
    within: function(d, extent, field) { return extent[0] <= field.scale(d) && field.scale(d) <= extent[1]; },
    yScale: d3.scaleTime().range([height-2, 0])
};

var column = [
    {key: "Manufacturer", description: "Winning Manufacturer", type: strType,},
    {key: "Year", description: "Year of Race", type: dateType,},
    {key: "EngineSizeLitre", description: "Engine Size (l)", type: numType,},
    {key: "NoCylinders", description: "Number of Engine Cylinders", type: numType,},
    {key: "Distance", description: "Distance Traveled (km)", type: numType,},
    {key: "AveSpeed", description: "Average Lap Speed (km/h)", type: numType,},
    {key: "Laps", description: "Number of Laps Completed", type: numType,},
    {key: "FastestSpeed", description: "Fastest Recorded Speed (kph)", type: numType,},
    {key: "CircuitDesign", description: "Circuit Design", type: numType,},
    {key: "Deaths", description: "Number of Fatalities", type: numType,},
    {key: "Qualified", description: "Qualified Position", type: numType,}
];

function setupParallel1() {
    let xScale1, yAxis1, svg1, canvas1, context1, axes1;
    let pixelRatio1 = window.devicePixelRatio;

    var column1 = [
        //{key: "Manufacturer", description: "Winning Manufacturer", type: strType,},
        {key: "CircuitDesign", description: "Circuit Design", type: numType,},
        {key: "Year", description: "Year of Race", type: dateType,},
        {key: "EngineSizeLitre", description: "Engine Size (l)", type: numType,},
        {key: "NoCylinders", description: "Number of Engine Cylinders", type: numType,},
        {key: "Distance", description: "Distance Traveled (km)", type: numType,},
        {key: "AveSpeed", description: "Average Lap Speed (km/h)", type: numType,},
        {key: "Laps", description: "Number of Laps Completed", type: numType,},
        {key: "FastestSpeed", description: "Fastest Recorded Speed (kph)", type: numType,},
        {key: "Deaths", description: "Number of Fatalities", type: numType,},
        {key: "Qualified", description: "Qualified Position", type: numType,},
    ];

    xScale1 = d3.scalePoint()
        .domain(d3.range(column1.length))
        .range([0, width]);

    yAxis1 = d3.axisLeft();

    svg1 = d3.select("#svg_vis1")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    canvas1 = d3.select("#canvas_vis1")
        .attr("width", width * pixelRatio1)
        .attr("height", height * pixelRatio1)
        .style("width", width + "px")
        .style("height", height + "px")
        .style("margin-top", margin.top + "px")
        .style("margin-left", margin.left + "px");

    context1 = canvas1.node().getContext("2d");
    context1.globalCompositeOperation = 'darken';
    context1.globalAlpha = 0.5;
    context1.lineWidth = 2;
    context1.scale(pixelRatio1, pixelRatio1);

    axes1 = svg1.selectAll(".axis")
        .data(column1)
        .enter().append("g")
        .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
        .attr("transform", function(d,i) { return "translate(" + xScale1(i) + ")"; });

    d3.csv("lemans4.csv").then(function(data) {

        let color1 = d3.scaleOrdinal()
            .domain(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14" ])
            .range(d3["schemeDark2"]);

        data.forEach(function(d) {
            column1.forEach(function(e) {
                d[e.key] = !d[e.key] ? null : e.type.coerce(d[e.key]);
            });
        });

        column1.forEach(function(dim) {
            dim.domain = dim.type.extent(data.map(function(d) { return d[dim.key]; }));
            dim.scale = dim.type.yScale.copy().domain(dim.domain);
        });

        let render1 = renderQueue(draw).rate(1000);

        render1(data);

        axes1.append("g")
            .each(function(d) {
                d3.select(this).call(yAxis1.scale(d.scale));
            })
            .append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .text(function(d) {
                return d.description;
            });

        d3.selectAll(".axis.Manufacturer .tick text")
            .style("fill", "black");

        function draw(d) {
            context1.strokeStyle = color1(d.Manufacturer);
            context1.beginPath();
            let coords = project(d);
            coords.forEach(function(d) {
                if (d === null) {
                    return;
                }
                context1.lineTo(d[0],d[1]);
            });
            context1.stroke();
        }

        function project(d) {
            return column1.map(function(p, i) {
                return d[p.key] === null ? null : [xScale1(i),p.scale(d[p.key])];
            });
        }
    })
}

function setupParallel2() {
    let xScale2, yAxis2, svg2, canvas2, context2, axes2;
    let pixelRatio2 = window.devicePixelRatio;

    xScale2 = d3.scalePoint()
        .domain(d3.range(column.length))
        .range([0, width]);

    yAxis2 = d3.axisLeft();

    svg2 = d3.select("#svg_vis2")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    canvas2 = d3.select("#canvas_vis2")
        .attr("width", width * pixelRatio2)
        .attr("height", height * pixelRatio2)
        .style("width", width + "px")
        .style("height", height + "px")
        .style("margin-top", margin.top + "px")
        .style("margin-left", margin.left + "px");

    context2 = canvas2.node().getContext("2d");
    context2.globalCompositeOperation = 'darken';
    context2.globalAlpha = 0.5;
    context2.lineWidth = 2;
    context2.scale(pixelRatio2, pixelRatio2);

    axes2 = svg2.selectAll(".axis")
        .data(column)
        .enter().append("g")
        .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
        .attr("transform", function(d,i) { return "translate(" + xScale2(i) + ")"; });

    d3.csv("lemans4.csv").then(function(data) {

        let color2 = d3.scaleOrdinal()
            .domain(["CHENARD & WALCKER", "BENTLEY", "LORRAINE DIETRICH", "ALFA-ROMEO", "LAGONDA", "BUGATTI", "DELAHAYE", "FERRARI", "TALBOT LAGO", "JAGUAR", "MERCEDES- BENZ", "ASTON MARTIN", "FORD", "PORSCHE", "MATRA- SIMCA", "GULF", "RENAULT ALPINE", "SAUBER", "MAZDA", "PEUGEOT", "McLAREN", "BMW", "AUDI" ])
        .range(d3["schemeDark2"]);

        data.forEach(function(d) {
            column.forEach(function(e) {
                d[e.key] = !d[e.key] ? null : e.type.coerce(d[e.key]);
            });
        });

        column.forEach(function(dim) {
            dim.domain = dim.type.extent(data.map(function(d) { return d[dim.key]; }));
            dim.scale = dim.type.yScale.copy().domain(dim.domain);
        });

        let render = renderQueue(draw).rate(1000);

        render(data);

        axes2.append("g")
            .each(function(d) {
                d3.select(this).call(yAxis2.scale(d.scale));
            })
            .append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .text(function(d) {
                return d.description;
            });

        d3.selectAll(".axis.Manufacturer .tick text")
            .style("fill", color2);

        function draw(d) {
            context2.strokeStyle = color2(d.Manufacturer);
            context2.beginPath();
            let coords = project(d);
            coords.forEach(function(d,i) {
                if (d === null) {
                    return;
                }
                context2.lineTo(d[0],d[1]);
            });
            context2.stroke();
        }

        function project(d) {
            return column.map(function(p, i) {
                return d[p.key] === null ? null : [xScale2(i),p.scale(d[p.key])];
            });
        }
    })
}

function setupParallel3() {
    let xScale3, yAxis3, svg3, canvas3, context3, axes3;
    let pixelRatio3 = window.devicePixelRatio;

    xScale3 = d3.scalePoint()
        .domain(d3.range(column.length))
        .range([0, width]);

    yAxis3 = d3.axisLeft();

    svg3 = d3.select("#svg_vis3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    canvas3 = d3.select("#canvas_vis3")
        .attr("width", width * pixelRatio3)
        .attr("height", height * pixelRatio3)
        .style("width", width + "px")
        .style("height", height + "px")
        .style("margin-top", margin.top + "px")
        .style("margin-left", margin.left + "px");

    context3 = canvas3.node().getContext("2d");
    context3.globalCompositeOperation = 'darken';
    context3.globalAlpha = 0.5;
    context3.lineWidth = 2;
    context3.scale(pixelRatio3, pixelRatio3);

    axes3 = svg3.selectAll(".axis")
        .data(column)
        .enter().append("g")
        .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
        .attr("transform", function(d,i) { return "translate(" + xScale3(i) + ")"; });

    d3.csv("lemans4.csv").then(function(data) {

        let color3 = d3.scaleOrdinal()
            .domain(["CHENARD & WALCKER", "BENTLEY", "LORRAINE DIETRICH", "ALFA-ROMEO", "LAGONDA", "BUGATTI", "DELAHAYE", "FERRARI", "TALBOT LAGO", "JAGUAR", "MERCEDES- BENZ", "ASTON MARTIN", "FORD", "PORSCHE", "MATRA- SIMCA", "GULF", "RENAULT ALPINE", "SAUBER", "MAZDA", "PEUGEOT", "McLAREN", "BMW", "AUDI" ])
            .range(d3["schemeDark2"]);

        data.forEach(function(d) {
            column.forEach(function(e) {
                d[e.key] = !d[e.key] ? null : e.type.coerce(d[e.key]);
            });
        });

        column.forEach(function(dim) {
            dim.domain = dim.type.extent(data.map(function(d) { return d[dim.key]; }));
            dim.scale = dim.type.yScale.copy().domain(dim.domain);
        });

        let render3 = renderQueue(draw).rate(1000);

        render3(data);

        axes3.append("g")
            .each(function(d) {
                d3.select(this).call(yAxis3.scale(d.scale));
            })
            .append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .text(function(d) {
                return d.description;
            });

        axes3.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(d.brush = d3.brushY()
                    .extent([[-10,0], [10,height]])
                    .on("start", brushstart)
                    .on("brush", brush)
                    .on("end", brush)
                )
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }

        d3.selectAll(".axis.Manufacturer .tick text").style("fill", color3);

        function draw(d) {
            context3.strokeStyle = color3(d.Manufacturer);
            context3.beginPath();
            let coords = project(d);
            coords.forEach(function(d,i) {
                if (d === null) {
                    return;
                }
                context3.lineTo(d[0],d[1]);
            });
            context3.stroke();
        }

        function project(d) {
            return column.map(function(p, i) {
                return d[p.key] === null ? null : [xScale3(i),p.scale(d[p.key])];
            });
        }

        function brush() {
            render3.invalidate();

            let actives = [];
            svg3.selectAll(".axis .brush")
                .filter(function(d) {
                    return d3.brushSelection(this);
                })
                .each(function(d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this)
                    });
                });

            let selected = data.filter(function(d) {
                if (actives.every(function(active) {
                    let fld = active.dimension;
                    return fld.type.within(d[fld.key], active.extent, fld);
                })) {
                    return true;
                }
            });

            context3.clearRect(0,0,width,height);
            context3.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);
            render3(selected);
        }
    })
}