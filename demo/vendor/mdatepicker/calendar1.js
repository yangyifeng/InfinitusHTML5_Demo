requirejs.config({
	baseUrl: '.',
	paths: {
		jquery: '../../js/jquery',
		calendar: '../cube/js/calendar',
		jqModal:'../cube/js/jqModal',
		cal_main:'../cube/js/cal_main'
	}
});
require(["jquery", "calendar"], function($) {
});

