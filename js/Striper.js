function Striper(a, b, pattern, graph) {
    if (!pattern || !(pattern instanceof d3.selection)) {
        throw new TypeError('expected pattern');
    }
    if (!a || !this.validArray(a)) {
        throw new TypeError('expected array');
    }
    if (!b || !this.validArray(b)) {
        throw new TypeError('expected array');
    }
    if (!graph || !(graph instanceof Graph)) {
        throw new TypeError('expected  graph');
    }
    this.element = pattern.attr('height', 1);
    this.a = a;
    this.b = b;
    this.graph = graph;
};

Striper.prototype.stripe = function(stripes) {
    var scale = d3.scale.linear()
        .domain([1,stripes]);
    var red, blue, green;
    this.element.attr('width', 1).attr('height', 1).selectAll('*').remove();
    for (var i = 1; i <= stripes; i++) {
        scale.range([this.a[0], this.b[0]]);
        red = Math.floor(scale(i)).toString();
        scale.range([this.a[1], this.b[1]]);
        green = Math.floor(scale(i)).toString();
        scale.range([this.a[2], this.b[2]]);
        blue = Math.floor(scale(i)).toString();
        this.element.append('rect')
            .attr('y', (i - 1) / stripes)
            .attr('height', 1 / stripes)
            .attr('width', 1)
            .attr('fill', 'rgb('+red+','+green+','+blue+')');
    }
    // get the max size from the graph's range
    var ticks = this.graph.yScale.ticks(5);
    var diff = ticks[1] - ticks[0];
    var max = this.graph.yScale(diff * (ticks.length + 1));
    //var max = this.graph.yScale.range()[1];
    // get the current size by scaling the graph's largest datapoint
    var current = this.graph.yScale(this.graph.data.max);
    var scale = (max / current).toString();
    this.element.attr('patternTransform', 'scale(1, ' + scale + ')');
};

Striper.prototype.validArray = function(v) {
    return (
        v &&
        v instanceof Array &&
        v.length === 3 &&
        typeof v[0] === 'number' &&
        typeof v[1] === 'number' &&
        typeof v[2] === 'number' &&
        v[0] >= 0 && v[0] <= 255 &&
        v[1] >= 0 && v[1] <= 255 &&
        v[2] >= 0 && v[2] <= 255
    );
}

Striper.prototype.getId = function() {
    x = this.element;
    return this.element.attr('id') || '';
}