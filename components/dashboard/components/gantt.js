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

/* ******************************************************************************
 * Gantt                                                                   */ /**
 *
 * The Gantt class uses d3 to draw a gantt chart of tasks organized by task type.
 *
 ********************************************************************************/
export class Gantt {
    /**
     * Gantt class constructor.
     *
     * @param {string} selector
     *      The selector for the element on the page which will be the parent
     *      of the svg gantt chart that is drawn.
     * @param {number} width
     *      Width in pixels of the view area for the chart, the actual chart
     *      will be offset within this width by the left and right margins.
     */
    constructor(selector, width) {
        /** backing store for getter/setter properties */
        this.privateProp = {};

        this.selector = selector;
        this.margin = {
            top: 20,
            right: 50,
            bottom: 20,
            left: 50,
        };
        const initWidth = width || document.body.clientWidth / 2;
        this.width = (initWidth - (initWidth / 5)) - this.margin.right - this.margin.left;
        this.height = 250; // alternatively '100%'
        this.timeDomain = [d3.timeDay.offset(new Date(), -3), d3.timeHour.offset(new Date(), +3)];
        this.timeDomainMode = TimeDomainMode.FIT; // fixed or fit
        this.taskTypes = [];
        this.taskStatus = [];
        this.tickFormat = '%H:%M';

        this.x = d3
            .scaleTime()
            .domain(this.timeDomain)
            .range([0, this.width])
            .clamp(true);

        this.y = d3
            .scaleBand()
            .domain(this.taskTypes)
            .range([0, this.height - this.margin.top - this.margin.bottom], 0.1);

        this.xAxis = d3
            .axisBottom(this.x)
            .tickFormat(d3.timeFormat(this.tickFormat))
            .tickSize(8)
            .tickPadding(8)
            .ticks(d3.timeMinute.every(15)); // TODO: Why isn't this setting in initAxis?

        this.yAxis = d3.axisLeft(this.y).tickSize(0);

        this.keyFunction = (d) => {
            return d.startDate + d.taskName + d.endDate;
        };

        this.rectTransform = (d) => {
            return 'translate(' + this.x(d.startDate) + ',' + this.y(d.taskName) + ')';
        };
    }

    /*
     * Gantt property getters/setters
     */
    get selector() {
        return this.privateProp.selector;
    }
    set selector(sel) {
        this.privateProp.selector = sel;
    }

    get width() {
        return this.privateProp.width;
    }
    set width(w) {
        this.privateProp.width = Number(w);
    }

    get height() {
        return this.privateProp.height;
    }
    set height(h) {
        this.privateProp.height = Number(h);
    }

    get margin() {
        return this.privateProp.margin;
    }
    set margin(m) {
        this.privateProp.margin = m;
    }

    get timeDomain() {
        return [this.privateProp.timeDomainStart, this.privateProp.timeDomainEnd];
    }
    set timeDomain(td) {
        this.privateProp.timeDomainStart = Number(td[0]);
        this.privateProp.timeDomainEnd = Number(td[1]);
    }

    get tickFormat() {
        return this.privateProp.tickFormat;
    }
    set tickFormat(fmt) {
        this.privateProp.tickFormat = fmt;
    }

    /**
     * @param {string} tdMode
     *      - 'fit' - the domain fits the data
     *      - 'fixed' - fixed domain
     * @returns {string} current time domain mode
     */
    get timeDomainMode() {
        return this.privateProp.timeDomainMode;
    }
    set timeDomainMode(tdMode) {
        this.privateProp.timeDomainMode = tdMode;
    }

    get taskTypes() {
        return this.privateProp.taskTypes;
    }
    set taskTypes(value) {
        logger.debug('setting task types to:', value);
        this.privateProp.taskTypes = value;
    }

    get taskStatus() {
        return this.privateProp.taskStatus;
    }
    set taskStatus(status) {
        this.privateProp.taskStatus = status;
    }

    /*
     * chaining property setting functions
     */
    setSelector(sel) {
        this.selector = sel;
        return this;
    }

    setWidth(w) {
        this.width = w;
        return this;
    }

    setTaskTypes(types) {
        this.taskTypes = types;
        return this;
    }

    setTaskStatus(status) {
        this.taskStatus = status;
        return this;
    }

