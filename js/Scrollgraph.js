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
function Scrollgraph(element, left, right, axes, options) {

    if (!element || !(element instanceof d3.selection)) {
        throw new TypeError('element: expected d3 selection');
    }
    if (!axes || !(axes instanceof Axes)) {
        throw new TypeError('expected axes');
    }
    if (!left || !(left instanceof Graph)) {
        throw new TypeError('expected left graph');
    }
    if (!right || !(right instanceof Graph)) {
        throw new TypeError('expected right graph');
    }

    this.element = element;
    this.left = left
        .on('load', this.finishLeft, this);
    this.right = right
        .on('load', this.finishRight, this);

    this.axes = axes;

    Configurable(this);
    this.options(this.defaultOptions);
    if (options) {
        this.options(options);
    }
    
    this.fetchingLeft = false;
    this.fetchingRight = false;
    this.resizeTimer = null;
    this.hasInit = false;

    /** @todo dude no */
    this.lStriper = new Striper([187, 226, 181], [9, 108, 46], this.element.select('#pattern-left'));
    this.rStriper = new Striper([190, 214, 229], [14, 82, 153], this.element.select('#pattern-right'));

};


Scrollgraph.prototype.defaultOptions = {
    dataDistance: 10, // in px, how tall is a step
    scrollPad: 50, // loading from scrolling provides this much slack
    step: 300, // passed as API argument. how much time per datapoint?
    interval: 21600, // total timespan to retrieve with each scroll-load
    waiting: $('<div />').addClass('waiting').text('loading ...'),
    middleMargin: 100,
    topMargin: 80
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
    var fillScreen = this.left.getHeight() && this.right.getHeight() && (this.left.getHeight() < window.innerHeight || this.right.getHeight() < window.innerHeight)
    var interval = fillScreen
        ? this.options('interval')
        : (window.innerHeight + this.options('scrollPad')) / this.options('dataDistance') * this.options('step');

    console.log(this.left.getHeight(), window.innerHeight);
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
    this.updateYRanges().updateXRanges().redraw();
    // todo scroll, in case they made window bigger during fetch
    // careful, in current implementation, leads to an infinite loop
};

Scrollgraph.prototype.redraw = function() {
    this.left.redraw();
    this.right.redraw();
    this.axes.redraw();
    this.reposition().resizeAxes();
    this.lStriper.stripe(this.axes.getLAxis().selectAll('.tick').size());
    this.left.getArea().attr('fill', 'url(#'+this.lStriper.getId()+')');
    this.rStriper.stripe(this.axes.getRAxis().selectAll('.tick').size());
    this.right.getArea().attr('fill', 'url(#'+this.rStriper.getId()+')');
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

Scrollgraph.prototype.resizeAxes = function() {
    this.axes.getHAxis()
        .attr('height', this.options('topMargin'))
        .attr('width', this.windowWidth());
    return this;
};

Scrollgraph.prototype.updateYRanges = function() {
    var width = (this.windowWidth() - this.options('middleMargin')) / 2;
    this.left.setYRange(0, width);
    this.right.setYRange(0, width);
    return this;
};

Scrollgraph.prototype.updateXRanges = function() {
    // determine the widest timespan
    var left = this.left.data.count();
    var right = this.right.data.count();
    var max =  (right > left ? right : left) * this.options('dataDistance');
    this.element.attr('height', max);
    this.left.setXRange(max, 0);
    this.right.setXRange(max, 0);
    return this;
};

Scrollgraph.prototype.reposition = function() {
    var top = this.options('topMargin');
    var maxWidth = (this.windowWidth() - this.options('middleMargin')) / 2;
    var rightOffset = this.windowWidth() - this.right.getHeight();

    // left: rotate -90 about top left; translate downward
    this.left.element.attr('transform', 'rotate(90 0 0) translate('+top.toString()+', -'+(maxWidth).toString()+')');
    // right: rotate -90 about top left; scaleX -1; translate rightward
    this.right.element.attr('transform', 'rotate(-90 0 0) scale(-1,1) translate('+top.toString()+', '+ rightOffset.toString()+')');
    this.axes.setWidth(this.left.getWidth(), this.right.getWidth());
    this.axes
        .offsetVAxis(maxWidth, top)
        .offsetLAxis(0, top)
        .offsetRAxis(maxWidth + this.options('middleMargin'), top)
    return this;
};

Scrollgraph.prototype.regradient = function() {
    // how many ticks


};

/**
 * such convenience
 * @returns {number}
 */
Scrollgraph.prototype.windowWidth = function() {
    return document.documentElement.clientWidth || document.body.clientWidth;
};