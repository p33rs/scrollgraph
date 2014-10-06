/**
 * Represents the Scrollgraph's SVG.
 * Provides access to the <svg> and its elements.
 * Helps the SVG to stay stretched to the correct sizes.
 * @param element
 * @param options
 * @constructor
 */
function GraphElement(element, options) {
    if (!element || !(element instanceof d3.selection)) {
        throw new TypeError('expected element');
    }
    this.opts = this.defaultOptions;
    if (options) {
        this.options(options);
    }
    this.element = element;
    window.addEventListener('resize', this.positionContents.bind(this));

};




GraphElement.prototype.defaultOptions = {
    topMargin: 60, // space provided for the xaxis
    centerWidth: 100, // space provided for the yaxis
};

GraphElement.prototype.options = function(options, option) {
    if (typeof options === 'undefined') {
        return this.opts;
    }
    var newOptions = this.opts;
    if (typeof option === 'undefined' && typeof options === 'object') {
        $.extend(newOptions, options);
    } else if (typeof option !== 'undefined') {
        var v = {};
        v[options] = option;
        $.extend(newOptions, v);
    } else {
        throw TypeError('unexpected configuration');
    }
    if (this.validateOptions(newOptions)) {
        this.opts = newOptions;
    } else {
        throw Error('invalid parameter');
    }
    return this;
};
GraphElement.prototype.validateOptions = function(options) {
    return (
    options &&
    (typeof options.topMargin === 'number' && options.topMargin > 0 ) &&
    (typeof options.centerWidth === 'number' && options.centerWidth > 0 )
    );
}
GraphElement.prototype.positionContents = function(graph) {
    this.element.attr('height', graph.height());
    this.left.element.attr('transform', 'translate()')
};

GraphElement.prototype.leftHeight = function() {
    return this.element.node().getBBox().height;
};
GraphElement.prototype.leftHeight = function() {
    return this.element.node().getBBox().height;
};