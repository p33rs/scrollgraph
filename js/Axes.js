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

    this.xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('right')
        .outerTickSize(0)
        .tickPadding(0)
        .tickFormat(this.dateFormat.bind(this));

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
    //this.xAxis(this.vAxisElement);
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
    var ticks = xScale.ticks(span / 1800000).reverse(); // backwards order, so the indexes match as we add data
    if (ticks.length > 1) {
        ticks.pop(); // skip the first tick.
        var enter = element
            .selectAll('g.tick')
                .data(ticks)
            .enter()
            .insert('g')
                .attr('class', 'tick')
                .attr('transform', function(d) { return 'translate(0,' + xScale(d) + ')' });
        var days = this.days;
        var months = this.months;
        enter.each(function(d) {
            var e = d3.select(this);
            e.selectAll('*').remove();
            if (!d.getHours() && !d.getMinutes()) {
                // Lie and display previous day at 11:59
                d.setDate(d.getDate() - 1);
                e.append('text').text(days[d.getDay()]);
                e.append('text').text(
                    months[d.getMonth()] + ' '
                    + d.getDate().toString() + ', ' + d.getFullYear().toString()
                );
                e.append('text').text('11:59 PM');
            } else {
                var hours = d.getHours() % 12;
                e.append('text').text(
                    (hours ? hours : 12).toString() + ':'
                    + (d.getMinutes() < 10 ? '0' : '').toString() + d.getMinutes().toString()
                    + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM')
                );
            }
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

Axes.prototype.dateFormat = function(data) {
    if (!data.getHours() && !data.getMinutes()) {
        return (
            '<span>' + this.days[data.getDay()] + '</span>'
            + '<span>'
            + this.months[data.getMonth()] + ' '
            + data.getDate() + ', ' + data.getYear()
            + '</span>'
            + '<span>11:59 PM</span>'
        );
    } else {
        return (
            (data.getHours() % 12).toString() + ':'
            + (data.getMinutes() < 10 ? '0' : '').toString() + data.getMinutes().toString()
            + ' ' + (data.getHours() >= 12 ? 'PM' : 'AM')
        );
    }
};

Axes.prototype.months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
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