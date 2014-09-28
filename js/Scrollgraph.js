function Scrollgraph(left, right, time) {
    if (!left || !(left instanceof Graph)) {
        throw new TypeError('expected left graph');
    }
    if (!right || !(right instanceof Graph)) {
        throw new TypeError('expected right graph');
    }
    if (!time || !(time instanceof Timescale)) {
        throw new TypeError('expected timescale');
    }
    this.left = left;
    this.right = right;
    this.time = time;
    this.hasInit = false;
    this.fetching = false;
    this.const = {
        scrollPad: 50,
        step: 1800,
        waiting: $('<div />').addClass('waiting').text('loading ...')
    }
};

Scrollgraph.prototype.init = function() {
    if (this.hasInit) {
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('scroll', this.scroll.bind(this));
        this.hasInit = true;
    }
    return this;
};

Scrollgraph.prototype.scroll = function() {
    if (!this.fetching) {
        // are we at the bottom?
        var bottom = document.getElementsByTagName('body')[0].scrollHeight;
        var currently = window.scrollY + window.innerHeight;
        if (bottom - currently < this.const.scrollPad) {
            this.fetch();
        }
    }
};

Scrollgraph.prototype.fetch = function() {
    if (this.fetching) {
        return;
    }
    
};

Scrollgraph.prototype.resize = function() {
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