define(['backbone', 'swipeview', 'underscore'], function(Backbone, SwipeView, _){

    var Carousel = Backbone.View.extend({

        elContext: document,
        carousel: null,
        contents: [],
        target: null,
        pagertarget: null,

        initialize: function() {
            if (arguments && arguments.length > 0) {
                var params = arguments[0];
                this.id = params.id;
                this.contents = params.contents;
                this.target = params.target;
                this.pagertarget = params.pagertarget;
            }
        },

        render: function(){
            var me = this;
            carousel = new SwipeView(this.target, {
                numberOfPages: this.contents.length,
                hastyPageFlip: true
            });

            var page;
            this.contents.each(function(i, element){
                page = i===0 ? me.contents.length-1 : i-1;
                var detached = $(element).remove();
                carousel.masterPages[i].appendChild(detached[0]);
            });



            return this;
        }
    }, {
        compile: function(el){
            //namespace
            return _.map($(el).find('carousel'), function(tag){
                var targetEl = el.querySelector('#' + tag.getAttribute('target'));
                //取属性
                var id = tag.getAttribute('id');
                var spans = $(tag).find('span');
                //创建组件
                var c = new Carousel({id: id, contents: spans, target: targetEl, pagertarget: tag.getAttribute('pagertarget')});
                //渲染出组件，并替换掉标签
                $(tag).replaceWith(c.render().$el);

                var hbox = $("<div class='hbox' style='height:6px; width:100%;'></div>");
                
                for (var i = 0; i < spans.length; i++) {
                    if (i == 0) {
                        var flex = $("<div class='flex1' id='slider"+i+"' style='background-color:#37c1f4; opacity:1.0;'></div>");
                    } else {
                        var flex = $("<div class='flex1' id='slider"+i+"' style='background-color:#ffffff; opacity:0.3;'></div>");
                    }
                    hbox.append(flex);
                };
                var pagertarget = $(el).find("#"+tag.getAttribute('pagertarget'));
                pagertarget.append(hbox);


                carousel.onFlip(function(){
                    
                    var activeSlider = $(".swipeview-active").attr("id");
                    var idNum = activeSlider.substring(activeSlider.length-1);
                    idNum = (idNum+spans.length-1)%(spans.length);
                    console.log(idNum);

                    for (var i = 0; i < spans.length; i++) {
                        var activateFlex = $("#slider"+i);
                        if (i == idNum) {
                            activateFlex.css("background-color","#37c1f4");
                            activateFlex.css("opacity","1.0");
                        } else {
                            activateFlex.css("background-color","#ffffff");
                            activateFlex.css("opacity","0.3");
                        }
                    };

                    
                    
                });
                return c;
            });
        }
    });

    return Carousel;
});