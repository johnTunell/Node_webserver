$(document).ready(function() {

    /**
     * WEBSOCKET
     */
    
    var socket = io.connect('http://localhost:5000');

    // Setup button to send request
    $('.req_parse_tweets').on('click', () => {
        let size = $('input[name=size]:checked').val();
        let num_workers = $('input[name=workers]:checked').val();
        data = { size, num_workers }
        socket.emit('req_parse_tweets', data); });

    socket.on('res_parse_tweets', function (data) {
        console.log(data);
        loadGraph(data);
    })

    /**
     * Progressbar
     *
     */
    var $topLoader = $("#topLoader").percentageLoader({
        width: 256, height: 256, progress: 0.5, onProgressUpdate: function (val) {
            this.setValue(Math.round(val * 100.0) + 'kj');
        }
    });

    var topLoaderRunning = false;

    /* Some browsers may load in assets asynchronously. If you are using the percentage
     * loader as soon as you create it (i.e. within the same execution block) you may want to
     * wrap it in the below `ready` function to ensure its correct operation
     */
    $topLoader.percentageLoader({onready: function () {
        $("#animateButton").click(function () {
            if (topLoaderRunning) {
                return;
            }
            topLoaderRunning = true;

            var workers = 0;
            var totWorkers = 17;

            var animateFunc = function () {
                workers += 1;
                $topLoader.percentageLoader({progress: workers / totWorkers});
                $topLoader.percentageLoader({value: (workers.toString() + ' workers')});

                if (workers < totWorkers) {
                    setTimeout(animateFunc, 250);
                } else {
                    topLoaderRunning = false;
                }
            };

            setTimeout(animateFunc, 25);
        });

    }});
});


function loadGraph(data) {
    var x_axis = [];
    var y_axis = [];
    var new_data = [];
    i = 0;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            x_axis.push(key);
            y_axis.push(data[key]);
            new_data[i] = {"letter": key, "frequency": data[key]};
            i++;
        }
    }
    data2 = {x_axis, y_axis}
    console.log(x_axis);
    console.log(y_axis);


    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(x_axis.map(function (d) {
        return d;
    }));
    y.domain([0, d3.max(new_data, function (d) {
        console.log(d);
        return d.frequency;
    })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks())
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

    g.selectAll(".bar")
        .data(new_data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.letter);
        })
        .attr("y", function (d) {
            console.log(d.frequency);
            return y(d.frequency);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.frequency);
        });
}
