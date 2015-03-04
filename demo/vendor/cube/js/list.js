/*
 * 列表组件，最终转换出html5
 * <div id="passenger-list">
 *  <div class="contentScroller">
 *  </div>
 * </div>
 *
 */
define(['zepto', 'underscore', 'cube/cube-loader', 'cube/cache', 'iscroll.lite', 'backbone'], function($, _, Loader, Cache, iScroll, Backbone) {

    var List = Backbone.View.extend({

        tagName: 'div',
        //渲染组件时，此组件所在上下文，可能未attach到document，所以一些元素查找，需要在上下文内查找，例如itemTemplate
        elContext: document,

        events: {
            // "": "reload"
            "click .cube-list-item": "onItemSelect"
        },

        requestParams: {},

        config: {
            /*提取到父类*/
            observers: [],
            /*自有*/
            autoLoad: "true",
            pageParam: 'page',
            pageSizeParam: 'pageSize',
            page: 1,
            pageSize: 10,
            pullDownEnable: false,
            pagingEnable: true,
            iScroll: false,
            method: 'GET',
            filterStr: null,
            offLine:"false",               //离线
            offLinePaging:true,
            isNeedUpdateCache:true        //离线数据是否需要更新
        },

        request: null,

        initialize: function() {
            var me = this;
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

            //iScroll
            if (this.config.iScroll != 'false') {

                var list_iScroll = new iScroll(this.el, {
                    onBeforeScrollStart: function(e) {
                        var target = e.target;
                        while (target.nodeType != 1) target = target.parentNode;
                        if (target.tagName != 'TEXTAREA' && target.tagName != 'INPUT' && target.tagName != 'SELECT') e.preventDefault();
                    },
                    useTransition: true,
                    onRefresh: function() {
                        pullUpEl = document.getElementById('pullUp');
                        if (pullUpEl != null) {
                            pullUpOffset = pullUpEl.offsetHeight;
                            if (pullUpEl.className.match('loading')) {
                                pullUpEl.className = '';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = '下一页...';
                            }
                        }
                    },
                    onScrollMove: function() {
                        pullUpEl = document.getElementById('pullUp');
                        if (pullUpEl != null) {
                            pullUpOffset = pullUpEl.offsetHeight;
                            if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                                pullUpEl.className = 'flip';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = '松开即可刷新...';
                                this.maxScrollY = this.maxScrollY;
                            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                                pullUpEl.className = '';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = '下一页...';
                                this.maxScrollY = pullUpOffset;
                            }
                        }
                    },
                    onScrollEnd: function() {
                        pullUpEl = document.getElementById('pullUp');
                        if (pullUpEl != null) {
                            pullUpOffset = pullUpEl.offsetHeight;

                            if (pullUpEl.className.match('flip')) {
                                pullUpEl.className = 'loading';
                                pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';
                                me.config.page = me.config.page + 1;
                                if(me.config.offLine == "true"||me.config.offLine == true){
                                    var CACHE_ID = 'cube-list-' + me.config['id'];
                                    var arr = Cache.get(CACHE_ID);
                                    var ps = parseInt(me.config.pageSize);//pageSize
                                    var p = parseInt(me.config.page);//page
                                    var tempArr = me._subJSONArray(arr,(p-1) * ps,(p-1) * ps + ps);
                                    me.loadListByJSONArray(tempArr);
                                }else{
                                    me.loadNextPage();
                                }
                            }
                        }
                    }

                });
                this.iScroll = list_iScroll;
            }

            if (this.config.autoLoad == 'true') this.reload();
        },

        onItemSelect: function(e) {

            var target = e.currentTarget;

            var data = null;

            var index = target.getAttribute('index');
            var CACHE_ID = 'cube-list-' + this.config['id'];
            if (Cache.get(CACHE_ID)) {
                var olddata = Cache.get(CACHE_ID);
                data = olddata[index];
            }
            // var nodeName = e.toElement.nodeName;
            var nodeName = e.toElement != null ? e.toElement.nodeName : e.target.nodeName;
            if (this.shouldPreventListEvent(nodeName)) {
                this.trigger("List:select", this, data, index,e);
                //list, record(include event)
                this.trigger("select", this, {
                    data: data,
                    index: index,
                    event: e
                });
            }
        },

        render: function() {
            this.reload();
            return this;
        },

        reload: function() {
            this.config.page = 1;
            this.loadNextPage();
        },

        setRequestParams: function(params) {
            this.requestParams = _.extend(this.requestParams, params);
            this.reload();
        },

        filterChildren: function(keyWord) {
            var contentScroller = this.$(".contentScroller");
            this.iScroll.scrollTo(0, 0);
            if (keyWord) {
                contentScroller.find("li[filter-keyword]").hide();
                $('#' + this.config['id'] + ' li[filter-keyword*="' + keyWord.toLowerCase() + '"]').show();
            } else {
                contentScroller.find("li[filter-keyword]").show();
            }
            if (this.config.iScroll != 'false') this.iScroll.refresh();
        },
        refreshIscroll: function() {
            if (this.config.iScroll != 'false') this.iScroll.refresh();
        },

        getfilterValue: function() {
            var searchBar = document.getElementById(this.config['id'] + '-search');
            if (searchBar) {
                return $(searchBar).find('input').val();
            }
        },
        shouldPreventListEvent: function(nodeName) {
            if (nodeName != 'TEXTAREA' && nodeName != 'INPUT' && nodeName != 'SELECT') return true;
            else return false;
        },
        _subJSONArray:function(array,startIndex,endIndex){
            var tempArray = new Array();

            if(endIndex > array.length){//若超出范围则循环到数组末端
                endIndex = array.length;
            }
            for(var i = startIndex; i < endIndex; i++){
                tempArray.push(array[i]);
            }
            return tempArray;
        },
        _cacheData:function(jsonArray){
            var CACHE_ID = 'cube-list-' + this.config['id'];
            if((this.config.offLine == "true"||this.config.offLine == true)&&(this.config.offLinePaging == true||this.config.offLinePaging == 'true')){//离线缓存翻页
                if(this.config.isNeedUpdateCache){
                    //把数组数据存起来
                    Cache.put(CACHE_ID, jsonArray);
                    var ps = parseInt(this.config.pageSize);//pageSize
                    var p = parseInt(this.config.page);//page
                    jsonArray = this._subJSONArray(jsonArray,(p-1) * ps,(p-1) * ps + ps);
                    this.config.isNeedUpdateCache = false;
                    this.iScroll.scrollTo(0, 0);
                }
            }else{                        //离线模式不该重复存储数据
                //把数组数据存起来
                var cache_data = jsonArray;
                //修改一个bug 当page大于1时才append数据 否则不append
                if (Cache.get(CACHE_ID) && this.config['page'] > 1) {
                    var olddata = Cache.get(CACHE_ID);
                    cache_data = olddata.concat(jsonArray);
                }

                Cache.put(CACHE_ID, cache_data);
            }
            return jsonArray;
        },
        updateCacheInCacheMood:function(){
            if(!this.config.offLine||this.config.offLine == 'false'){
                throw("当前不在离线模式中")
            }
            this.config.isNeedUpdateCache = true;
            this.config.page = 1;
        },
        loadListByJSONArray: function(jsonArray) {
            var me = this;
            //加载搜索栏
            me.renderSearchBar();
            if (me.config.page == 1) {
                me.clearList();
            }

            if (jsonArray === null || jsonArray.length === 0) {
                if (me.$('.cube-list-item-more-record').length === 0) {
                    var li = $("<li/>");
                    li.addClass('cube-list-item-more-record');
                    li.html('无相关记录');
                    li.appendTo(me.el.querySelector('.contentScroller .item-content'));
                    $('#pullUp').remove();
                    console.log("list: 没有数据");
                }
                return;
            }

            jsonArray = me._cacheData(jsonArray);

            var skarry;
            var _itemTemplateName = this.config['_itemTemplate'];
            var paging = this.config['paging'];
            var templateStr;
            if (_itemTemplateName) templateStr = $("#" + _itemTemplateName).html();
            if (me.config['searchkeys']) {
                skarry = me.config['searchkeys'].split(",");
            }
            //性能优化,创建fragment
            var fragment = document.createDocumentFragment();

            for (var i = 0; i < jsonArray.length; i++) {
                var item = jsonArray[i];
                // item.index = i;
                var li = $("<li/>");
                li.addClass('cube-list-item');
                li.attr('index', (me.config['page'] - 1) * me.config['pageSize'] + i);

                //为每一个li加上过滤的关键字
                if (skarry) {
                    var fkword = "";
                    for (var j = 0; j < skarry.length - 1; j++) {
                        if (jsonArray[i][skarry[j]]) {

                            fkword = fkword + jsonArray[i][skarry[j]] + " ";
                        }
                    }
                    if (jsonArray[i][skarry[skarry.length - 1]]) {
                        fkword = fkword + jsonArray[i][skarry[skarry.length - 1]];
                    }
                    li.attr('filter-keyword', fkword.toLowerCase());
                }
                if (_itemTemplateName) li.append(_.template(templateStr, item));
                //TODO: 需要重构
                // li.appendTo(document.getElementById(me.id).querySelector('.contentScroller .item-content'));
                fragment.appendChild(li[0]);
                // li.appendTo(me.el.querySelector('.contentScroller .item-content'));
            }
            $(fragment).appendTo(me.el.querySelector('.contentScroller .item-content'));

            //更多按钮
            var moreEl = this.el.querySelector('.cube-list-item-more');
            if (moreEl) this.$(moreEl).remove();

            //判断页数决定是否显示更多按钮
            if (paging == 'true' && me.config['pageSize'] == jsonArray.length) {
                //加上一个加载更多的cell
                var moreLi = $("<li/>");
                moreLi.addClass('cube-list-item-more');
                //TODO: 需要重构
                // moreLi.appendTo(document.getElementById(me.id).querySelector('.contentScroller'));
                moreLi.appendTo(me.el.querySelector('.contentScroller'));

                var pullUpText = "<div class='' id='pullUp'><span class='pullUpIcon'></span><span class='pullUpLabel'>下一页...</span></div>";
                var defalutMoreItemDiv = $(pullUpText);
                moreLi.append(defalutMoreItemDiv);
            } else if(paging !==undefined){
                var li = $("<li/>");
                li.addClass('cube-list-item-more-record');
                li.html('无更多相关记录');
                $('#pullUp').remove();
                li.appendTo(me.el.querySelector('.contentScroller .item-content'));
            }
            me.trigger("drawed", me, jsonArray);
            // me.config.page = me.config.page + 1;
            if (me.config.iScroll != 'false') {
                me.iScroll.refresh();
            }
        },
        clearList: function() {
            //clear list
            var contentScroller = this.$(".contentScroller");
            var content_holder = contentScroller.find('.item-content');

            if (this.config['page'] == 1) {
                content_holder.find("li").remove();
            }
        },
        renderSearchBar: function() {
            var me = this;
            //加载搜索按钮
            if (me.config['searching'] && me.config['searching'] == 'true') {
                if (!document.getElementById(me.config['id'] + '-search')) {
                    //加上一个加载更多的cell
                    var searchLi = $("<li/>");

                    searchLi.attr('id', (me.config['id'] + '-search'));

                    var searchInput = $('<input/>');

                    searchInput.attr('placeholder', ' 搜索');

                    //css begin
                    searchInput.css('margin-bottom', '0px');
                    //css end

                    searchInput.attr('type', 'text');
                    //响应键盘弹出来事件touchstart

                    searchInput.bind('input', function(e) {
                        var inputVal = searchInput.val();
                        me.filterChildren(inputVal);
                    });

                    searchLi.append(searchInput);

                    var navs = document.getElementsByTagName("Nav");
                    var searchNav = navs[navs.length - 1];

                    if (searchNav) {
                        searchNav = $(searchNav);
                        searchLi.css('margin-top', '5px');
                    } else {

                        searchNav = $("<Nav/>");
                    }
                    searchLi.appendTo(searchNav);

                    searchNav.addClass("bar-standard bar-header-secondary");

                    searchNav.insertBefore($(".content").last());
                }
            }
        },

        loadNextPage: function () {
            console.log('list:load  begin');
            var me = this;

            me.requestParams[me.config.pageParam] = this.config['page'];
            me.requestParams['pageSize'] = this.config['pageSize'];
            var _itemTemplateName = this.config['_itemTemplate'];
            if (!me.config['url']) return;
            var loader = new Loader({
                text: "查询中..."
            });
            $.ajax({
                block: true,
                timeout: 20 * 1000,
                traditional: true,
                url: me.config['url'],
                type: me.config['method'],
                data: me.requestParams,
                dataType: "json",
                beforeSend: function(xhr, settings) {
                    console.log('list: request data...');
                    if (me.request) {
                        me.request.abort();
                    }
                    me.request = xhr;
                },
                complete: function() {
                    me.request = null;
                    me.refreshIscroll(me);
                },
                success: function(data, textStatus, jqXHR) {
                    console.log('列表数据加载成功：' + textStatus + " response:[" + data + "]");
                    me.trigger("load", me, data);

                    var jsonRoot = data;
                    if (me.config.jsonRoot) {
                        _.each(me.config['jsonRoot'].split('.'), function(element) {
                            jsonRoot = jsonRoot[element];
                        });
                    }

                    //编译模板
                    var templateStr;
                    if (_itemTemplateName) templateStr = $("#" + _itemTemplateName).html();

                    // //append
                    // if(null === jsonRoot){
                    //     var contentEL = document.getElementById(me.id).querySelector('.contentScroller .item-content');
                    //     if(_itemTemplateName) $(contentEL).append(_.template(templateStr, jsonRoot));
                    // }else{
                    console.log(jsonRoot.length + ' records in total');

                    me.loadListByJSONArray(jsonRoot);
                    // }

                    if (me.config['filterStr']) {
                        me.filterChildren(me.config['filterStr']);
                    }
                    //update current number

                    me.trigger("loaded", me, data);
                    loader.hide();
                    console.log('list:load and draw  end');

                },
                error: function(e, xhr, type) {
                    me.config.page = me.config.page - 1;
                    console.error('列表数据加载失败：' + e + "/" + type + "/" + xhr);
                    loader.hide();
                }
            });
        }

    }, {
        parseConfig: function(element, attNameList) {

            var jqObject = $(element);

            var config = {};
            for (var i = 0; i < attNameList.length; i++) {
                var key = attNameList[i];
                var value = jqObject.attr(key);
                if (value) config[key] = value;
            }

            return config;
        },

        compile: function(elContext) {
            var me = this;
            return _.map($(elContext).find("list"), function(tag) {
                console.log('list:compile');
                var config = me.parseConfig(tag, ['id', 'itemTemplate', '_itemTemplate', 'moreItemElement', 'url', 'method', 'jsonRoot', 'class', 'paging', 'iScroll', 'autoLoad', 'pageParam', 'searching', 'searchkeys', 'filterStr', 'pageSize', 'skin', 'offLine']);

                //build html
                //<div id="{id}">
                //  <div class="contentScroller">
                //    <div class="item-content">
                //    </div>
                //  </div>
                //</div>
                var list_el = document.createElement('div');
                list_el.setAttribute('id', config.id);
                list_el.setAttribute('data-component', 'list');
                if (config.skin) {
                    list_el.setAttribute('class', 'cube-list-' + config.skin);
                } else {
                    list_el.setAttribute('class', 'cube-list-nostyle');
                }
                $(list_el).css('height', '100%');
                //整体滚动容器
                var scroller_el = document.createElement('ul');
                $(scroller_el).addClass('contentScroller');
                list_el.appendChild(scroller_el);

                //item容器（方便在header和footer之间找到正确位置插入数据行）
                var content_el = document.createElement('div');
                $(content_el).addClass('item-content');
                scroller_el.appendChild(content_el);

                //replace with html
                $(tag).replaceWith(list_el);

                config['el'] = list_el;
                config.elContext = elContext;

                var list = new List(config);
                return list;
            });
        }
    });

    return List;
});