function Scrollgraph(left, right, time, options) {
    if (!left || !(left instanceof Graph)) {
        throw new TypeError('expected left graph');
    }
    if (!right || !(right instanceof Graph)) {
        throw new TypeError('expected right graph');
    }
    if (!time || !(time instanceof Timescale)) {
        throw new TypeError('expected timescale');
    }
    this.opts = this.defaultOptions;
    if (options) {
        this.options(options);
    }
    this.left = left.on('load', this.finishLeft, this);
    this.right = right.on('load', this.finishRight, this);
    this.time = time;
    this.hasInit = false;

};



Scrollgraph.prototype.defaultOptions = {
    dataDistance: 10,
    scrollPad: 50,
    step: 300, // every 5m
    interval: 21600, // load 6h (72*10=720px) at a time
    waiting: $('<div />').addClass('waiting').text('loading ...')
};
Scrollgraph.prototype.options = function(options, option) {
    if (typeof options === 'undefined') {
        return this.opts;
    }
    var newOptions = this.opts;
    if (typeof option === 'undefined' && typeof options === 'object') {
        $.extend(newOptions, options);
    } else if (typeof option !== 'undefined') {
        var v = {};
        v[options] = option;
        $.extend(newOptions, v);
    } else {
        throw TypeError('unexpected configuration');
    }
    if (this.validateOptions(newOptions)) {
        this.opts = newOptions;
    } else {
        console.log(newOptions);
        throw Error('invalid parameter');
    }
    return this;
};
Scrollgraph.prototype.validateOptions = function(options) {
    return (
        options &&
            (typeof options.dataDistance === 'number' && options.dataDistance > 0 ) &&
            (typeof options.scrollPad === 'number' && options.scrollPad > 0 ) &&
            (typeof options.step === 'number' && options.step > 0 ) &&
            (typeof options.interval === 'number' && options.interval > 0 ) &&
            options.waiting
    );
}



Scrollgraph.prototype.init = function() {
    if (this.hasInit) {
        window.addEventListener('scroll', this.scroll.bind(this));
        window.addEventListener('resize', this.scroll.bind(this));
        this.hasInit = true;
    }
    return this;
};



Scrollgraph.prototype.fetch = function() {
    if (this.fetchingLeft || this.fetchingRight) {
        return;
    }
    this.fetchingLeft = true;
    this.fetchingRight = true;
    // If we're already scrolled to top, fetch enough to fill the screen
    var interval = this.left.height < window.innerHeight || this.right.height < window.innerHeight
        ? this.opts.interval
        : (window.innerHeight + this.opts.scrollPad) / this.opts.dataDistance * this.opts.step;
    this.left.fetch(this.opts.step, interval);
    this.right.fetch(this.opts.step, interval);
    /** @todo SPIN */
};

Scrollgraph.prototype.finishLeft = function() {
    this.fetchingLeft = false;
    return this.finish();
};
Scrollgraph.prototype.finishRight = function() {
    this.fetchingRight = false;
    return this.finish();
};
Scrollgraph.prototype.finish = function() {
    if (this.fetchingLeft || this.fetchingRight) {
        return this;
    }
    /** @todo UNSPIN */
    this.redraw();
    // Check again, in case the window sized up during the fetch.
    this.scroll();
};

Scrollgraph.prototype.redraw = function() {
    this.left.redraw();
    this.right.redraw();
};



Scrollgraph.prototype.scroll = function() {
    if (!this.fetchingLeft && !this.fetchingRight) {
        // are we at the bottom?
        var bottom = document.getElementsByTagName('body')[0].scrollHeight;
        var currently = window.scrollY + window.innerHeight;
        if (bottom - currently < this.opts.scrollPad) {
            this.fetch();
        }
    }
};
