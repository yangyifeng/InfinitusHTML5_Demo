//把对象转换为数组
function toArray(obj) {
    if ($.isArray(obj)) {
        return obj;
    } else {
        return [obj];
    }
}

var hostRoot = tools.getHost().root;
var hostEmcs = tools.getHost().emcs;

//全局ajax调用方法
function callAjaxNew(options) {
    commonAjaxNew.ajaxSend(options);
    if (tools.debug) {
        options.type = "GET";
        $.ajax(options);
    } else {
        var callBackIndex = page.callBack.push(options.success) - 1; //原生回调函数都叫success, 所以需要把每次调用AJAX的时候把自己CALLBACK的位置传给原生
        if (options.type == "POST") {
            network.post(options.url, options.data, "page.callBack[" + callBackIndex + "]");
        } else {
            network.get(options.url, null, "page.callBack[" + callBackIndex + "]");
        }
    }
}

//全局ajax调用方法
function callAjax(options) {
    options.url = hostRoot + options.url;
    options.data = commonAjax.ajaxSend(options.data);
    var callback = options.success;
    options.success = function (data, status, xhr) {
        if (options.isQuery == false) {
            if (commonAjax.ajaxSuccess(data, options)) {
                callback(data, status, xhr);
            } else {
                if (options.failed != null) {
                    options.failed(data);
                }
            }
        } else {
            var result = commonAjax.ajaxReceive(data, options);
            if (result != null) {
                callback(result, status, xhr);
            } else {
                if (options.failed != null) {
                    options.failed(data);
                }
            }
        }
    };
    $.ajax(options);
}

var commonAjax = {
    //ajax请求默认设置
    ajaxSetup: function () {
        $.ajaxSettings.dataType = "json";
        $.ajaxSettings.timeout = "10000";
        $.ajaxSettings.beforeSend = function (xhr, settings) {
            if (settings.dataType = "jsonp") {
                settings.url = settings.url.replace("callback=", "jsonpCallback=");
            }
        };
        $(document).on("ajaxStart", function (global) {
            //发起请求前显示loader
            // window.loader = new Loader();
        });
        $(document).on("ajaxError", function (xhr, options, error) {
            //请求完成隐藏loader
            //if (window.loader != null) {
            //     window.loader.hideAll();
            // }
            //tools.showToast("无法连接到网络，请检查网络配置。");
        });
        $(document).on("ajaxStop", function (global) {
            //请求完成隐藏loader
            if (window.loader != null) {
                window.loader.hideAll();
                window.loader = null;
            }
        });
    },

    //生成ajax默认数据格式
    ajaxSend: function (data) {
        if (data == null) {
            data = new Object();
        }
        data.commonParam = commonParam;
        var jsonData = JSON.stringify(data);
        return {
            json: jsonData
        }
    },

    //格式化ajax返回数据
    ajaxReceive: function (data, options) {
        if (data.result == 0) {
            return options.original ? data : data.data;
        } else {
            this.ajaxShowError(data, options);
        }
    },

    //判断ajax返回结果是否成功
    ajaxSuccess: function (data, options) {
        if (data.result == 0) {
            tools.showToast(data.msg);
            return true;
        } else {
            this.ajaxShowError(data, options);
            return false;
        }
    },

    ajaxShowError: function (data, options) {
        if (options.hide == null || !$.inArray(toArray(options.hide), data.result)) {
            if (data.result == 1) {
                tools.showDialog("温馨提示", data.msg);
            }
            else {
                tools.showToast(data.msg);
            }
        }
    }
};

