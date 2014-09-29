/**
 * Height changes on redraw.
 * Width changes on resize triggered by scrollgraph.
 * @param element
 * @param dataset
 * @param fetcher
 * @constructor
 */
function Graph(element, dataset, fetcher, yDist) {
    if (!element || !(element instanceof d3.selection)) {
        throw new TypeError('expected d3 selection');
    } else if (element.empty()) {
        throw new RangeError('expected one selection');
    }
    if (!dataset || !(dataset instanceof Dataset)) {
        throw new TypeError('expected dataset');
    }
    if (!fetcher || !(fetcher instanceof BandwidthFetcher)) {
        throw new TypeError('expected fetcher');
    }
    this.element = element;
    this.dataset = dataset;
    this.fetcher = fetcher.on('load', this.onLoad, this);
    this.yDist = yDist;

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

    Observable(this);

}

Graph.prototype.redraw = function() {
    this.xScale.domain([this.dataset.min ? this.dataset.min : 0, this.dataset.max ? this.dataset.max : 0])
    this.yScale
        .domain([this.dataset.start ? this.dataset.start : 0, this.dataset.end ? this.dataset.end : 0])
        .range([0, this.dataset.count() * this.yDist]);
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
};

Graph.prototype.onLoad = function(data) {
    if (data) {
        this.dataset.addData(data);
    } else {
        /** @TODO how are errors handled? */
        alert('lol');
    }
    this.trigger('load', data);
    return this;
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

Graph.prototype.width = function() {
    return this.element.node().getBBox().width;
};
Graph.prototype.height = function() {
    return this.element.node().getBBox().height;
};