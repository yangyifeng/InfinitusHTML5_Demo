requirejs.config({
	baseUrl: '.',
	paths: {
		jquery: '../../js/jquery',
	    mdatepicker:'../../js/mdatepicker',
		 date: '../cube/js/date',
		dialog: '../cube/js/dialog',
		jqModal:'../cube/js/jqModal'
	
	}
});
require(["jquery", "date","dialog"], function($) {
});

