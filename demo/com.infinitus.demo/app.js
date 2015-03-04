//负责配置模块读取哪个router、该模块的跳转方式、快模块跳转等
//定义依赖组件，并为之命名
define(['zepto', 'backbone', 'com.infinitus.demo/router'],
	    function ($, Backbone, Router) {
	        var init = function () {
	            //跨router的页面跳转
	            new Router();

	            var rootPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'));
	            Backbone.history.start({ pushState: false, root: rootPath });
	            // alert(document.location.pathname);
	            if (document.location.hash && document.location.hash != "") {
	                var hash = document.location.hash.split("#")[1];
	                Backbone.history.navigate(hash, { trigger: true });
	            } else {
	                Backbone.history.navigate('com.infinitus.demo/', { trigger: true });
	            }
	        };

	        return {
	            initialize: init
	        };
	    });