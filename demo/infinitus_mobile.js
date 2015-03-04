//
//  infinitus.js
//  Infinitus_3Channels
//
//  无限极原生功能JS API库
//
//  Object参数支持的类型：基础类型(如：int,boolean,double,float,char等) String
//
//  ctsCmd.execVoidCmd(sClassName,sMethod,aParams); // 没有返回值的方法使用此方法调用
//  ctsCmd.execCmd(sClassName,sMethod,aParams); // 有返回值的方法使用此方法调用
//  ctsCmd.log(sLog); // 输出日志到控制台
//
//  Created by fanlanjun on 14-08-12.
//  Copyright (c) 2014年 fanlanjun. All rights reserved.
//

/**
 * 页面跳转对象
 */
var transfer = {
	className:"Transfer",
	/**
	 * 返回到上一个HTML页面或返回到上一个视图
	 * @param bIsGoView boolean 为真时不调用浏览器返回直接返回到上一个视图 参数可选
	 * @param sFun String 返回后调用上个页面的JS 参数可选
	 * @param oParam Object 调用函数传的参数 参数可选
	 */
	returnBack:function(bIsGoView,sFun,oParam) {
		ctsCmd.execVoidCmd(this.className, "returnBack", JSON.stringify([bIsGoView,sFun,oParam]));
	},	
	/**
	 * 打一个新视图
	 * @param sUrl String HTML页面在线或本地地址
	 * @param sInitFun String 打开新页面调用页面的JS 参数可选
	 * @param oInitParam Object 调用函数传的参数 参数可选
     * @param sTitle String 标题
	 */
	openPage:function(sUrl,sInitFun,oInitParam,sTitle) {
		ctsCmd.execVoidCmd(this.className, "openPage", JSON.stringify([sUrl,sInitFun,oInitParam,sTitle]));
	},
    /**
     * 在当前视图加载一个新页面；使用此方法将清除web的前进和后退历史
     * @param sUrl String HTML页面在线或本地地址
     */
    loadPageWithUrl:function(sUrl) {
        ctsCmd.execVoidCmd(this.className, "loadPageWithUrl", JSON.stringify([sUrl]));
    },
    /**
     * 用户账号信息失效时，登出该账号
     */
    logoutByUserInvalid:function() {
        ctsCmd.execVoidCmd(this.className, "logoutByUserInvalid", JSON.stringify([]));
    },
    /**
     * 返回到首页
     */
    goHome:function() {
        ctsCmd.execVoidCmd(this.className, "goHome", JSON.stringify([]));
    },
    /**
     * 登录接口
     * @param sCallback String function callback(bLogin){} bLogin 布尔类型 是否登录成功
     */
    login:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "login", JSON.stringify([sCallback]));
    },
    /**
     * 跳转到支付页面
     * @param sPayUrl String 支付提交地址
     * @param sCallback String function callback(jData){} 
            jData JSON对象 支付结果；用户取消支付时对象为null
     */
    openPayPage:function(sPayUrl, sCallback) {
        ctsCmd.execVoidCmd(this.className, "openPayPage", JSON.stringify([sPayUrl, sCallback]));
    },
    /**
       * 加载分割页面WebView请求
       * @param sUrl String 支付提交地址
       */
    loadSplitWebViewRequest:function(sUrl) {
        ctsCmd.execVoidCmd(this.className, "loadSplitWebViewRequest", JSON.stringify([sUrl]));
    },
    /**
     * 选择通信录
     * @param sCallback String function callback(sPhoneNumber){}
            sPhoneNumber String 选择的手机号码
     */
    pickContact:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "pickContact", JSON.stringify([sCallback]));
    }
};

/**
 * 通用接口方法对象
 */
