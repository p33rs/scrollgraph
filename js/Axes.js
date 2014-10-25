function Axes(lAxisElement, rAxisElement, vAxisElement, xScale, yScale) {

    if (!lAxisElement || !(lAxisElement instanceof d3.selection)) {
        throw new TypeError('laxis: expected d3 selection');
    }
    if (!rAxisElement || !(rAxisElement instanceof d3.selection)) {
        throw new TypeError('raxis: expected d3 selection');
    }
    if (!vAxisElement || !(vAxisElement instanceof d3.selection)) {
        throw new TypeError('vaxis: expected d3 selection');
    }

    this.lAxisElement = lAxisElement;
    this.rAxisElement = rAxisElement;
    this.vAxisElement = vAxisElement;
    this.xScale = xScale;
    this.yScale = yScale;

    this.xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('right')
        .outerTickSize(0)
        .tickPadding(0);
    this.yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('top')
        .outerTickSize(2)
        .ticks(5)
        .tickPadding(0);

};

Axes.prototype.setWidth = function(left, right) {
    if (typeof left !== 'number' || left < 0) {
        throw new TypeError('left: expected unsigned number');
    }
    if (typeof right !== 'number' || left < 0) {
        throw new TypeError('right: expected unsigned number');
    }
    this.lAxisElement.attr('width', left);
    this.rAxisElement.attr('width', right);
    return this;
};

Axes.prototype.redraw = function() {
    var domain = this.xAxis.scale().domain();
    var span = domain[1].getTime() - domain[0].getTime();
    this.xAxis.ticks(span / 1800000)
    this.yAxis(this.lAxisElement);
    this.yAxis(this.rAxisElement);
    this.xAxis(this.vAxisElement);
    return this;
};

Axes.prototype.offsetVAxis = function(x, y) {
    return this.offset(this.vAxisElement, x, y);
};

Axes.prototype.offsetLAxis = function(x, y) {
    return this.offset(this.lAxisElement, x, y);
};

Axes.prototype.offsetRAxis = function(x, y) {
    return this.offset(this.rAxisElement, x, y);
};

Axes.prototype.offset = function (axis, x, y) {
    axis.attr('transform', 'translate('+ x.toString() + ',' + y.toString() + ')');
    return this;
};