/**
 * @param {d3} hAxisElement
 * @param {d3} vAxisElement
 * @param {d3.scale} xScale
 * @param {d3.scale} vScale
 * @constructor
 * @todo the vaxis width should be set here, not in markup
 */
function Axes(hAxisElement, vAxisElement, xScale, yScale) {

    if (!hAxisElement || !(hAxisElement instanceof d3.selection)) {
        throw new TypeError('laxis: expected d3 selection');
    }
    if (!vAxisElement || !(vAxisElement instanceof d3.selection)) {
        throw new TypeError('vaxis: expected d3 selection');
    }

    this.hAxisElement = hAxisElement;
    this.lAxisElement = hAxisElement.select('.datascale.left');
    this.rAxisElement = hAxisElement.select('.datascale.right');
    this.vAxisElement = vAxisElement;
    this.xScale = xScale;
    this.yScale = yScale;
    this.padding = 4;

    this.yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('top')
        .outerTickSize(2)
        .ticks(5)
        .tickPadding(0)
        .tickFormat(this.byteFormat.bind(this));

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

    this.yAxis(this.rAxisElement);
    // flip the scale for the left-hand ticks
    this.yScale.range(this.yScale.range().reverse());
    this.yAxis(this.lAxisElement);
    this.yScale.range(this.yScale.range().reverse());

    this.renderXAxis(this.vAxisElement);

    return this;
};

Axes.prototype.getHAxis = function() {
    return this.hAxisElement;
};
Axes.prototype.getRAxis = function() {
    return this.rAxisElement;
};
Axes.prototype.getLAxis = function() {
    return this.lAxisElement;
};
Axes.prototype.getVAxis = function() {
    return this.vAxisElement;
}

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

Axes.prototype.renderXAxis = function(element) {
    var xScale = this.xScale;
    var domain = xScale.domain();
    var span = domain[1].getTime() - domain[0].getTime();
    var ticks = xScale.ticks(span / 3600000).reverse(); // backwards order, so the indexes match as we add data
    if (ticks.length > 1) {
        ticks.shift(); // skip the first tick.
        var enter = element
            .selectAll('g.tick')
                .data(ticks)
            .enter()
            .insert('g')
                .attr('class', 'tick');
        var days = this.days;
        var months = this.months;
        var vAxis = this.vAxisElement;
        var padding = this.padding;
        enter.each(function(d) {
            var e = d3.select(this);
            // on each new day, we get a three-liner
            if (!d.getHours() && !d.getMinutes()) {
                // Lie and display previous day at 11:59
                var lie = new Date(d.getTime());
                lie.setDate(lie.getDate() - 1);
                var aHeight = e.append('text')
                    .text(days[lie.getDay()])
                    .attr('class', 'tick-day')
                    .node().getBBox().height;
                var bHeight = e.append('text')
                    .text(
                        months[lie.getMonth()] + ' '
                        + lie.getDate().toString() + ', ' + lie.getFullYear().toString()
                    )
                    .attr('y', aHeight + padding)
                    .attr('class', 'tick-date')
                    .node().getBBox().height;
                e.append('text')
                    .text('11:59 PM')
                    .attr('y', aHeight + bHeight + 2 * padding);
            } else {
                var hours = d.getHours() % 12;
                e.append('text')
                    .text(
                        (hours ? hours : 12).toString() + ':'
                        + (d.getMinutes() < 10 ? '0' : '').toString() + d.getMinutes().toString()
                        + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM')
                    )
                    .attr('class', 'tick-time');
            }
            // valign and offset the text
            e.attr('transform', function(d) {
                var y = (-1 * e.node().getBBox().height / 2) + xScale(d);
                return 'translate(0, '+ y.toString() +')'
            });
            // hcenter text
            e.selectAll('text').attr('x', vAxis.attr('width') / 2);
        });
    }
};

Axes.prototype.byteFormat = function(data) {
    var measures = ['B', 'kB', 'MB', 'GB', 'TB'];
    for (var i = 0; i < measures.length; i++) {
        if (data > 1000) {
            data /= 1000;
        } else {
            break;
        }
    }
    return data.toString() + measures[i] + 'ps';
};

Axes.prototype.months = [
    'Jan.',
    'Feb.',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug.',
    'Sept.',
    'Oct.',
    'Nov.',
    'Dec.'
];

Axes.prototype.days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];