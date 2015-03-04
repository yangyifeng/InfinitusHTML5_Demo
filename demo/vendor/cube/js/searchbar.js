define(['zepto', 'backbone', 'cube/list'], function($, Backbone, List) {

	var list;
	var SearchBar = Backbone.View.extend({

		config:{
			listBinding:true,
			listId:"",
			baseOn:"element",   //搜索基础,是把keywords放在dom模型还是放在data里
			typingTrigger:false,  //输入搜索模式,每次按下直接激活
		},

		events: {},

		initialize: function() {
			//获取传入参数
            if (arguments && arguments.length > 0) {
                var config = arguments[0];
                //这样取得的config将会被几个list共享
                // this.config = _.extend(this.config, object);

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

			this.render();
		},

		render: function() {
			var me = this;
			$(me.el).bind('touchend input', function(e) {
				window.scrollTo(0, 0);
				var inputVal = $(me.el).val();
				list.filterChildren(inputVal);
			});
			
			
			return this;
		},
		_boolean:function(bool){
            if(bool == true||bool.toLowerCase() == "true"){
                return true;
            }else{
                return false;
            }
        },
		_bindEvent:function(){
			var me = this;
			this.bind('touchend input',function(e){
				var searchStr = $(this).val();
				if(me._boolean(me.config.typingTrigger)){
					me.onTyping(searchStr);
				}else{
		            if (e.keyCode == 13||e.keyCode ==32) {
		            	me.onFinishTyping(searchStr);
		            }
				}
			});
		},
		onFinishTyping:function(searchStr){
			this.triger("onFinishTyping",this,searchStr,data);
		},
		onTyping:function(searchStr){
			this.triger("onTyping",this,searchStr,data);
		},

	}, {
		compile: function(view) {
			console.log('searchbar compile');
			var el = view.el;
			var me = this;
			return _.map($(el).find(".searchbar"), function(tag) {
				var listname = $(tag).attr('data-listname');
				if (listname && !view.components[listname]) {
					var lists = List.compile(el);
					for (var i = 0; i < lists.length; i++) {
						if (lists[i].id == listname) {
							list = lists[i];
						}
					}
				}
				view.components[listname] = list;
				return new SearchBar({
					el: tag
				});

			});
		}
	});

	return SearchBar;
});