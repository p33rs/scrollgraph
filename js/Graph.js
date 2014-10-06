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
    this.dataset = bandwidth.on('load', this.trigger.bind(null, 'load'), this);

    this.element.append('g').classed('axis_x', true);
    this.element.append('g').classed('graph', true);

    this.xScale = d3.scale.linear();
    this.xAxis = d3.svg.axis().scale(this.xScale).orient('top');
    this.yScale = d3.time.scale();
    this.area = d3.svg.area()
        .y(function(d) {
            return this.yScale(d.time);
        }.bind(this))
        .x0(0)
        .x1(function(d) {
            return this.xScale(d.data);
        }.bind(this));
}

Graph.prototype.redraw = function() {
    this.xScale.domain([this.dataset.min ? this.dataset.min : 0, this.dataset.max ? this.dataset.max : 0])
    this.yScale
        .domain([this.dataset.start ? this.dataset.start : 0, this.dataset.end ? this.dataset.end : 0]);
    var path = this.element.select('.path');
    if (path.empty()) {
        path = this.element
            .select('.graph')
            .append('path').attr('class', 'path');
    }
    console.log(this.xScale.domain(), this.xScale.range());
    console.log(this.yScale.domain(), this.yScale.range());
    console.log('-------------------------------');
    path.datum(this.dataset.getData()).attr('d', this.area);
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
    var end = this.dataset.start
        ? Math.floor(this.dataset.start.getTime()/1000) - step
        : Math.floor(new Date().getTime()/1000);
    var start = end - interval;
    this.fetcher.fetch(start, end, step);
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
    this.xScale.range([min, max]);
    return this;
};