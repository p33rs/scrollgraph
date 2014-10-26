function Striper(a, b, pattern) {
    if (!pattern || !(pattern instanceof d3.selection)) {
        throw new TypeError('expected pattern');
    }
    if (!a || !this.validArray(a)) {
        throw new TypeError('expected array');
    }
    if (!b || !this.validArray(b)) {
        throw new TypeError('expected array');
    }
    this.element = pattern.attr('height', 1);
    this.a = a;
    this.b = b;
};

Striper.prototype.stripe = function(stripes) {
    var scale = d3.scale.linear()
        .domain([1,stripes]);
    var red, blue, green;
    this.element.attr('width', 1).attr('height', 1).selectAll('*').remove();
    for (var i = 1; i <= stripes; i++) {
        scale.range([this.a[0], this.b[0]]);
        red = Math.floor(scale(i)).toString();
        console.log(red);
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