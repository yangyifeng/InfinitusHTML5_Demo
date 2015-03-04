define(["zepto", // zepto.js 简写路径，定义详见 vendor/cube/js/launcher.js
"cube/router", // router.js 路径
"com.infinitus.demo/template"], // template.js 路径
    function($, CubeRouter, Template) { // 这些参数依次对应上一行加载的文件
        var context;
        var Router = CubeRouter.extend({
            module: "com.infinitus.demo",
            navigationStack: [],
            // 这里设置路由
            routes: {
                "": "showTemplate", // 表示地址 hash 为空时，执行 showTemplate 方法
                "template": "showTemplate" // 表示地址 hash 为”template”时，执行 showTemplate 方法
            },
            showTemplate: function() { // showTemplate 方法
                this.changePage(new Template()); // 表示创建一个 Template 视图，覆盖当前视图
            }
        });
        return Router;
    });