var tools = {
    className:"Tools",
    /**
     * 调试标识符
     */
    debug:false,
    /**
	 * 获取无限极接口统一公共参数
     * @return Array 接口公共参数
	 */
    getCommonParam:function() {
        return JSON.parse(ctsCmd.execCmd(this.className, "getCommonParam", JSON.stringify([])));
    },
    /**
     * 设置页面标题
     * @param sTitle String 标题
     */
    setTitle:function(sTitle) {
        ctsCmd.execVoidCmd(this.className, "setTitle", JSON.stringify([sTitle]));
    },
    /**
     * 显示对话框
     * @param sTitle String 标题
     * @param sMsg String 提示内容
     * @param aBtnTitles Array 按钮数组如: ['确定','取消']
     * @param sCallback String 回调函数名 参数可选 
     *      结构function callback(iIndex){} iIndex从0开始
     */
    showDialog:function(sTitle,sMsg,aBtnTitles,sCallback) {
        ctsCmd.execVoidCmd(this.className, "showDialog", JSON.stringify([sTitle,sMsg,aBtnTitles,sCallback]));
    },
    /**
     * 显示提示
     * @param sMsg String 提示内容
     * @param iDuration int 显示时长，默认为2秒 参数可选
     */
    showToast:function(sMsg,iDuration) {
        ctsCmd.execVoidCmd(this.className, "showToast", JSON.stringify([sMsg,iDuration]));
    },
    /**
     * 显示加载中进度框
     * @param sMsg String 进度提示内容 参数可选
     */
    showLoading:function(sMsg) {
        ctsCmd.execVoidCmd(this.className, "showLoading", JSON.stringify([sMsg]));
    },
    /**
     * 关闭加载中进度框
     */
    dismissLoading:function() {
        ctsCmd.execVoidCmd(this.className, "dismissLoading", JSON.stringify([]));
    },
    /**
     * 设置返回动作，默认直接返回；设置动作后由开发者控制返回操作
     * @param sFunName String 点击返回键或返回按钮时调用的JS 参数可选
     */
    setBackAction:function(sFunName) {
        ctsCmd.execVoidCmd(this.className, "setBackAction", JSON.stringify([sFunName]));
    },
    /**
     * 缩放图片
     * @param imgs  json数组：格式：["图片1的本地绝对路径","图片2的本地绝对路径"]    
     * 
     */
    lookPhoto:function(imgs){
        ctsCmd.execVoidCmd(this.className, "lookPhoto", JSON.stringify([imgs]));
    },
    /**
     * 获取客户端请求host：
     * @return json对象：gbss，uim，emcs，root（属性的使用请参考接口文档说明，自带https://前缀）
     */
    getHost:function() {
        return JSON.parse(ctsCmd.execCmd(this.className, "getHost", JSON.stringify([])));
    },
    /**
     * 客户端版本检测
     * @param sCallback String 回调函数名 参数可选 结构function callback(hasUpdate){} hasUpdate boolean类型
     */
    checkVersion:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "checkVersion", JSON.stringify([sCallback]));
    },
    /**
     * 打电话
     * @param sPhoneNumber String 电话号码
     */
    makePhoneCall:function(sPhoneNumber) {
        ctsCmd.execVoidCmd(this.className, "makePhoneCall", JSON.stringify([sPhoneNumber]));
    },
    /**
     * 安全退出
     */
    logout:function() {
        ctsCmd.execVoidCmd(this.className, "logout", JSON.stringify([]));
    },
    /**
     * 日期选择器
     * @param sCallback String 回调函数
     *      result String 选择的日期，格式：YYYY-MM-DD HH:mm:ss
     *      function callback(result);
     * @param iDateType int 选择器类型：0 Date 1 Time 2 DateAndTime
     * @param sSelected String 默认选中的日期，格式：Y-M-D H:m:s
     */
    showDatePicker:function(sCallback,iDateType,sSelected) {
        ctsCmd.execVoidCmd(this.className, "showDatePicker", JSON.stringify([sCallback,iDateType,sSelected]));
    },
    /**
     * 业务密码确认
     * @param sCallback String 回调函数名 结构function callback(bResult){} bResult boolean 验证结果
     */
    confirmBusinessPwd:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "confirmBusinessPwd", JSON.stringify([sCallback]));
    },
    /**
     * ecb加密
     * @param sOldText String 要加密的内容
     * @return String 加密后内容
     */
    ecbEncrypt:function(sOldText) {
        return ctsCmd.execCmd(this.className, "ecbEncrypt", JSON.stringify([sOldText]));
    },
    /**
     * 保存网页临时缓存
     * @param sKey String key名称
     * @param oValue Object 要保存的内容
     * @return boolean 结果
     */
    saveTempCache:function(sKey, oValue) {
        return ctsCmd.execCmd(this.className, "saveTempCache", JSON.stringify([sKey, oValue]));
    },
    /**
     * 读取网页临时缓存
     * @param sKey String 查询的key名称
     * @return Object 保存的内容
     */
    readTempCache:function(sKey) {
        return ctsCmd.execCmd(this.className, "readTempCache", JSON.stringify([sKey]));
    },
    /**
     * 清除网页临时缓存
     * @return Object 保存的内容
     */
    cleanTempCache:function() {
        ctsCmd.execVoidCmd(this.className, "cleanTempCache", JSON.stringify([]));
    },
    /**
     * 主动旋转屏幕
     * @param rotation 0竖屏（默认），1横屏，2重力感应控制
     */
    rotateScreen:function(rotation) {
        ctsCmd.execVoidCmd(this.className, "rotateScreen", JSON.stringify([rotation]));
    },
    /**
     * 显示指引页
     * @param sImgName String 图片名不包含图片后缀
     * @param sModuleIdentifier String 模块标识
     */
    addTipsToController:function(sImgName, sModuleIdentifier) {
        ctsCmd.execVoidCmd(this.className, "addTipsToController", JSON.stringify([sImgName, sModuleIdentifier]));
    },
    /**
     * 获取主题定义的颜色值
     * @param sColorName String configure.xml文件定义的颜色值key名称
     * @return String 16进制的颜色值 如：#000000
     */
    themeColor:function(sColorName) {
        return ctsCmd.execCmd(this.className, "themeColor", JSON.stringify([sColorName]));
    }
};