var commonAjaxNew = {
    _ajaxCount: 0,

    set ajaxCount(value) {
        if (value == 1) {
            tools.showLoading();
        }
        if (value == 0) {
            if (page != null) {
                page.lastMessage = "";
            }
            tools.dismissLoading();
        }
        this._ajaxCount = value;
    },

    get ajaxCount() {
        return this._ajaxCount;
    },

    //ajax请求默认设置
    ajaxSetup: function () {
        $.ajaxSettings.timeout = "10000";
        $.ajaxSettings.beforeSend = function (xhr, settings) {
            if (settings.dataType = "jsonp") {
                settings.url = settings.url.replace("callback=", "jsonpCallback=");
            }
        };
    },

    //生成ajax默认数据格式
    ajaxSend: function (options) {
        commonAjaxNew.ajaxCount = commonAjaxNew.ajaxCount + 1;
        if (options.emcs == true) {
            options.url = hostEmcs + options.url;
        } else {
            options.url = hostRoot + options.url;
        }
        if (options.headers == null) {
            options.headers = new Object();
        }
        options.headers["X-Requested-With"] = "XMLHttpRequest";
        if (options.data == null) {
            options.data = new Object();
        }
        if (options.type != "POST") {
            this.ajaxParam(options);
        }
        this.ajaxCallback(options);
    },

    //生成ajax默认数据格式
    ajaxParam: function (options) {
        var urlParam = new Array();
        this.createParam(options.data, urlParam, "");
        for (var i = 0; i < urlParam.length; i++) {
            urlParam[i] = urlParam[i].substring(1);
        }
        if (tools.debug) {
            for (x in commonParam[0]) {
                urlParam.push(x + "=" + commonParam[0][x]);
            }
        }
        options.data = null;
        options.url = options.url + "?" + urlParam.join("&");
    },
    /**
     *
     * @param data 传入的参数数据
     * @param urlParam 空数组
     * @param route
     * @param isArray
     */
    createParam: function (data, urlParam, route, isArray) {
        for (x in data) {
            switch (typeof (data[x])) { //data[x] 递归的字段数据
                case "function":
                    continue;
                case "object":
                    if (isArray) {
                        this.createParam(data[x], urlParam, route + "[" + x + "]", $.isArray(data[x])); //product[0].code=1 &...
                    } else {
                        this.createParam(data[x], urlParam, route + "." + x, $.isArray(data[x])); // array["name"] => name="a"& name="b"
                    }
                    break;
                default: //普通参数
                    if (isArray) {
                        urlParam.push(route + "=" + data[x]);
                    } else {
                        urlParam.push(route + "." + x + "=" + data[x]);
                    }
                    break;
            }
        }
    },

    //ajax回调
    ajaxCallback: function (options) {
        var callback = options.success;
        options.success = function (data, status, xhr) {
            commonAjaxNew.ajaxCount = commonAjaxNew.ajaxCount - 1;
            if (data != null && data.success) {//接口调用成功
                if (options.isQuery == false) {//操作
                    if (options.hide == null || $.inArray(0, toArray(options.hide)) == -1) { // 0 success, 1 fail, 3 empty
                        tools.showToast("成功");
                    }
                    callback(data, status, xhr);
                } else {//查询
                    var result;
                    if (data.firstPage == null) { //data.firstPage 相当于 判断是否分页
                        result = data.returnObject;
                    } else {
                        result = data.content;
                        result.firstPage = data.firstPage;
                        result.lastPage = data.lastPage;
                        result.totalElements = data.totalElements;
                    }
                    if (result == null || ($.isArray(result) && result.length == 0)) {//没有数据
                        if (options.hide == null || $.inArray(3, toArray(options.hide)) == -1) { //假如hide传入 3 ，不弹出没有数据
                            tools.showToast("没有数据");
                        }
                        commonAjaxNew.ajaxFailed(options, data);
                        if (data.firstPage != null) {
                            pageObject.nextPageFailed(); //假如是分页并且没有数据，把下拉加载隐藏
                        }
                    } else {//查询成功
                        callback(result, status, xhr);
                        if (data.firstPage != null) {
                            pageObject.nextPageSuccess(data);
                        }
                    }
                }
            } else {//接口调用失败
                if (options.hide == null || $.inArray(1, toArray(options.hide)) == -1) {
                    var message = data.exceptionMessage != null ? data.exceptionMessage : data;
                    if (page.lastMessage != message) {
                        page.lastMessage = message;
                        tools.showDialog("温馨提示", page.lastMessage);
                    }
                }
                commonAjaxNew.ajaxFailed(options, data);
                if (data.firstPage != null) {
                    pageObject.nextPageFailed();
                }
            }
        };
    },

    //ajax错误
    ajaxFailed: function (options, data) {
        if (options.failed != null) {
            options.failed(data);
        }
    }
};

