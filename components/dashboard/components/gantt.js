// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import d3 from 'utils/libs/d3';

const Gantt = function(selector, width) {
    var FIT_TIME_DOMAIN_MODE = 'fit';
    var FIXED_TIME_DOMAIN_MODE = 'fixed';

    var margin = {
        top: 20,
        right: 50,
        bottom: 20,
        left: 50,
    };
    var selector = selector;
    var timeDomainStart = d3.timeDay.offset(new Date(), -3);
    var timeDomainEnd = d3.timeHour.offset(new Date(), +3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE; // fixed or fit
    var taskTypes = [];
    var taskStatus = [];

    console.log("DOCUMENT BODY WIDTH", document.body.clientWidth)
    //var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var initWidth = width ? width : document.body.clientWidth/2;
    console.log("HAVE WIDTH FROM REF:", width, "BODY WIDTH:", document.body.clientWidth/2);
    console.log("using init width:", initWidth);
    var width = (initWidth - (initWidth / 5)) - margin.right - margin.left;;
    //var width = "100%";
    var height = 250;

    //var width = 600;

    var tickFormat = '%H:%M';

    var keyFunction = function(d) {
        return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
        return 'translate(' + x(d.startDate) + ',' + y(d.taskName) + ')';
    };

    var x = d3.
        scaleTime().
        domain([timeDomainStart, timeDomainEnd]).
        range([0, width]).
        clamp(true);

    var y = d3.
        scaleBand().
        domain(taskTypes).
        range([0, height - margin.top - margin.bottom], 0.1);

    var xAxis = d3.
        axisBottom(x).
        tickFormat(d3.timeFormat(tickFormat)).
        tickSize(8).
        tickPadding(8)
        .ticks(d3.timeMinute.every(15));

    var yAxis = d3.axisLeft(y).tickSize(0);

    var initTimeDomain = function(tasks) {
        console.log('initializing time domain with tasks:', tasks);
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = d3.timeDay.offset(new Date(), -3);
                timeDomainEnd = d3.timeHour.offset(new Date(), +3);
                return;
            }

            // tasks.sort(function(a, b) {
            //   return a.endDate - b.endDate;
            // });
            timeDomainEnd = tasks[tasks.length - 1].endDate;

            // tasks.sort(function(a, b) {
            //   return a.startDate - b.startDate;
            // });
            timeDomainStart = tasks[0].startDate;
            console.log('time domain:', timeDomainStart, timeDomainEnd);
        }
    };

    var initAxis = function() {
        x = d3.
            scaleTime().
            domain([timeDomainStart, timeDomainEnd]).
            range([0, width]).
            clamp(true);
        y = d3.
            scaleBand().
            domain(taskTypes).
            range([0, height - margin.top - margin.bottom], 0.1);
        xAxis = d3.
            axisBottom(x).
            tickFormat(d3.timeFormat(tickFormat)).
            tickSize(8).
            tickPadding(8);

        yAxis = d3.axisLeft(y).tickSize(0);
    };

    function gantt(tasks) {
        console.log('tasks:', tasks);

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.
            select(selector).
            append('svg').
            attr('class', 'chart').
            attr('width', width + margin.left + margin.right).
            attr('height', height + margin.top + margin.bottom).
            append('g').
            attr('class', 'gantt-chart').
            attr("role", "figure").
            attr("aria-labelledby", "gantt-label").

            attr('width', width + margin.left + margin.right).
            attr('height', height + margin.top + margin.bottom).
            attr(
                'transform',
                'translate(' + margin.left + ', ' + margin.top + ')'
            );

            svg.append("title")
            .attr("id", "gantt-label")
            .text("Timeline Chart");


        svg.selectAll('.chart').
            data(tasks, keyFunction).
            enter().
            append("g").
            attr("role", "presentation").
            attr("aria-label", function(d) {
              const startTime = d3.timeFormat(tickFormat)(d.startDate);
              const utteranceLength = Math.round((d.endDate - d.startDate) / 1000);
              return `${startTime}, ${d.taskName} spoke for ${utteranceLength} seconds`;
            }).
            append('rect').
            attr('rx', 5).
            attr('ry', 5).
            attr('class', (d) => {
                if (taskStatus[d.status] == null) {
                    return 'bar';
                }
                return taskStatus[d.status];
            }).
            attr('y', 0).
            attr('transform', rectTransform).
            attr('height', (d) => {
                return y.bandwidth();
            }).
            attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            }).
            attr('fill', (d) => {
                return d.color;
            });

        svg.append('g').
            attr('class', 'x axis').
            attr('class', 'axisGray').
            attr("aria-hidden", "true").
            attr(
                'transform',
                'translate(0, ' + (height - margin.top - margin.bottom) + ')'
            ).
            transition().
            call(xAxis);

        svg.append('g').
            attr('class', 'y axis').
            attr('class', 'axisGray').
            attr("aria-hidden", "true").
            transition().
            call(yAxis);

        console.log('gantt looks like:', gantt);
        return gantt;
    }

    gantt.redraw = function(tasks) {
        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select('.chart');

        var ganttChartGroup = svg.select('.gantt-chart');
        var rect = ganttChartGroup.selectAll('rect').data(tasks, keyFunction);

        rect.enter().
            insert('rect', ':first-child').
            attr('rx', 5).
            attr('ry', 5).
            attr('class', (d) => {
                if (taskStatus[d.status] == null) {
                    return 'bar';
                }
                return taskStatus[d.status];
            }).
            transition().
            attr('y', 0).
            attr('transform', rectTransform).
            attr('height', (d) => {
                return y.bandwidth();
            }).
            attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            }).
            attr('fill', (d) => {
                return d.color;
            });

        rect.transition().
            attr('transform', rectTransform).
            attr('height', (d) => {
                return y.bandwidth();
            }).
            attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select('.x').
            transition().
            call(xAxis);
        svg.select('.y').
            transition().
            call(yAxis);

        return gantt;
    };

    gantt.margin = function(value) {
        if (!arguments.length) {
            return margin;
        }
        margin = value;
        return gantt;
    };

    gantt.timeDomain = function(value) {
        if (!arguments.length) {
            return [timeDomainStart, timeDomainEnd];
        }
        (timeDomainStart = Number(value[0])),
        (timeDomainEnd = Number(value[1]));
        return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
        if (!arguments.length) {
            return timeDomainMode;
        }
        timeDomainMode = value;
        return gantt;
    };

    gantt.taskTypes = function(value) {
        if (!arguments.length) {
            return taskTypes;
        }
        console.log('setting task types to:', value);
        taskTypes = value;
        return gantt;
    };

    gantt.taskStatus = function(value) {
        if (!arguments.length) {
            return taskStatus;
        }
        taskStatus = value;
        return gantt;
    };

    gantt.width = function(value) {
        if (!arguments.length) {
            return width;
        }
        width = Number(value);
        return gantt;
    };

    gantt.height = function(value) {
        if (!arguments.length) {
            return height;
        }
        height = Number(value);
        return gantt;
    };

    gantt.tickFormat = function(value) {
        if (!arguments.length) {
            return tickFormat;
        }
        tickFormat = value;
        return gantt;
    };

    gantt.selector = function(value) {
        if (!arguments.length) {
            return selector;
        }
        selector = value;
        return gantt;
    };

    return gantt;
};

export default Gantt;
