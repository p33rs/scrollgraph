/**
 * Gets a generic <g> and draws a time-based Y-Axis.
 * Provide setRange and setDomain methods; Re-render when they're called.
 * Is unaware of positioning and should be able to work independently of other Scrollgraph objects.
 * setRange and setDomain should be triggered whenever the attendant graph[s] are updated.
 * @param element
 * @constructor
 */
function Timescale(element) {
    this.element = element;
    // has a .element.
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