//动态绑定容器

/**
 *
 * @param container 父元素
 * @param obj 数据
 * @param append
 * @param images 图片字段属性名数组
 * @returns {*}
 */
function bindTemplate(container, obj, append, images) {
    if (typeof (container) == "string") {
        container = $("#" + container);
    }
    if (append != true) {
        container.children().remove();
    }
    var templateStr = $("#" + container.data("template")).html();
    var data = toArray(obj);
    if (images != null) {
        template.formatImage(data, images); //把data里面的图片添加前缀，并且为data新增一个key字段
    }

    var parent = $("#" + container.data("template") + "Parent"); //for ipad flexbox的应用,获取到html_pad的flex父元素，为了多栏布局
    var templateParentStr;
    var parentColumn;
    var parentClass;
    var parentMod;
    if (parent.length > 0) { //确定是否分栏布局
        templateParentStr = parent.html();
        parentColumn = parent.data("column");
        parentClass = parent.data("class");
        parentMod = parentColumn - (data.length % parentColumn); //获取最后一行需要补多少个空位
    }
    var templateParent;
    for (var i = 0; i < data.length; i++) {
        var item;
        var itemStr = _.template(templateStr, data[i]);// 获取已经赋值后的html
        if (itemStr.trim().indexOf("<tr") == 0) {
            item = $("<table>" + itemStr + "</table>");//获取tr的时候内容里面必须有table包住，否则可能是空对象
            item = item.find("tr");
        } else {
            item = $(itemStr);
        }
        var hadChildren = new Array(); //创建子模板的数组
        var allItem = item.concat(item.find("*")); //把所有自己的子元素和自己都放在 allItem里面
        allItem.forEach(function (e) {
            //寻找allItem 里面是否有子模板，有就push 入hadChildren
            var child = $(e);
            var template = child.data("template");
            var children = child.data("children");
            if (template != null && children != null) {
                hadChildren.push(e);
            }
        });
        hadChildren.forEach(function (e) {
            bindTemplate($(e), data[i][e.dataset["children"]]);//编译子模板
        });

        if (parent.length > 0) { //是否分栏布局
            if (i % parentColumn == 0) {// 判断是否每一行的第一列位置，就添加一个flexbox的父元素
                templateParent = $(templateParentStr);
                container.append(templateParent);
            }
            for (var j = 0; j < item.length; j++) {
                templateParent.append(item[j]);
            }
            if (i == data.length - 1) {
                //假如循环到最后一个元素的时候，就添加空位。
                for (var j = 0; j < parentMod; j++) {
                    templateParent.append($("<div style='background:none;border:none;' clss='noBackground " + parentClass + "'></div>"));
                }
            }
        } else {
            for (var j = 0; j < item.length; j++) {
                container.append(item[j]);
            }
        }
    }
    if (images != null) {
        template.loadImage(data, images);
    }
    container.removeClass("hidden");
    return container;
}

