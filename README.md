#基本说明  
##GitHub文档说明  
请下载整个项目，项目demo文件在相应文件夹目录下。  
以下两个文件可能需要单独下载（点击对应文件→点击“Raw”）： 
```javascript
InfinitusHTML5开发说明.doc // 与本文档一致，若有不同则以本文档为准。
InfinitusHTML5开发规范.doc
``` 
##术语定义  
模块：根据一套需求业务逻辑定制的由各种逻辑文件和一到多个模板形成的结合，实际表现是一个文件夹。  
模板：一个页面及其逻辑，实际表现是一个js文件和两个html文件（手机端、平板端）。  
路由：一个可以根据浏览器地址实现跳转的功能。  
##DEMO 目录结构  
```javascript  
-[com.infinitus.demo] // demo 模块文件夹  
    +[images] // 图片文件夹，用于存放只属于该模块的图片  
    CubeModule.json // 手机端版本阐释文件  
    CubeModule_pad.json // 平板端版本阐释文件  
    app.js // 用于指定路由文件和配置路由规则  
    router.js // 用于配置具体路由跳转路径  
    index.html // 默认首页  
    template.js // 模板逻辑文件（处理该模板的前端业务逻辑）  
    template.html // 手机端模板  
    template_pad.html // 平板端模板  
    pag.css // 模块手机端公共样式文件  
    pag_pad.css // 模块平板端公共样式文件  
+[vendor] // 资源文件夹，不需要动  
cordova.js // js插件，不需要动  
infinitus.js // 封装了一些原生的公共方法，不需要动（包括弹框提示、显示对话框等等）  
```  
#开发说明  
##路由设置说明  
节选自 `com.infinitus.demo/router.js`：  
```javascript  
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
```  
##AJAX API  
整合的Ajax方法会自动根据运行环境（iOS, Andriod, Browser）使用适当方法请求数据，格式如下：  
```javascript  
callAjaxNew({  
    url: String, // 字符串，请求地址  
    hide: Number, // 数字，假如传入 3 ，不弹出没有数据  
    data: Object, // 对象，请求参数  
    success: function(data, status, xhr) {}, // 请求成功时的回调  
    failed: function(data, status, xhr) {} // 请求失败时的回调  
});  
```  
##模板解析说明  
节选自 `com.infinitus.demo/template.js`  
```javascript  
// 模板解析函数（必须写在 onShow 方法内，可多次使用）  
// 调用格式： bindTemplate(container, obj, append, images);  
// @param_01 Sting （DOM元素id）  
// @param_02 Object （数据）  
// @param_03 Boolean （true 为插入到 container， false 为整个替换）  
// @param_04 Array （图片字段属性名数组，每一项为字符串，该字符串应是 data 中值为“能够获取图片地址的图片唯一 code”对应的名称，请求回来的值将用于获取真正的图片地址）  
bindTemplate('demoContent', data, false, []);  
```  
节选自 `com.infinitus.demo/template.html`， `com.infinitus.demo/template_pad.html`  
```html  
<!-- 模板实际位置，根据 data-template 属性找到对应 id 的模板-->  
<div id="demoContent" data-template="demoTemplate" class="demoContent">  
</div>  
<!-- 载入的模板数据 -->  
<script id="demoTemplate" type="text/html">  
    <div>  
        <img id="demoImg" alt="pic" src="<%=imgUrl%>" />  
        <p><%=message%></p>  
    </div>  
</script>  
```  
##事件绑定  
事件绑定应写在模板js文件里面， 如下：  
```javascript  
events: {  
    // '事件类型 选择器' : '触发的方法'  
    'tap #demoImg': 'tapImg'  
},  
tapImg: function() {  
    alert('tapImg');  
}  
```
##Infinitus.js
在生产环境下，根目录下的 infinitus.js 为原生方法（已备份为 infinitus_mobile.js ，可打开查阅），电脑端因为需要浏览器调试，故使用浏览器相似方法模拟。这个文件一般不需要提交，也不需要更改。  
以下是该文件封装的一些常用方法（更多方法请查阅源文件）：  
```javascript

/**
 * 返回到上一个HTML页面或返回到上一个视图
 * @param bIsGoView boolean 为真时不调用浏览器返回直接返回到上一个视图 参数可选
 * @param sFun String 返回后调用上个页面的JS 参数可选
 * @param oParam Object 调用函数传的参数 参数可选
 */
transfer.returnBack(bIsGoView,sFun,oParam);

/**
 * 返回到首页
 */
transfer.goHome();

/**
 * 获取无限极接口统一公共参数
 * @return Array 接口公共参数
 */
tools.getCommonParam();

/**
 * 设置页面标题
 * @param sTitle String 标题
 */
tools.setTitle();

/**
 * 显示对话框
 * @param sTitle String 标题
 * @param sMsg String 提示内容
 * @param aBtnTitles Array 按钮数组如: ['确定','取消']
 * @param sCallback String 回调函数名 参数可选 
 *      结构function callback(iIndex){} iIndex从0开始
 */
tools.showDialog(sTitle,sMsg,aBtnTitles,sCallback);

/**
 * 显示提示
 * @param sMsg String 提示内容
 * @param iDuration int 显示时长，默认为2秒 参数可选
 */
tools.showToast(sMsg,iDuration);

/**
 * 获取客户端请求host：
 * @return json对象：gbss，uim，emcs，root（属性的使用请参考接口文档说明，自带https://前缀）
 */
tools.getHost();

/**
 * 安全退出
 */
tools.logout();

/**
 * ecb加密
 * @param sOldText String 要加密的内容
 * @return String 加密后内容
 */
tools.ecbEncrypt(sOldText);


/**
 * 读取用户设置信息
 * @param sKey String 查询的key名称
 * @return Object 保存的内容
 */
userDefault.readValue(sKey);

/**
 * 保存信息到用户设置
 * @param sKey String key名称
 * @param oValue Object 要保存的内容
 * @return boolean 结果
 */
userDefault.saveValue(sKey, oValue);

/**
 * 清除缓存
 * @param sCallback String 回调函数名 参数可选
 *      result boolean 结果
 *      结构function callback(result){}
 */
cache.clean(sCallback);

/**
 * 下载图片并缓存到缓存器中
 * @param sImgUrl String 图片地址
 * @param sUserInfo String 需要保存的内容
 * @param sCallback(imgUrl,filePath,sUserInfo);
 */
cache.cacheImageWithUrl(sCallback, sImgUrl, sUserInfo);

```
###分开设立平板和手机模板逻辑文件  
因 demo 中的平板和手机模板逻辑文件为同一个（`template.js`），如果需要在两个平台实现不同的逻辑，可以分成两个逻辑文件。在该模块目录下，创建一个 `template_pad.js` （请根据模板具体名称重命名），并修改该目录下的 `router.js` ：
```javascript
define(["zepto", 
    "cube/router", 
    "com.infinitus.demo/template", 
    "com.infinitus.demo/template_pad"], // template_pad.js
    function($, CubeRouter, Template, Template_pad) {
        var context;
        var Router = CubeRouter.extend({
            module: "com.infinitus.demo",
            navigationStack: [],
            routes: {
                "": "showTemplate",
                "template": "showTemplate"
            },
            showTemplate: function() {
                // deviceType 的值为 'pad' （brand 为 'ipad' 时） 或 'phone' （brand 不为 'ipad' 时）
                // 可在 infinitus.js 里设置 brand 参数
                if(deviceType == 'pad') { // 平板端
                    this.changePage(new Template_pad());
                } else { // 手机端
                    this.changePage(new Template());
                }
            }
        });
        return Router;
    });
```
##调试  
###基本说明  
使用浏览器打开模板目录下的 `index.html` 即可在浏览器对该模板进行调试。  
###跨域  
电脑端调试请求需要设置浏览器跨域。  
windows 环境下 Chrome 的设置如下：  
```javascript  
// 在chrome快捷方式，“目标”里设置：  
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security  
```  
Mac 环境下 Chrome 的设置如下：  
```javascript 
// 打开终端，输入：
open -a "Google Chrome" --args --disable-web-security
```
###更改平台  
电脑端调试的时候，可以通过更改根目录下 `infinitus.js` 的 brand 参数来选择手机端或平板端（如果设为 "iPad" 则为平板端，其他任何字符如 "iPads" 则为手机端）：  
```javascript  
param.push({  
    "brand": "iPad",  
    "os": "0",  
    "machineModel": "x86_64",  
    "coreVersion": "8.0",  
    "netType": "WiFi",  
    "appVersion": "2.0.0",  
    "osVersion": "8.0",  
    "screen": "1136x640",  
    "imei": "",  
    "model": "0"  
});  
```  
#开始新建模块  
##模块说明  
现在以加入 `[com.infinitus.shopping]` 模块（简化）为例，说明操作步骤。  
以下是拟加入的 `[com.infinitus.shopping]` 模块（简化）目录结构:  
```javascript  
-[com.infinitus.shopping] // shopping 模块文件夹  
    +[images]  
    CubeModule.json  
    CubeModule_pad.json  
    app.js  
    router.js  
    index.html  
    catalog.js // 购货目录模板逻辑文件  
    catalog.html // 手机端购货目录模板  
    catalog_pad.html // 平板端购货目录模板  
    pag.css  
    pag_pad.css  
```  
##具体步骤  
###拷贝 [COM.INFINITUS.DEMO] 模块  
将整个 `[com.infinitus.demo]` 模块文件夹拷贝一份到同一目录下，并改名为 `[com.infinitus.shopping]` 。  
###修改 INDEX.HTML  
•修改模块名称  
```html  
<meta name="launcher" module="com.infinitus.demo" hideaddressbar="true" preventtouchmove="true" enablephonegap="false" />  
```  
↓  
```html  
<meta name="launcher" module="com.infinitus.shopping" hideaddressbar="true" preventtouchmove="true" enablephonegap="false" />  
```  
###修改 APP.JS  
•修改模块名称  
```javascript  
define(['zepto', 'backbone', 'com.infinitus.demo/router'],  
    function ($, Backbone, Router) {  
        var init = function () {  
            new Router();  
            var rootPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'));  
            Backbone.history.start({ pushState: false, root: rootPath });  
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
    }  
);  
```  
↓  
```javascript  
define(['zepto', 'backbone', 'com.infinitus.shopping/router'],  
    function ($, Backbone, Router) {  
        var init = function () {  
            new Router();  
            var rootPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'));  
            Backbone.history.start({ pushState: false, root: rootPath });  
            if (document.location.hash && document.location.hash != "") {  
                var hash = document.location.hash.split("#")[1];  
                Backbone.history.navigate(hash, { trigger: true });  
            } else {  
                Backbone.history.navigate('com.infinitus.shopping/', { trigger: true });  
            }  
        };  
        return {  
            initialize: init  
        };  
    }  
);  
```  
###修改 ROUTER.JS  
•修改模块和模版名称  
```javascript  
define(["zepto", "cube/router", "com.infinitus.demo/template"],  
    function ($, CubeRouter, Template) {  
        var context;  
        var Router = CubeRouter.extend({  
            module: "com.infinitus.demo",  
            navigationStack: [],  
            routes: {  
                "": "showTemplate",  
                "template": "showTemplate"  
            },  
            showTemplate: function () {  
                this.changePage(new Template());  
            }  
        });  
        return Router;  
    });  
```  
↓继续修改路由方法  
```javascript  
define(["zepto", "cube/router", "com.infinitus.shopping/catalog"],  
    function ($, CubeRouter, Catalog) {  
        var context;  
        var Router = CubeRouter.extend({  
            module: "com.infinitus.shopping",  
            navigationStack: [],  
            routes: {  
                "": "showTemplate",  
                "template": "showTemplate"  
            },  
            showTemplate: function () {  
                this.changePage(new Template());  
            }  
        });  
        return Router;  
    });  
```  
↓  
```javascript  
define(["zepto", "cube/router", "com.infinitus.shopping/catalog"],  
    function ($, CubeRouter, Catalog) {  
        var context;  
        var Router = CubeRouter.extend({  
            module: "com.infinitus.shopping",  
            navigationStack: [],  
            routes: {  
                "": "showCatalog",  
                "catalog": "showCatalog"  
            },  
            showCatalog: function () {  
                this.changePage(new Catalog());  
            }  
        });  
        return Router;  
    });  
```  
###修改 CUBEMODULE.JSON 文件  
•修改模块和模版名称（另外，需要对 `CubeModule_pad.json` 文件做同样操作）  
```javascript  
{  
    "identifier": "com.infinitus.demo",  
    "name": "样本",  
    "build": 1,  
    "version": "1.0.0.1",  
    "releaseNote": "",  
    "dependencies": {  
        "com.infinitus.common": 6  
    }  
}  
```  
↓  
```javascript  
{  
    "identifier": "com.infinitus.shopping",  
    "name": "个人购货",  
    "build": 1,  
    "version": "1.0.0.1",  
    "releaseNote": "",  
    "dependencies": {  
        "com.infinitus.common": 6  
    }  
}  
```  
###创建 CATALOG 模板  
在模块目录下复制 `template.html`, `template_pad.html`, `template.js` 三个文件，并改名为 `catalog.html`, `catalog_pad.html`, `catalog.js`，然后就可以开始写业务逻辑，或者继续创建更多模板。  

（完）
