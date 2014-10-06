/**
 * Model representing bandwidth data.
 * Provides a consistent interface to graphable data.
 * @param {string} url URL to retrieve data from.
 * @constructor
 */
function Bandwidth(url) {
    if (typeof url !== 'string') {
        throw new TypeError ('required URL');
    }
    this.url = url;
    this.data = [];
    this.min = null;
    this.max = null;
    this.start = null;
    this.end = null;
    Observable(this);
}



Bandwidth.prototype.addDatum = function(datum) {
    if (typeof datum !== 'object') {
        throw new TypeError('expected datum object')
    }
    if (!datum.data && datum.data !== 0) {
        throw new Error('expected datum value')
    }
    if (!datum.time && datum.time !== 0) {
        throw new Error('expected datum timestamp')
    }
    var newDatum = {
        data: parseInt(datum.data, 10),
        time: new Date(parseInt(datum.time, 10) * 1000)
    };
    if (this.min === null || newDatum.data < this.min) {
        this.min = newDatum.data;
    }
    if (this.max === null || newDatum.data > this.max) {
        this.max = newDatum.data;
    }
    if (this.end === null || newDatum.time.getTime() > this.end.getTime()) {
        this.end = newDatum.time;
    }
    if (this.start === null || newDatum.time.getTime() < this.start.getTime()) {
        this.start = newDatum.time;
    }
    // insert at correct position. optimize for our backwards timescale.
    var added = false;
    // from first to last
    for (var i = 0; i < this.data.length; i++) {
        if (newDatum.time.getTime() < this.data[i].time.getTime) {
            this.data.splice(i, 0, newDatum);
        }
    }
    if (!added) {
        this.data.push(newDatum);
    }
    return this;
};
Bandwidth.prototype.count = function() {
    return this.data.length;
};
Bandwidth.prototype.getData = function() {
    return this.data;
};

/**
 * Fetch new data and add it to the set.
 * All params simply pass through to the fetch URL.
 * @param {int} start
 * @param {int} end
 * @param {int} step
 */
Bandwidth.prototype.fetch = function(start, end, step) {
    $.ajax({
        data: {
            start: start,
            end: end,
            step: step
        },
        dataType: 'json',
        type: 'GET',
        url: this.url,
        error: function() {
            this.trigger('load', null);
        }.bind(this),
        success: function(data) {
            if (!data || !data.status || !data.data || !(data.data.datapoints instanceof Array)) {
                this.trigger('load', null);
                return;
            }
            var datapoints = data.data.datapoints;
            for (var i = datapoints.length - 1; i >= 0; i--) {
                this.addDatum(datapoints[i]);
            }
            this.trigger('load', datapoints);
        }.bind(this)
    });
};