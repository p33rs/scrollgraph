function Fetcher(dataset) {
    if (!dataset || !(dataset instanceof Dataset)) {
        throw new Error('expected dataset');
    }
    this.dataset = dataset;
    this.url = '/api.php';
}

Fetcher.prototype.fetch = function(start, end, step) {
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

        },
        success: function() {

        },
        complete: function() {

        }
    });
};