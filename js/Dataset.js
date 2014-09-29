function Dataset() {
    this.data = [];
    this.min = null;
    this.max = null;
    this.start = null;
    this.end = null;
}

Dataset.prototype.addData = function(data) {
    if (!(data instanceof Array)) {
        throw new TypeError('expected data object')
    }
    for (var i = data.length - 1; i >= 0; i--) {
        this.addDatum(data[i]);
    }
    return this;
};
Dataset.prototype.addDatum = function(datum) {
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
Dataset.prototype.count = function() {
    return this.data.length;
};
Dataset.prototype.getData = function() {
    return this.data;
};