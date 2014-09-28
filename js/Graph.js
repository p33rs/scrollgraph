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
    } else if (element.length !== 1) {
        throw new RangeError('expected one selection, received ' + element.length.toString());
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

    this.resizeTimer = null;
    window.addEventListener('resize', this.resize.bind(this));

    // no y scale. it's additive.
    this.xScale = d3.scale.linear();
    this.xAxis = d3.svg.axis().scale(this.xScale).orient('top');
    this.area = d3.svg.area()
        .y(function(d) {
            return (d.date);
        }.bind(this))
        .x0(0)
        .x1(function(d) {
            return this.xScale(d.data);
        }.bind(this));

    Observable(this);
}

Graph.prototype.redraw = function() {

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
        ? Math.floor(this.dataset.start.getTime()/1000) - interval
        : Math.floor(Date.getTime()/1000);
    var start = end - interval;
    this.fetcher.fetch(start, end, step);
};

Graph.prototype.resize = function() {
    if (this.resizeTimer) {
        window.clearTimeout(this.resizeTimer);
    }
    var self = this;
    this.resizeTimer = window.setTimeout(function() {
        var total = window.innerWidth;
        var time = parseInt(this.time.element.style('width').replace('px', ''), 10);
        var width = .5 * total - .5 * time;
        self.left.element.transition().attr('width', width);
        self.right.element.transition().attr('width', width);
    }, 500);
};