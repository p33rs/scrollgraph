/**
 * Creates a <g> containing an area graph representing the given dataset.
 * Handles its own data retrieval, and, as a result, scale domains.
 * Scale ranges (essentially, output height, width) are settable.
 * Is unaware of positioning and should be able to work independently of other Scrollgraph objects.
 * @param {d3.selection} element A d3 <g> selection
 * @param {Bandwidth} bandwidth a data set
 * @constructor
 */
function Graph(element, bandwidth) {
    Observable(this);
    if (!element || !(element instanceof d3.selection)) {
        throw new TypeError('expected d3 selection');
    } else if (element.empty()) {
        throw new RangeError('expected one selection');
    }
    if (!bandwidth || !(bandwidth instanceof Bandwidth)) {
        throw new TypeError('expected bandwidth');
    }

    // pass the "load" event straight up. this preserves its data.
    this.data = bandwidth.on('load', this.trigger.bind(null, 'load'), this);

    this.element = element;
    this.element.append('g').classed('axis_y', true);
    this.element.append('g').classed('graph', true);

    this.yScale = d3.scale.linear();
    this.yAxis = d3.svg.axis().scale(this.yScale).orient('top');
    this.xScale = d3.time.scale();
    this.area = d3.svg.area()
        .x(function(d) {
            return this.xScale(d.time);
        }.bind(this))
        .y0(0)
        .y1(function(d) {
            return this.yScale(d.data);
        }.bind(this));
}

Graph.prototype.redraw = function() {
    // ranges already set externally, according to window size
    this.yScale
        .domain([this.data.min ? this.data.min : 0, this.data.max ? this.data.max : 0])
    this.xScale
        .domain([this.data.start ? this.data.start : 0, this.data.end ? this.data.end : 0]);
    var path = this.element.select('.path');
    if (path.empty()) {
        path = this.element
            .select('.graph')
            .append('path').attr('class', 'path');
    }
    console.log(this.xScale.domain(), this.xScale.range());
    console.log(this.yScale.domain(), this.yScale.range());
    console.log('-------------------------------');
    // @TODO yaxis
    path.datum(this.data.getData()).attr('d', this.area);
    this.trigger('redraw', this);
};

/**
 * @param step
 * @param interval
 */
Graph.prototype.fetch = function(step, interval) {
    if (typeof step !== 'number') {
        throw new TypeError('expected numeric step');
    }
    if (typeof interval !== 'number') {
        throw new TypeError('expected numeric interval');
    }
    var end = this.data.start
        ? Math.floor(this.data.start.getTime()/1000) - step
        : Math.floor(new Date().getTime()/1000);
    var start = end - interval;
    this.data.fetch(start, end, step);
};

Graph.prototype.setXRange = function(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError ('expected numeric min, max');
    }
    if (min < 0 || max < 0 || max < min) {
        throw new RangeError ('invalid min, max');
    }
    this.xScale.range([min, max]);
    return this;
};

Graph.prototype.setYRange = function(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError ('expected numeric min, max');
    }
    if (min < 0 || max < 0 || max < min) {
        throw new RangeError ('invalid min, max');
    }
    this.yScale.range([min, max]);
    return this;
};

Graph.prototype.getHeight = function() {
    return this.element.node().getBBox().height;
};
Graph.prototype.getWidth = function() {
    return this.element.node().getBBox().width;
};