/**
 * 用户设置信息对象
 */
var userDefault = {
    className:"Tools",
    /**
     * 读取用户设置信息
     * @param sKey String 查询的key名称
     * @return Object 保存的内容
     */
    readValue:function(sKey) {
        var result = ctsCmd.execCmd(this.className, "readUserDefault", JSON.stringify([sKey]));
        return result;
    },
    /**
     * 保存信息到用户设置
     * @param sKey String key名称
     * @param oValue Object 要保存的内容
     * @return boolean 结果
     */
    saveValue:function(sKey, oValue) {
        return JSON.parse(ctsCmd.execCmd(this.className, "saveUserDefault", JSON.stringify([sKey, oValue])));
    }
};

/**
 * 内存缓存对象
 */
var memory = {
    className:"Tools",
    /**
     * 读取用户设置信息
     * @param sKey String 查询的key名称
     * @return Object 保存的内容
     */
    readValue:function(sKey) {
        
        var result = ctsCmd.execCmd(this.className, "readMemory", JSON.stringify([sKey]));
        return result;
    },
    /**
     * 保存信息到用户设置
     * @param sKey String key名称
     * @param oValue Object 要保存的内容
     * @return boolean 结果
     */
    saveValue:function(sKey, oValue) {
        return JSON.parse(ctsCmd.execCmd(this.className, "saveMemory", JSON.stringify([sKey, oValue])));
    }
};

/**
 * 数据库对象
 */
var database = {
    className:"Database",
    /**
     * 查询数据库内容
     * @param sSql String 查询语句
     * @param aParams Array 使用?占位符时的sql语句参数 参数可选
     * @return Array 查询结果
     */
    querySql:function(sSql,aParams) {
        return JSON.parse(ctsCmd.execCmd(this.className, "querySql", JSON.stringify([sSql,aParams])));
    },
    /**
     * 增 删 改数据库内容
     * @param sSql String 执行语句
     * @param aParams Array 使用?占位符时的sql语句参数 参数可选
     * @return boolean 执行结果
     */
    execSql:function(sSql,aParams) {
        return JSON.parse(ctsCmd.execCmd(this.className, "execSql", JSON.stringify([sSql,aParams])));
    }
    
};

/**
 * 缓存处理对象
 */
var cache = {
    className:"NHWebCache",
    /**
     * 清除缓存
     * @param sCallback String 回调函数名 参数可选
     *      result boolean 结果
     *      结构function callback(result){}
     */
    clean:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "clean", JSON.stringify([sCallback]));
    },
    /**
     * 下载图片并缓存到缓存器中
     * @param sImgUrl String 图片地址
     * @param sUserInfo String 需要保存的内容
     * @param sCallback(imgUrl,filePath,sUserInfo);
     */
    cacheImageWithUrl:function(sCallback, sImgUrl, sUserInfo) {
        ctsCmd.execVoidCmd(this.className, "cacheImageWithUrl", JSON.stringify([sCallback, sImgUrl, sUserInfo]));
    }
};

/**
 * 网络请求对象
 */
var network = {
    className:"Network",
    /**
     * get方式请求http接口内容
     * @param sUrl String 请求地址
     * @param jParam JSON 请求参数
     * @param sCallback String 回调函数名
     *      code int 状态码 无网络:-101 地址不合法:-102；其它参照http状态码定义
     *      result 成功时为服务器返回的数据，其它为错误内容
     *      结构function callback(result,code){}
     * @param bIsCache boolean 参数可选 是否需要缓存
     */
    get:function(sUrl, jParam, sCallback, bIsCache) {
        ctsCmd.execVoidCmd(this.className, "get", JSON.stringify([sUrl, jParam, sCallback, bIsCache]));
    },
    /**
     * post方式请求http接口内容
     * @param sUrl String 请求地址
     * @param jParam JSON 请求参数
     * @param sCallback String 回调函数名
     *      code int 状态码 无网络:-101 地址不合法:-102 用户未授权访问通讯录:-304；其它参照http状态码定义
     *      result 成功时为服务器返回的数据，其它为错误内容
     *      结构function callback(result,code){}
     */
    post:function(sUrl, jParam, sCallback) {
        ctsCmd.execVoidCmd(this.className, "post", JSON.stringify([sUrl, jParam, sCallback]));
    },
    /**
     * 返回当前网络状态
     * @return int 0没有网络，1gprs网络，2wifi网络
     */
    checkNetState:function() {
        return ctsCmd.execCmd(this.className, "checkNetState", JSON.stringify([]));
    },
    /**
     * 上传通讯录到服务器
     * command.arguments = []
     * @param sCallback String 回调函数名
     *      code int 状态码 无网络:-101 地址不合法:-102；其它参照http状态码定义
     *      result 成功时为服务器返回的数据，其它为错误内容
     *      结构function callback(code,result){}
     */
    uploadContacts:function(sCallback) {
        ctsCmd.execVoidCmd(this.className, "uploadContacts", JSON.stringify([sCallback]));
    }
};