var template = {
    emcs: tools.getHost().cdn,
    //图片补全地址
    formatImage: function (obj, property) {
        var data = toArray(obj);
        var properties = toArray(property);
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < properties.length; j++) {
                if (properties[j].indexOf("|") == -1) {
                    var url = data[i][properties[j]];
                    if (url != null) {
                        if (data[i][properties[j]].indexOf(this.emcs) == -1) {
                            data[i][properties[j]] = this.emcs + url;
                        }
                        data[i][properties[j] + "Key"] = url.split("=")[1];
                    } else {
                        data[i][properties[j] + "Key"] = null;
                    }
                } else {//支持子对象是数组
                    var children = properties[j].split("|");
                    var ary = toArray(data[i][children[0]]);
                    for (var k = 0; k < ary.length; k++) {
                        var url = ary[k][children[1]];
                        if (url != null) {
                            if (ary[k][children[1]].indexOf(this.emcs) == -1) {
                                ary[k][children[1]] = this.emcs + url;
                            }
                            ary[k][children[1] + "Key"] = url.split("=")[1];
                        } else {
                            ary[k][children[1] + "Key"] = null;
                        }
                    }
                }
            }
        }
    },
    //把图片缓存到客户端
    loadImage: function (obj, property) {
        var data = toArray(obj);
        var properties = toArray(property)
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < properties.length; j++) {
                if (properties[j].indexOf("|") == -1) {
                    var key = data[i][properties[j] + "Key"];
                    if (key != null && key != "") {
                        var url = data[i][properties[j]];
                        cache.cacheImageWithUrl("template.formatImageCallback", url, key);
                    }
                } else {//支持子对象是数组
                    var children = properties[j].split("|");
                    var ary = data[i][children[0]];
                    for (var k = 0; k < ary.length; k++) {
                        var key = ary[k][children[1] + "Key"];
                        if (key != null && key != "") {
                            var url = ary[k][children[1]];
                            cache.cacheImageWithUrl("template.formatImageCallback", url, key);
                        }
                    }
                }
            }
        }
    },
    //缓存到客户端后的回调方法
    formatImageCallback: function (url, filePath, sUserInfo) {
        //当模板循环绑定数据的时候，图片属性名+'key'＝图片路径后面的参数值
        //图片路径: /front/emcs-server-newMobile/mongoPhoto/getProductPhoto?photoCode=S1418893496410
        //<img class="<%=iconImgKey%>" src="../com.infinitus.common/images/default.png" />
        $("." + sUserInfo).attr("src", filePath);
        if( $("." + sUserInfo).length >0 && $("." + sUserInfo)[0].tagName =="IMG"){
             $("." + sUserInfo)[0].onload = function(){
            if(page.loadImageCallBack){
                 page.loadImageCallBack($("." + sUserInfo));
            }
           
         }
        }
        

    }
}

//日期格式化
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
            ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
function formatDate(obj, property, format) {
    var data = toArray(obj);
    var properties = toArray(property)
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < properties.length; j++) {
            data[i][properties[j]] = toDate(data[i][properties[j]]).format(format);
        }
    }
}

//本地数据保存
function saveObject(key, obj) {
    if (tools.debug) {
        window.localStorage.setItem(key, JSON.stringify(obj));
    } else {
        tools.saveTempCache(key, JSON.stringify(obj));
    }
}

//本地数据读取
function loadObject(key, keep) {
    var objStr;
    if (tools.debug) {
        objStr = window.localStorage.getItem(key);
        if (keep != true) {
            //window.localStorage.removeItem(key);
        }
    } else {
        objStr = tools.readTempCache(key);
        if (keep != true) {
            tools.saveTempCache(key, "");
        }
    }
    var obj = (objStr == null || objStr == "") ? null : JSON.parse(objStr);
    return obj;
}

//清楚本地数据
function clearObject() {
    if (tools.debug) {
        window.localStorage.clear();
    } else {
        tools.cleanTempCache();
    }
}

//清除本地数据
function removeObject(key) {
    window.localStorage.removeItem(key);
}

//加法运算，避免数据相加小数点后产生多位数和计算精度损失。
function numAdd(num1, num2) {
    var baseNum, baseNum1, baseNum2;
    try {
        baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
        baseNum2 = 0;
    }

    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (numMulti(baseNum,num1) + numMulti(baseNum,num2)) / baseNum;
};

