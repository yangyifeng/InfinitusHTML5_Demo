define(['zepto','backbone','vendor/lib/hammer'], function($,Backbone,na){

    var Gesture  = Backbone.Model.extend({

    },{
        options: {
            observers: [],
            maxScale: 1,
            minScale: 1,
            onZoom:null,
            onTransformStart:null,
            onTransformEnd:null
        },

        bindPinch:function(el,target,options){
            var me = this;
            var key;
            for(key in options){
                if (key in this) this[key] = options[key];
            }
            var obj = {};
            for(var configKey in this.options){
                obj[configKey] = this.options[configKey];
            }
            for(var argkey in options){
                obj[argkey] = options[argkey];
            }
            options = obj;

            //基础大小
            var baseWidth = target.width?target.width:$(target).width();
            var baseHeight = target.height?target.height:$(target).height();
            //最大值
            var maxWidth = target.width?target.width * options.maxScale:$(target).width() * options.maxScale;
            var maxHeight = target.height?target.height * options.maxScale:$(target).height() * options.maxScale;
            //最小值
            var minWidth = target.width?target.width * options.minScale:$(target).width() * options.minScale;
            var minHeight = target.height?target.height * options.minScale:$(target).height() * options.minScale;

            
            var preScale = 0; 
            var isMoving = false;
            var scale;
            var tempScale = 0;
            var hammertime = Hammer(el).on("pinch", function(event) { 
                if(!isMoving){
                    tempScale = null;
                }
                scale = event.gesture.scale;
                isMoving = true;
                if(tempScale != scale && tempScale != null){

                    // if(event.gesture.scale > 1){
                    //     scale = 1 + (event.gesture.scale - 1) * 0.3;
                    // }else{
                    //     scale = (event.gesture.scale - 1) * 0.3+ 1;
                    // }

                    if(target.tagName == "CANVAS"){
                        //canvas
                        target.width = target.width + 300 * (scale - tempScale);
                        target.height = target.height + 300 * (scale - tempScale);

                        if(target.height < minHeight){
                          target.width =minWidth;
                          target.height =minHeight;
                        }else if(target.height > maxHeight){
                          target.width = maxWidth;
                          target.height = maxHeight;
                        }
                    }else{
                        //普通元素
                        var width = $(target).width() + 300 * (scale - tempScale);
                        var height = $(target).height() + 300 * (scale - tempScale);

                        $(target).width(width+"px");
                        $(target).height(height+"px");

                        if(height < minHeight){
                            $(target).width(minWidth+"px");
                            $(target).height(minHeight+"px");
                        }else if(height > maxHeight){
                            $(target).width(maxWidth+"px");
                            $(target).height(maxHeight+"px");
                        }
                    }

                    if(options.onZoom){//回调缩放函数
                        options.onZoom(event,target.width?target.width:$(target).width(),target.height?target.height:$(target).height());
                    }
                    
                }
                tempScale = scale;
            });

            var timerId= setInterval(function(ev){
                if(scale != preScale){
                    preScale = scale;
                }else{
                    if(isMoving){
                        options.onTransformEnd();
                        // console.log("temp->"+tempScale+",now->"+scale);
                        isMoving = false;   
                    }
                }
            },150);

            if(options.onTransformStart){
                hammertime.on("transformstart",function(){
                    options.onTransformStart();
                })
            }

            return hammertime;
        },
    });
    
    return Gesture;
});
    

