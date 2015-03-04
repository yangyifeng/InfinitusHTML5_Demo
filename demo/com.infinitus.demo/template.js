//定义依赖组件，并为之命名
define(["zepto", // zepto.js 简写路径，定义详见 vendor/cube/js/launcher.js
        "cube/view", // view.js 简写路径，定义详见 vendor/cube/js/launcher.js
        "cube/store", // store.js 简写路径，定义详见 vendor/cube/js/launcher.js
        "text!com.infinitus.demo/template.html", // 手机端HTML模板
        "text!com.infinitus.demo/template_pad.html" // 平板端HTML模板
    ], // 平板端HTML模板
    function($, CubeView, Store, MainTemplate, Pad) {
        //定义全局变量
        var View = CubeView.extend({
            //页面初始化时候的脚本
            initialize: function() {
                page = this;
            },
            //渲染页面
            render: function(result) {
                return pageObject.render.call(this, MainTemplate, Pad, CubeView);
            },
            //页面初始化完成后执行，业务逻辑写在此。
            onShow: function() {
                // 虚拟数据，一般应通过请求获得（具体请求可见说明文档 AjaxAPI）
                var data = {
                    message: '演示文字',
                    imgUrl: 'images/demo.png'
                }
                // 模板解析函数（必须写在 onShow 方法内，可多次使用）
                // bindTemplate(container, obj, append, images);
                // @param_01 Sting （DOM元素id）
                // @param_02 Object （数据）
                // @param_03 Boolean （true 为插入到 container， false 为整个替换）
                // @param_04 Array （图片字段属性名数组，每一项为字符串，该字符串应是 data 中值为“能够获取图片地址的图片唯一 code”对应的名称，请求回来的值将用于获取真正的图片地址）
                bindTemplate('demoContent', data, false, []);
            },
            // 注册您的页面事件
            events: {
                // '事件类型 选择器' : '方法名'
                'tap #demoImg' : 'tapImg'
            },
            tapImg: function() {
                alert('tapImg');
            }
        });
        return View;
    });