//加法运算，避免数据相减小数点后产生多位数和计算精度损失。
function numSub(num1, num2) {
    var baseNum, baseNum1, baseNum2;
    var precision;// 精度
    try {
        baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
        baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
    return Number(((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision));
};

//乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。
//这个方法还是有问题
function numMulti(num1, num2) {
    var baseNum = 0;
    try {
        baseNum += num1.toString().split(".")[1].length;
    } catch (e) {
    }
    try {
        baseNum += num2.toString().split(".")[1].length;
    } catch (e) {
    }
    return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum);
};


//除法运算，避免数据相除小数点后产生多位数和计算精度损失。
//这个方法还是有问题
function numDiv(num1, num2) {
    var baseNum1 = 0, baseNum2 = 0;
    var baseNum3, baseNum4;
    try {
        baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
        baseNum2 = 0;
    }
    with (Math) {
        baseNum3 = Number(num1.toString().replace(".", ""));
        baseNum4 = Number(num2.toString().replace(".", ""));
        return (baseNum3 / baseNum4) * pow(10, baseNum2 - baseNum1);
    }
};

//页面初始化事件处理
var pageObject = {
    //每个页面都会render时调用此方法，用作判断IPAD,PHONE，然后使用不同的模板
    render: function (phone, pad, CubeView) {
        if (deviceType == "phone") {
            $(this.el).html(phone);
        } else {
            $(this.el).html(pad);
        }
        CubeView.prototype.render.call(this);

        return this;
    },
    beforeInitialize: function (e) {
        commonAjax.ajaxSetup();
        commonAjaxNew.ajaxCount = 0; //用作记录当前AJAX的请求数，控制loader 的显示消失。
    },
    beforeOnShow: function (e) {
        pageObject.changeTheme();

        //弹出框
        $(".showOverlay").bind("tap", function () {
            $(".overlay").removeClass("hidden");
        })
        $(".overlay").bind("tap", function (sender) { //点击灰色层隐藏
            if (sender.currentTarget == sender.target) {
                $(sender.currentTarget).addClass("hidden");
                if(page.hideOverlayCallBack){
                    page.hideOverlayCallBack();
                }
            }
        });

        //tab
        var firstTab = $(".tab > div > div:nth-child(1)");
        firstTab.addClass("tab-active").siblings().removeClass("tab-active");
        var firstContext = $("#" + firstTab.data("context"));
        firstContext.removeClass("hidden").siblings().addClass("hidden");
        $(".tab>div>div").live("tap", function (tab) {
            var target = $(tab.currentTarget);
            var context = target.data("context");
            target.addClass("tab-active").siblings().removeClass("tab-active");
            if (e.changeTab != null) {
                e.changeTab(context);
            }
            //加上动画
            var showContext = $("#" + context);
            var currentContext = showContext.siblings().not(".hidden");
            currentContext.addClass("autoHide");
            setTimeout(function () {
                showContext.addClass("autoShow");
                showContext.removeClass("hidden").siblings().addClass("hidden");
                showContext.removeClass("autoShow");
                currentContext.removeClass("autoHide");
            }, 500);
        });

        //返回功能
        //e.goBack 当本身页面没有定义的时候这里就会定义，然后判断是否有弹出层，有就关闭弹出层，否则就判断是否模块主页，如果是就直接跳出。
        if (e.goBack == null) {
            e.goBack = function (sender) {
                if ($(".overlay:not(.hidden)").length > 0) {
                    $(".overlay").addClass("hidden");
                } else {
                    transfer.returnBack(window.location.href.lastIndexOf("/") + 1 == window.location.href.length);
                }
            }
        }
        //物理返回键
        tools.setBackAction("page.goBack");
        //返回按键
        var goBackBtn = $(".goBack");
        goBackBtn.html(goBackBtn.text());
        goBackBtn.bind("tap", e.goBack);

        var goBack = $(".goBack:not(.goBackPad)").parent();
        goBack.addClass("goBack");
        var goBackPad = $(".goBackPad").parent();
        goBackPad.addClass("goBack");
        goBack.prepend($("<img class='goBackImg' src='../com.infinitus.common/images/goBack.png' />"));
        goBackPad.prepend($("<img class='goBackImg' src='../com.infinitus.common/images/gobackPad.png' />"));

        //tab 滑动，代码应该放在上面的位置
        $("html").bind("swipeLeft", function (event) {
            if (e.swipe != null) {
                e.swipe("left");
            }
            $(".tab-active").next().trigger("tap");
        });
        $("html").bind("swipeRight", function (event) {
            if (e.swipe != null) {
                e.swipe("right");
            }
            $(".tab-active").prev().trigger("tap");
        });

        //下拉分页代码
        if (page.nextPage != null) {
            $(window).bind("scroll", function (event) {
                var nextPage = $(".nextPage:not(.hidden)");
                if (nextPage.length > 0) {
                    var offset = nextPage.offset();
                    var nextPagePosition = offset.top + numDiv(offset.height, 2);//offsetTop + 2分之一“加载更多”高度
                    var currentWindow = $(window);
                    var currentPosition = currentWindow.height() + currentWindow.scrollTop();
                    if (nextPagePosition <= currentPosition) {//已经到底部
                        $(".nextPage").addClass("hidden");
                        page.nextPage();
                    } else {
                        //if (offset.top < currentPosition) {
                        //    document.body.scrollTop = offset.top - offset.height;
                        //}
                    }
                }
            });
        }

        //省市区选择
        $(".areaSelect:not(:disabled),#addressList:not(:disabled)").bind("tap", business.selectArea);

        //弹出窗隐藏滚动条
        try {
            var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;
            if (mutationObserver != null) {
                var observer = new mutationObserver(function (sender) {
                    if ($(".overlay:not(.hidden)").length > 0) {
                        //removeScroll();
                    } else {
                        //enableScroll();
                    }
                });
                var overlay = $(".overlay")
                overlay.forEach(function (item) {
                    var options = {
                        "attributes": true
                    };
                    observer.observe(item, options);
                });
            }
        }
        catch (ex) {
        }
    },
    afterOnShow: function (e) {
        displayPhoneOrPad();
        document.body.scrollTop = 0;
    },
    nextPageSuccess: function (data) {
        if (data.lastPage) {
            $(".nextPage").addClass("hidden");
        } else {
            $(".nextPage").removeClass("hidden");
        }
    },
    nextPageFailed: function () {
        $(".nextPage").addClass("hidden");
    },
    changeTheme: function () {
        try {
            $(".topBar>div").css("background-color", tools.themeColor("status_bar_bg"));
        } catch (ex) {
        }
    }
}

//拦截页面事件
Object.defineProperty(window, "page", {
    set: function (e) {
        pageObject.beforeInitialize(e);
        var onShow = e.onShow;
        e.onShow = function () {
            if (e.resize != null) {
                $(window).resize(e.resize);
                e.resize();
            }
            pageObject.beforeOnShow(e);
            onShow();
            pageObject.afterOnShow(e);
        }
        e.callBack = new Array();
        window.currentPage = e;
    },
    get: function () {
        return window.currentPage;
    }
});

//设备参数
var commonParam = tools.getCommonParam();

//设备类型
var deviceType = commonParam[0].brand == "iPad" ? "pad" : "phone";

//根据phone和pad显示不同
function displayPhoneOrPad() {
    var hiddenType = commonParam[0].brand != "iPad" ? "pad" : "phone";
    $("." + hiddenType).addClass("hidden");
}

//全局回调函数
var globalCallback = new Object();

function doNothing() {
}

//之前不知道currentTarget，所以要用target找到currentTarget的 data属性
function findData(e, key) {
    var target = $(e);
    var value = target.data(key);
    if (value == null || value == "") {
        var parent = target.parent();
        if (parent.length > 0) {
            return findData(parent, key);
        }
    } else {
        return value;
    }
}

String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

String.prototype.trimStr = function (value) {
    var str = this;
    if (str.indexOf(value) == 0) {
        str = str.substring(value.length);
    }
    if (str.indexOf(value) == str.length - value.length) {
        str = str.substring(0, str.length - value.length);
    }
    return str;
}

var business = {
    selectArea: function (e, touch) {
        var target = $(e.target)
        var type = target.data("type"); // 省、市、区
        var business = target.data("business");//区分接口数据,根据接口文档
        var parent = e.target.dataset["parent"]; //已选择的上一级目录对象
        page.addressSelectCode = e.target.dataset["code"];
        var saleBranchNo = e.target.dataset["salebranchno"];//在线推荐的分公司code
        var zipCode = e.target.dataset["zipcode"];
        var data = new Object();
        var url;
        var parentType;
        var childType;
        var clear = [];
        var title;
        switch (type) {
            case "province":
                if (business == "so") {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/common/query/listSoProvinces";
                } else {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/jpAddrManager/query/listJpPoProvinces";
                }
                childType = "city";
                title = "选择省份";
                break;
            case "city":
                if (business == "so") {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/common/query/listSoCitys";
                } else {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/jpAddrManager/query/listJpPoCitys";
                }
                parentType = "province";
                childType = "county";
                clear = ["city", "county", "districts"];
                if (!parent) {// 上一级没有选择
                    return;
                }
                data = {
                    provinceCode: parent
                };
                title = "选择城市";
                break;
            case "county":
                if (business == "so") {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/common/query/listSoCountys";
                } else {
                    url = "/gbss-mobile/front/gbss-mobile-newBusiness/jpAddrManager/query/listJpCountys";
                }
                parentType = "city";
                childType = "districts";
                clear = ["county", "districts"];
                if (!parent) {
                    return;
                }
                data = {
                    cityCode: parent
                };
                title = "选择区/县";
                break;
            case "districts":
                url = "/gbss-mobile/front/gbss-mobile-newBusiness/jpAddrManager/query/listJpDistricts";
                parentType = "county";
                clear = ["districts"];
                if (!parent) {
                    return;
                }
                data = {
                    areaCode: parent
                };
                title = "选择镇/区";
                break;
            default:
                parentType = "districts";
                break;
        }
        var text = target.text();
        if (text != "") {
            //清空所有下级的数据
            clear.forEach(function (item) {
                $(".areaSelect[data-type='" + item + "']").val("请选择");
                $(".areaSelect[data-type='" + item + "']").data("parent", "");
                $(".areaSelect[data-type='" + item + "']").data("code", "");
            });
            var parentSel = $(".areaSelect[data-type='" + parentType + "']");
            parentSel.val(text);
            parentSel.data("code", parent);
            if (page.selectArea != null) {
                page.selectArea(parentType, parent, saleBranchNo, zipCode);
            }
            if (parentType == "districts") {
                parentSel.data("ismaxactive", e.target.dataset["ismaxactive"]);
                var effectivedate = e.target.dataset["effectivedate"];
                if (effectivedate != "") {
                    effectivedate = effectivedate.split(" ")[0];
                    parentSel.data("effectivedate", effectivedate);
                }
            }
            $(".areaSelect[data-type='" + type + "']").data("parent", parent);
        }
        if (url != null && $(".areaSelect[data-type='" + type + "']").length > 0) {
            callAjaxNew({
                url: url,
                data: data,
                success: function (data, status, xhr) {
                    data.forEach(function (item) {
                        item.type = childType;
                        item.isMaxActive = item.isMaxActive == null ? "" : item.isMaxActive;
                        item.effectiveDate = item.effectiveDate == null ? "" : item.effectiveDate;
                        item.zipCode == item.zipCode == null ? "" : item.zipCode;
                    });
                    bindTemplate("addressList", data);
                    $($("#addressList").parent().children()[0]).text(title);
                    $("#addressList").children().data("business", business);
                    var children = $("#addressList").children();
                    for (var i = 0; i < data.length; i++) {
                        children[i].dataset["salebranchno"] = data[i].saleBranchNo;
                        children[i].dataset["zipcode"] = data[i].zipCode;
                    }
                    $(".selectArea").parent().removeClass("hidden");
                    $("#addressList>div[data-parent='" + page.addressSelectCode + "']").addClass("active");
                }
            });
        } else {
            $(".selectArea").parent().addClass("hidden");
        }
    }
}

function pageLoad() {
    var designWidth = deviceType == "pad" ? 2048 : 640;
    var deviceDidth = $(window).width();
    if (deviceType == "pad") {
        $("link").forEach(function (item) {
            item.href = item.href.replace(".css", "_pad.css");
        });
        $("meta[name='viewport']").forEach(function (item) {
            var content = $(item).attr("content").replace("device-width", deviceDidth);
            $(item).attr("content", content);
        });
    }
    var fontSize = deviceDidth / designWidth * (deviceType == "pad" ? 160 : 100);
    $("html").css("font-size", fontSize + "px");
    if (typeof window.console === "undefined") {
        window.console = {
            log: function () { }
        };
    }
    $(window).resize = setSize;
}


function setSize() {
    var designWidth = deviceType == "pad" ? 2048 : 640;
    var deviceDidth = $(window).width();
    if (deviceType == "pad") {
        $("meta[name='viewport']").forEach(function (item) {
            var content = $(item).attr("content").replace("device-width", deviceDidth);
            $(item).attr("content", content);
        });
    }
    var fontSize = deviceDidth / designWidth * (deviceType == "pad" ? 160 : 100);
    $("html").css("font-size", fontSize + "px");
}
//当没数据的时候要显示一个DIV样式来显示
function empty(msg) {
    var noData = $("<div class='empty middle'>" + msg + "</div>");
    page.$el.append(noData);
}

function removeEmpty() {
    $(".empty").remove();
}

function removeScroll() {
    var window_height = $(window).height();
    $(".page").height(window_height).css("overflow", "hidden");
}

function enableScroll() {
    $(".page").height("auto").css("overflow", "auto");
}


//解决事件穿透
function stopTap(touch, e) {
    var target = $(touch.el);
    if (target.hasClass("overlay")
        || (target.parents().hasClass("overlay") && !(target.is("input[type='text']") || target.is("input[type='checkbox']")))
        || target.hasClass("goBack")
        || ($(touch.el).data("stop") || $(touch.el).parents("[data-stop='true']").length > 0
        )) {
        var forTap = $('#forTap');
        if (!forTap[0]) {
            forTap = $('<div id="forTap" style="display: none; border-radius: 60px; position: absolute; z-index: 99999; width: 60px; height: 60px"></div>');
            $('body').append(forTap);
        }
        forTap.css({
            top: (e.changedTouches[0].pageY - 30) + 'px',
            left: (e.changedTouches[0].pageX - 30) + 'px'
        });
        forTap.show();
        setTimeout(function () {
            forTap.hide();
        }, 350);
    }
}

function keyboardWillShow() {
    $(".shoppingBar").addClass("commonHidden");
    $(".topBar>div,.fixed").addClass("topBarHidden");
    page.currentScroll = document.body.scrollTop;
}

function keyboardWillHide() {
    $(".shoppingBar").removeClass("commonHidden");
    $(".topBar>div,.fixed").removeClass("topBarHidden");
    document.body.scrollTop = page.currentScroll;
}

function toDate(str) {
    try {
        if (str == null) {
            return new Date();
        }
        var date = new Date(str);
        if (!isNaN(date)) {
            return date;
        } else {
           // return eval("new Date(" + str.split(/\D/).join(",").replace(/(^\,*)|(\,*$)/g, "") + ")");
            var parms=str.split(/\D/).join(",").replace(/(^\,*)|(\,*$)/g, "").split(",")
            parms[1]=parseInt(parms[1])-1;
            return eval("new Date("+parms.join(",")+")");
        }
    } catch (ex) {
        return new Date(undefined);
    }
}
function selecttwo(){
    var firstTab = $(".tab > div > div:nth-child(2)");
    firstTab.addClass("tab-active").siblings().removeClass("tab-active");
    var firstContext = $("#" + firstTab.data("context"));
    firstContext.removeClass("hidden").siblings().addClass("hidden");
}