/**
 * Gets a generic <g> and draws a time-based Y-Axis.
 * Provide setRange and setDomain methods; Re-render when they're called.
 * Is unaware of positioning and should be able to work independently of other Scrollgraph objects.
 * setRange and setDomain should be triggered whenever the attendant graph[s] are updated.
 * @param element
 * @constructor
 */
function Timescale(element, scale) {
    this.element = element;
    this.scale = d3.time.scale();
    this.axis = d3.svg.axis()
        .scale(this.scale)
        .orient(left);
}

Timescale.prototype.height = function(height, transition) {
    if (height && transition) {
        this.element.transition().attr('height', height);
        return this;
    } else if (height) {
        this.element.attr('height', height);
        return this;
    }
    return this.element.node().getBBox().height;
};
Timescale.prototype.width = function() {
    return this.element.node().getBBox().width;
};
Timescale.prototype.setRange = function(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError ('expected numeric min, max');
    }
    if (min < 0 || max < 0 || max < min) {
        throw new RangeError ('invalid min, max');
    }
    this.scale.range([min, max]);
    return this;
};
Timescale.prototype.setDomain = function(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError ('expected numeric min, max');
    }
    if (min < 0 || max < 0 || max < min) {
        throw new RangeError ('invalid min, max');
    }
    this.scale.domain([min, max]);
    return this;
};