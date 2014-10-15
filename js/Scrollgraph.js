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

    this.left = left
        .on('load', this.finishLeft, this);
    this.right = right
        .on('load', this.finishRight, this);
    this.time = time;

    Configurable(this);
    this.options(this.defaultOptions);
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
IT IS THIS ELEMENT THERE IS NO REASON TO ADD COMPLICATION

okay
so
repositioning means we give the graphelement a new height (well, width) and we also have to
set a new x offset.
We'll hard-code a Timescale width in here.
We'll also

EXECUTIVE DECISION:
"X" is the TIME SCALE.
"Y" is the DATA SCALE.
As far as the GRAPH is concerned, this shit is horizontal.

How are width and height managed? Well, we know the data distance here, so
I guess the graphs /DON'T KNOW THEIR OWN HEIGHT OR WIDTH/, which also means
the graphs /DON'T MANAGE THEIR OWN RANGES./ They simply manage their domains,
when new data comes in.

on ranges:
on resize, we update the Y range and redraw the graph. we also reposition.
  finally, we see if we need to refetch.
on fetch, we update the X range and redraw the graph.

 */


Scrollgraph.prototype.defaultOptions = {
    dataDistance: 10, // in px, how tall is a step
    scrollPad: 50, // loading from scrolling provides this much slack
    step: 300, // passed as API argument. how much time per datapoint?
    interval: 21600, // total timespan to retrieve with each scroll-load
    waiting: $('<div />').addClass('waiting').text('loading ...'),
    middleMargin: 100
};

Scrollgraph.prototype.validateOptions = function(options) {
    return (
        options &&
            (typeof options.dataDistance === 'number' && options.dataDistance > 0 ) &&
            (typeof options.scrollPad === 'number' && options.scrollPad > 0 ) &&
            (typeof options.step === 'number' && options.step > 0 ) &&
            (typeof options.interval === 'number' && options.interval > 0 ) &&
            (typeof options.middleMargin === 'number' && options.middleMargin > 0 ) &&
            options.waiting
    );
}



Scrollgraph.prototype.init = function() {
    if (!this.hasInit) {
        window.addEventListener('scroll', this.scroll.bind(this));
        window.addEventListener('resize', this.scroll.bind(this));
        window.addEventListener('resize', this.resize.bind(this));
        this.hasInit = true;
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
    console.log(this.left.getWidth(), 'a');
    var interval = this.left.getHeight() < window.innerHeight || this.right.getHeight() < window.innerHeight
        ? this.options('interval')
        : (window.innerHeight + this.options('scrollPad')) / this.options('dataDistance') * this.options('step');
    this.left.fetch(this.options('step'), interval);
    this.right.fetch(this.options('step'), interval);
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
    this.updateXRanges().redraw();
    // todo scroll, in case they made window bigger during fetch
    // careful, in current implementation, leads to an infinite loop
};

Scrollgraph.prototype.redraw = function() {
    this.left.redraw();
    this.right.redraw();
    this.reposition();
    return this;
};



Scrollgraph.prototype.scroll = function() {
    if (!this.fetchingLeft && !this.fetchingRight) {
        // are we at the bottom?
        var bottom = document.getElementsByTagName('body')[0].scrollHeight;
        var currently = window.scrollY + window.innerHeight;
        if (bottom - currently < this.options('scrollPad')) {
            this.fetch();
        }
    }
};

Scrollgraph.prototype.resize = function() {
    if (this.resizeTimer) {
        window.clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = window.setTimeout(function() {
        this.updateYRanges().redraw().scroll();
    }.bind(this), 500);
};

Scrollgraph.prototype.updateYRanges = function() {
    var total = window.innerWidth;
    var width = total / 2 - this.options('middleMargin') / 2;
    left.setYRange(0, width);
    right.setYRange(0, width);
    return this;
};

Scrollgraph.prototype.updateXRanges = function() {
    // determine the widest timespan
    var left = this.left.data.count();
    var right = this.right.data.count();
    var max =  (right > left ? right : left) * this.options('dataDistance');
    this.left.setXRange(0, max);
    this.right.setXRange(0, max);
    return this;
};

Scrollgraph.prototype.reposition = function() {
    // left: rotate -90 about top left; translate downward by <width>
    this.left.element.attr('transform', 'rotate(90) translate(0, '+this.left.getWidth().toString()+')');
    // right: rotate -90 about top left; scaleX -1; translate right 2(height) + middle
    this.right.element.attr('transform', 'rotate(-90) scale(-1,0) translate('+(2*this.right.getHeight()+this.options('middleMargin')).toString()+')');
    return this;
};