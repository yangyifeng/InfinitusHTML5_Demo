define(['zepto', 'backbone', 'iscroll.lite'], function($, Backbone, iScroll) {

	var Popover = Backbone.View.extend({

		events: {
			'click li': 'onClick'
		},

		initialize: function(args) {
			console.log('popover init');
			// var name = $(this.el).attr('name');
			if (arguments && arguments.length > 0) {
				var config = arguments[0];
				var key;
				for (key in config) {
					if (key in this) this[key] = config[key];
				}
				var obj = {};
				for (var configKey in this.config) {
					obj[configKey] = this.config[configKey];
				}
				for (var argkey in config) {
					obj[argkey] = config[argkey];
				}
				this.config = obj;
			}
			this.isMaskShow = false;
			this.mask = $('<div class="popver-masker" style="display: none;width: 100%;min-height:1000px; z-index:100; position: absolute;"></div>');

			this.render();

        },

		render: function() {
			var me = this;
			var btn = $(this.config.parent).find('a[href="#' + this.el.id + '"]')[0];
			$(btn).bind('click', function() {
				me.onShow();
			});
			console.info('======');
			return this;
		},

		onShow: function(e) {
			var me = this;
			var popover = this.el;
			var popDisplay = $(popover).css('display');
			if(!this.isMaskShow){
				$('body').append(this.mask);
				this.isMaskShow = true;
			}
			
			$(popover).removeClass('visible');
			if (popDisplay == "none") {
				popover.style.display = 'block';
				//选项卡出现的时候，遮罩层也相应出现
				this.mask.css('display', 'block');
			} else {
				popover.style.display = 'none';
				this.mask.css('display', 'none');
			}
			popover.offsetHeight;
			popover.classList.add('visible');

			var popover_iScroll = new iScroll('popver-scroller', {
				useTransition: true
			});
			this.iScroll = popover_iScroll;

			this.iScroll.refresh();

			this.mask.bind('click', function() {
				me.onMaskClick();
			});

		},
		onClick: function(e) {
			console.log('popover:select');
			this.onHide();
		},
		onHide: function() {
			$(this.el).css('display', 'none');
			this.mask.css('display', 'none');
		},
		onMaskClick: function() {
			console.info("mask click");
			$(this.el).css('display', 'none');
			this.mask.css('display', 'none');
		}

	}, {
		compile: function(el) {
			console.log('popover compile');
			var me = this;
			return _.map($(el).find(".popover"), function(tag) {
				return new Popover({
					el: tag,
					parent: el
				});
			});
		}
	});

	return Popover;
});