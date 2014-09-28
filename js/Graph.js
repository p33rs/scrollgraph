function Graph(element, dataset, fetcher) {
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
    var start = this.dataset.end
        ? Math.floor(this.dataset.end.getTime()/1000) + interval
        : Math.floor(Date.getTime()/1000);
    var end = start + interval;
    this.fetcher.fetch(start, end, step);
};