//init require js
require.config({
	baseUrl: '.',
		paths: {
			text: 'vendor/lib/text',
			domReady: 'vendor/lib/domReady',
			i18n: 'vendor/lib/i18n',
			zepto: '__proto__' in {} ? 'vendor/lib/zepto.min' : 'vendor/lib/jquery-1.9.1.min',
			'iscroll': 'vendor/lib/iscroll',
			'iscroll.lite': 'vendor/lib/iscroll-lite',
			swipeview: 'vendor/lib/swipeview',
			underscore: 'vendor/lib/underscore_amd',
			backbone: 'vendor/lib/backbone_amd',
			lib: 'vendor/lib',
			cube: 'vendor/cube/js',
			modules : '../',
			pageslide : 'vendor/lib/jquery.pageslide',
			bean : 'vendor/lib/bean',
			flotr2: 'vendor/lib/flotr2-amd',
			hammer:'vendor/lib/hammer'
		},
		shim: {
			backbone: {
				deps: ['underscore']
			},
			zepto: {
				exports: '$'
			},
			'iscroll': {
				exports: 'iScroll'
			},
			'iscroll.lite': {
				exports: 'iScroll'
			},
			swipeview: {
				exports: 'SwipeView'
			}
		}
});

//i18n
if (window.localStorage['lang'] === undefined) window.localStorage['lang'] = "zh-cn";
requirejs.config({
	config: {
		i18n: {
			locale: window.localStorage['lang']
		}
	}
});

(function(){

	var launcher = document.querySelector("meta[name='launcher']");
	var module= launcher.getAttribute('module');
	var hideAddressBar = launcher.getAttribute('hideAddressBar') == 'true';
	var preventTouchMove = launcher.getAttribute('preventTouchMove') == 'true';
	var enablePhoneGap = launcher.getAttribute('enablePhoneGap') == 'true';

	//load phonegap js
	if(enablePhoneGap){
		var phonegapjs = document.createElement('script');
		phonegapjs.setAttribute('type', 'text/javascript');
		phonegapjs.setAttribute('src', '../cordova.js');
		document.head.appendChild(phonegapjs);
	}

	require(['domReady', 'cube/i18n', 'lib/fastclick', 'app'], function(domReady, i18n, FastClick, app){
		domReady(function(){

			//remove loading screen
			$('#appLoadingIndicator').remove();

			//ensure view can scroll to top for ios devices
			$('html').css('min-height', window.screen.availHeight - 44+"px");

			//remove 300ms delay
			new FastClick(document.body);
			//hide address bar
			if(hideAddressBar) setTimeout(function(){window.scrollTo(0, 1);}, 0);
			if(preventTouchMove) document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

			function onDeviceReady(desktop) {

				// Hiding splash screen when app is loaded
				if (desktop !== true) {
				}

				app.initialize();
			}

			if (enablePhoneGap && navigator.userAgent.match(/(iPad|iPhone|Android)/)) {
				// This is running on a device so waiting for deviceready event
				document.addEventListener('deviceready', onDeviceReady, false);
				
			} else {
				// On desktop don't have to wait for anything
				onDeviceReady(true);
			}
		});//domReady
	});

})();