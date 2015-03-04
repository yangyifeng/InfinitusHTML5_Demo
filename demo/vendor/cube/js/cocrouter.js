define(['require', 'underscore', 'backbone', 'cube/mainview'], function(require, _, Backbone, MainView) {
	//a CoC router
	var CoCRouter = Backbone.Router.extend({
		//排前面优先？
		routes: {
			//eg: index.html
			'': 'index',
			//eg: index.html#com.foss.demo/listView
			//eg: index.html#com.foss.demo/listView?t=push
			"*module/*page(?t=:type)": "modularRoute",
			//eg: index.html#listView
			"*page(?t=:type)": "pageRoute"
		},

		initialize: function(options) {
			if (options) this.delegate = options.delegate;
		},

		index: function() {
			this.modularRoute('', 'listView');
		},

		modularRoute: function(module, page, type) {
			var me = this;

			// var pageClass = require(this.module + '/' + (page === null ? '' : page));
			// this.delegate.changePage(new pageClass());

			console.log('modular route to:' + module + '->' + page);
			var require_path = module + '/' + (page === null ? '' : page);

			var url_path = require_path + (type == null || type == undefined ? '' : '?t=' + type);



			console.log('load start, require: ' + require_path);


			if ('pop' == type) {
				me.delegate.pop();
				this.delegate.url.pop(url_path);
				return;
				//判断当前stack是否存在该view
			} else if (_.indexOf(this.delegate.url, url_path) > -1) {
				me.delegate.pop();
				this.delegate.url.pop(url_path);
				return;
			}


			console.info('***********' + url_path);
			this.delegate.url.push(url_path);
			console.info(this.delegate.url);

			var viewLoaded = require.defined(require_path);
			if (viewLoaded) {
				//TODO: start loading
			}

			require([require_path], function(Page) {
				if (viewLoaded) {
					//TODO: stop loading
				}
				console.log('load finish');
				var p = new Page();
				p.module = module;
				//TODO  pop
				if ('push' == type) {
					me.delegate.push(p);
				} else {
					me.delegate.changePage(p);
				}

			}, function(err) {
				var failedId = err.requireModules && err.requireModules[0];
				console.log('load fail: ' + failedId);
			});
		},

		pageRoute: function(page, type) {
			console.log('page route to:' + page);
		}
	});

	return CoCRouter;
});