    /**
     * draw the given tasks using the current set of task types
     *
     * @param {Array} tasks
     */
    draw(tasks) {
        logger.debug('tasks:', tasks);

        this.initTimeDomain(tasks);
        this.initAxis();

        const containerSize = {
            height: this.height + this.margin.top + this.margin.bottom,
            width: this.width + this.margin.left + this.margin.right,
        };
        const svg = d3
            .select(this.selector)
            .append('svg')
            .attr('class', 'chart')
            .attr('width', containerSize.width)
            .attr('height', containerSize.height)
            .style('overflow', 'visible')
            .append('g')
            .attr('class', 'gantt-chart')
            .attr('role', 'figure')
            .attr('aria-labelledby', 'gantt-label')
            .attr('width', containerSize.width)
            .attr('height', containerSize.height)
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        svg.append('title')
            .attr('id', 'gantt-label')
            .text('Timeline Chart');

        svg.selectAll('.chart')
            .data(tasks, this.keyFunction)
            .enter()
            .append('g')
            .attr('role', 'presentation')
            .attr('aria-label', (d) => {
                const startTime = d3.timeFormat(this.tickFormat)(d.startDate);
                const utteranceLength = Math.round((d.endDate - d.startDate) / 1000);
                return `${startTime}, ${d.taskName} spoke for ${utteranceLength} seconds`;
            })
            .append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('class', (d) => {
                if (this.taskStatus[d.status] === null) {
                    return 'bar';
                }
                return this.taskStatus[d.status];
            })
            .attr('y', 0)
            .attr('transform', this.rectTransform)
            .attr('height', this.y.bandwidth())
            .attr('width', (d) => {
                return Math.max(1, this.x(d.endDate) - this.x(d.startDate));
            })
            .attr('fill', (d) => {
                return d.color;
            });

        svg.append('g')
            .attr('class', 'x axis')
            .attr('class', 'axisGray')
            .attr('aria-hidden', 'true')
            .attr('transform', `translate(0, ${this.height - this.margin.top - this.margin.bottom})`)
            .transition()
            .call(this.xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('class', 'axisGray')
            .attr('aria-hidden', 'true')
            .transition()
            .call(this.yAxis);

        return this;
    }

    redraw(tasks) {
        this.initTimeDomain(tasks);
        this.initAxis();

        const svg = d3.select('.chart');

        const ganttChartGroup = svg.select('.gantt-chart');
        const rect = ganttChartGroup.selectAll('rect').data(tasks, this.keyFunction);

        rect.enter()
            .insert('rect', ':first-child')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('class', (d) => {
                if (this.taskStatus[d.status] == null) {
                    return 'bar';
                }
                return this.taskStatus[d.status];
            })
            .transition()
            .attr('y', 0)
            .attr('transform', this.rectTransform)
            .attr('height', this.y.bandwidth())
            .attr('width', (d) => {
                return Math.max(1, this.x(d.endDate) - this.x(d.startDate));
            })
            .attr('fill', (d) => {
                return d.color;
            });

        rect.transition()
            .attr('transform', this.rectTransform)
            .attr('height', this.y.bandwidth())
            .attr('width', (d) => {
                return Math.max(1, this.x(d.endDate) - this.x(d.startDate));
            });

        rect.exit().remove();

        svg.select('.x')
            .transition()
            .call(this.xAxis);
        svg.select('.y')
            .transition()
            .call(this.yAxis);

        return this;
    }

    /**
     * set the time domain start and end values based on the given tasks
     * and the current time domain mode.
     */
    initTimeDomain(tasks) {
        logger.debug('initializing time domain with tasks:', tasks);
        let timeDomainStart;
        let timeDomainEnd;
        if (this.timeDomainMode === TimeDomainMode.FIT) {
            if (tasks === undefined || tasks.length < 1) { // eslint-disable-line no-undefined
                timeDomainStart = [d3.timeDay.offset(new Date(), -3), d3.timeHour.offset(new Date(), +3)];
                timeDomainEnd = [d3.timeDay.offset(new Date(), -3), d3.timeHour.offset(new Date(), +3)];
            } else {
                // TODO: need the earliest startDate and the latest endDate, depending on how the tasks
                // overlap that may not be the start of the first and the end of the last. Check!
                timeDomainStart = tasks[0].startDate;
                timeDomainEnd = tasks[tasks.length - 1].endDate;
            }
            this.timeDomain = [timeDomainStart, timeDomainEnd];
            logger.debug('Gantt time domain:', {timeDomainStart, timeDomainEnd});
        }
    }

    /**
     * set the x, y, xAxis and yAxis d3 functions based on the current values
     * of time domain, width, height, margins...
     */
    initAxis() {
        this.x = d3
            .scaleTime()
            .domain(this.timeDomain)
            .range([0, this.width])
            .clamp(true);

        this.y = d3
            .scaleBand()
            .domain(this.taskTypes)
            .range([0, this.height - this.margin.top - this.margin.bottom], 0.1);

        this.xAxis = d3
            .axisBottom(this.x)
            .tickFormat(d3.timeFormat(this.tickFormat))
            .tickSize(8)
            .tickPadding(8);

        this.yAxis = d3.axisLeft(this.y).tickSize(0);
    }
}
