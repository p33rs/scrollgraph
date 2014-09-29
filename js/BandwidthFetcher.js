function BandwidthFetcher() {
    this.url = '/api.php';
    Observable(this);
}

/**
 * @param start
 * @param end
 * @param step
 */
BandwidthFetcher.prototype.fetch = function(start, end, step) {
    $.ajax({
        data: {
            start: start,
            end: end,
            step: step
        },
        dataType: 'json',
        type: 'GET',
        url: this.url,
        error: function() {
            this.trigger('load', null);
        }.bind(this),
        success: function(data) {
            if (!data || !data.status) {
                this.trigger('load', null);
                return;
            }
            this.trigger('load', data.data.datapoints);
        }.bind(this)
    });
};