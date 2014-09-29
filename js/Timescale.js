/**
 * Created by Jon on 9/28/2014.
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