/**
 * Mediates communication between user input, data, and our various view objects.
 * Knows to say, "user scrolled to the bottom, retrieve X data",
 *   or "data retrieved, update graphs and labels"
 * Like a fine Persian rug, ties the room together.
 * @param {GraphElement} view
 * @param {Graph} left
 * @param {Graph} right
 * @param {Timescale} time
 * @param {Object} options
 * @constructor
 */
function Scrollgraph(view, left, right, time, options) {

    if (!view || !(view instanceof GraphElement)) {
        throw new TypeError('expected graphelement');
    }
    if (!left || !(left instanceof Graph)) {
        throw new TypeError('expected left graph');
    }
    if (!right || !(right instanceof Graph)) {
        throw new TypeError('expected right graph');
    }
    if (!time || !(time instanceof Timescale)) {
        throw new TypeError('expected timescale');
    }

    this.view = view;
    this.left = left
        .on('load', this.finishLeft, this)
        .on('redraw', this.view.positionContents, this.view);
    this.right = right
        .on('load', this.finishRight, this)
        .on('redraw', this.view.positionContents, this.view);
    this.time = time;
    this.opts = this.defaultOptions;
    if (options) {
        this.options(options);
    }
    this.fetchingLeft = false;
    this.fetchingRight = false;
    this.resizeTimer = null;
    this.hasInit = false;

};

/*

Some ramblin:
First of all, graph positioning shouldn't be in the CSS.
Second of all: Graph positioning is mediated by the Scrollgraph. Each graph should know nothing about its position
or its orientation. It simply knows its width.
So, how do we handle this? We have the added fuckup of having to deal with a right-side graph and a left-side graph.
Drawing the leftside graph is a bit more tricky because we need to do (ScaleX -1 Transform -100%,0) on top
of whatever else. Whose responsibility is it to know that?
Do we need to have a third object that knows how to arrange this shit? Maybe.
Hm.
Finally, we have the Timescale. This should also know nothing about itself, except its width and height, and it
should have a copy of the appropriate scales.
The timescale floats independently of the two graphs. We don't need to define a box for it.
So we should create an object for positioning those graphs.

That object is probably an SVG object that represents the SVG itself. It has access to each of the elements.
When we instantiate the graphs, we provide them with their elements by pulling them out of the SVG object.


 */


Scrollgraph.prototype.defaultOptions = {
    dataDistance: 10, // in px, how tall is a step
    scrollPad: 50, // loading from scrolling provides this much slack
    step: 300, // passed as API argument. how much time per datapoint?
    interval: 21600, // total timespan to retrieve with each scroll-load
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
    if (!this.hasInit) {
        window.addEventListener('scroll', this.scroll.bind(this));
        window.addEventListener('resize', this.scroll.bind(this));
        this.hasInit = true;
        this.updateRanges();
        this.fetch();
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
    var interval = this.left.height() < window.innerHeight || this.right.height() < window.innerHeight
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
    //todo scroll. be careful, leads to an infinite loop
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

Scrollgraph.prototype.resize = function() {
    if (this.resizeTimer) {
        window.clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = window.setTimeout(function() {
        this.updateRanges();
    }.bind(this), 500);
};

Scrollgraph.prototype.updateRanges = function() {
    var total = window.innerWidth;
    var time = this.time.width();
    var width = total / 2 - time / 2;
    left.setRange(0, width);
    right.setRange(0, width);
    return this;
}