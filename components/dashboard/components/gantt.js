// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import d3 from 'utils/libs/d3';
import {logger} from 'utils/riff';

const TimeDomainMode = {
    FIT: 'fit',
    FIXED: 'fixed',
};

function createGantt(selector, width) {
    let margin = {
        top: 20,
        right: 50,
        bottom: 20,
        left: 50,
    };
    let timeDomainStart = d3.timeDay.offset(new Date(), -3);
    let timeDomainEnd = d3.timeHour.offset(new Date(), +3);
    let timeDomainMode = TimeDomainMode.FIT; // fixed or fit
    let taskTypes = [];
    let taskStatus = [];

    logger.debug('DOCUMENT BODY WIDTH', document.body.clientWidth);

    //let height = document.body.clientHeight - margin.top - margin.bottom-5;
    const initWidth = width || document.body.clientWidth / 2;
    logger.debug('HAVE WIDTH FROM REF:', width, 'BODY WIDTH:', document.body.clientWidth / 2);
    logger.debug('using init width:', initWidth);
    width = (initWidth - (initWidth / 5)) - margin.right - margin.left;

    //let width = '100%';
    let height = 250;

    //let width = 600;

    let tickFormat = '%H:%M';

    const keyFunction = (d) => {
        return d.startDate + d.taskName + d.endDate;
    };

    const rectTransform = (d) => {
        return 'translate(' + x(d.startDate) + ',' + y(d.taskName) + ')';
    };

    let x = d3
        .scaleTime()
        .domain([timeDomainStart, timeDomainEnd])
        .range([0, width])
        .clamp(true);

    let y = d3
        .scaleBand()
        .domain(taskTypes)
        .range([0, height - margin.top - margin.bottom], 0.1);

    let xAxis = d3
        .axisBottom(x)
        .tickFormat(d3.timeFormat(tickFormat))
        .tickSize(8)
        .tickPadding(8)
        .ticks(d3.timeMinute.every(15));

    let yAxis = d3.axisLeft(y).tickSize(0);

    const initTimeDomain = (tasks) => {
        logger.debug('initializing time domain with tasks:', tasks);
        if (timeDomainMode === TimeDomainMode.FIT) {
            if (tasks === undefined || tasks.length < 1) { // eslint-disable-line no-undefined
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
            logger.debug('time domain:', timeDomainStart, timeDomainEnd);
        }
    };

    const initAxis = () => {
        x = d3
            .scaleTime()
            .domain([timeDomainStart, timeDomainEnd])
            .range([0, width])
            .clamp(true);
        y = d3
            .scaleBand()
            .domain(taskTypes)
            .range([0, height - margin.top - margin.bottom], 0.1);
        xAxis = d3
            .axisBottom(x)
            .tickFormat(d3.timeFormat(tickFormat))
            .tickSize(8)
            .tickPadding(8);

        yAxis = d3.axisLeft(y).tickSize(0);
    };

    function gantt(tasks) {
        logger.debug('tasks:', tasks);

        initTimeDomain(tasks);
        initAxis();

        const svg = d3
            .select(selector)
            .append('svg')
            .attr('class', 'chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('class', 'gantt-chart')
            .attr('role', 'figure')
            .attr('aria-labelledby', 'gantt-label')

            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr(
                'transform',
                'translate(' + margin.left + ', ' + margin.top + ')'
            );

        svg.append('title')
            .attr('id', 'gantt-label')
            .text('Timeline Chart');

        svg.selectAll('.chart')
            .data(tasks, keyFunction)
            .enter()
            .append('g')
            .attr('role', 'presentation')
            .attr('aria-label', (d) => {
                const startTime = d3.timeFormat(tickFormat)(d.startDate);
                const utteranceLength = Math.round((d.endDate - d.startDate) / 1000);
                return `${startTime}, ${d.taskName} spoke for ${utteranceLength} seconds`;
            })
            .append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('class', (d) => {
                if (taskStatus[d.status] === null) {
                    return 'bar';
                }
                return taskStatus[d.status];
            })
            .attr('y', 0)
            .attr('transform', rectTransform)
            .attr('height', (d) => {
                return y.bandwidth();
            })
            .attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            })
            .attr('fill', (d) => {
                return d.color;
            });

        svg.append('g')
            .attr('class', 'x axis')
            .attr('class', 'axisGray')
            .attr('aria-hidden', 'true')
            .attr(
                'transform',
                'translate(0, ' + (height - margin.top - margin.bottom) + ')'
            )
            .transition()
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('class', 'axisGray')
            .attr('aria-hidden', 'true')
            .transition()
            .call(yAxis);

        logger.debug('gantt looks like:', gantt);
        return gantt;
    }

    gantt.redraw = (tasks) => {
        initTimeDomain(tasks);
        initAxis();

        const svg = d3.select('.chart');

        const ganttChartGroup = svg.select('.gantt-chart');
        const rect = ganttChartGroup.selectAll('rect').data(tasks, keyFunction);

        rect.enter()
            .insert('rect', ':first-child')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('class', (d) => {
                if (taskStatus[d.status] == null) {
                    return 'bar';
                }
                return taskStatus[d.status];
            })
            .transition()
            .attr('y', 0)
            .attr('transform', rectTransform)
            .attr('height', (d) => {
                return y.bandwidth();
            })
            .attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            })
            .attr('fill', (d) => {
                return d.color;
            });

        rect.transition()
            .attr('transform', rectTransform)
            .attr('height', (d) => {
                return y.bandwidth();
            })
            .attr('width', (d) => {
                return Math.max(1, x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select('.x')
            .transition()
            .call(xAxis);
        svg.select('.y')
            .transition()
            .call(yAxis);

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
        timeDomainStart = Number(value[0]);
        timeDomainEnd = Number(value[1]);
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
        logger.debug('setting task types to:', value);
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
}

export default createGantt;
