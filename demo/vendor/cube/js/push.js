define(['zepto'], function($){

  var noop = function () {};


  // Pushstate cacheing
  // ==================

  var isScrolling;
  var maxCacheLength = 20;
  var cacheMapping   = sessionStorage;
  //用于缓存页面
  var domCache       = {};
  var transitionMap  = {
    'slide-in'  : 'slide-out',
    'slide-out' : 'slide-in',
    'fade'      : 'fade'
  };
  var bars = {
    bartab             : '.bar-tab',
    bartitle           : '.bar-title',
    barfooter          : '.bar-footer',
    barheadersecondary : '.bar-header-secondary'
  };

  //cache and replace, cache body
  var cacheDataAndReplaceState = function (data, updates) {
    Push.id = data.id;
    if (updates) data = getCached(data.id);
    //缓存数据
    cacheMapping[data.id] = JSON.stringify(data);
    //缓存当前页面（新的）
    domCache[data.id] = document.body.cloneNode(true);
    //更新history
    console.log('replaceState:' + data.url);
    window.history.replaceState(data.id, data.title, data.url);
  };

  var cachePush = function () {
    var id = Push.id;

    var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
    var cacheBackStack    = JSON.parse(cacheMapping.cacheBackStack    || '[]');

    cacheBackStack.push(id);

    while (cacheForwardStack.length)               delete cacheMapping[cacheForwardStack.shift()];
    while (cacheBackStack.length > maxCacheLength) delete cacheMapping[cacheBackStack.shift()];

    console.log('pushState:' + cacheMapping[Push.id].url);
    window.history.pushState(null, '', cacheMapping[Push.id].url);

    cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
    cacheMapping.cacheBackStack    = JSON.stringify(cacheBackStack);
  };

  var cachePop = function (id, direction) {
    var forward           = direction == 'forward';
    var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
    var cacheBackStack    = JSON.parse(cacheMapping.cacheBackStack    || '[]');
    var pushStack         = forward ? cacheBackStack    : cacheForwardStack;
    var popStack          = forward ? cacheForwardStack : cacheBackStack;

    if (Push.id) pushStack.push(Push.id);
    popStack.pop();

    cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
    cacheMapping.cacheBackStack    = JSON.stringify(cacheBackStack);
  };

  var getCached = function (id) {
    return JSON.parse(cacheMapping[id] || null) || {};
  };

  var getTarget = function (e) {
    var target = findTarget(e.target);

    if (
      !  target
      || e.which > 1
      || e.metaKey
      || e.ctrlKey
      || isScrolling
      || location.protocol !== target.protocol
      || location.host     !== target.host
      || !target.hash && /#/.test(target.href)
      || target.hash && target.href.replace(target.hash, '') === location.href.replace(location.hash, '')
      || target.getAttribute('data-ignore') == 'push'
    ) return;

    return target;
  };


  // Main event handlers (touchend, popstate)
  // ==========================================

  var touchend = function (e) {
    var target = getTarget(e);

    if (!target) return;
    
    e.preventDefault();

    Push({
      url        : target.href,
      hash       : target.hash,
      timeout    : target.getAttribute('data-timeout'),
      transition : target.getAttribute('data-transition'),
      page       : target.getAttribute('data-page'),
      from       : target.getAttribute('data-from')
    });
  };

  var popstate = function (e) {
    var key;
    var barElement;
    var activeObj;
    var activeDom;
    var direction;
    var transition;
    var transitionFrom;
    var transitionFromObj;
    var id = e.state;

    if (!id || !cacheMapping[id]) return;

    direction = Push.id < id ? 'forward' : 'back';

    cachePop(id, direction);

    activeObj = getCached(id);
    // activeDom = domCache[id];

    if (activeObj.title) document.title = activeObj.title;

    if (direction == 'back') {
      transitionFrom    = JSON.parse(direction == 'back' ? cacheMapping.cacheForwardStack : cacheMapping.cacheBackStack);
      transitionFromObj = getCached(transitionFrom[transitionFrom.length - 1]);
    } else {
      transitionFromObj = activeObj;
    }

    if (direction == 'back' && !transitionFromObj.id) return Push.id = id;

    transition = direction == 'back' ? transitionMap[transitionFromObj.transition] : transitionFromObj.transition;

    if (!activeDom) {
      return Push({  
        id         : activeObj.id,
        url        : activeObj.url,
        page       : activeObj.from,
        title      : activeObj.title,
        timeout    : activeObj.timeout,
        transition : transition,
        ignorePush : true
      });
    }

    if (transitionFromObj.transition) {
      activeObj = extendWithDom(activeObj, '.content', activeDom.cloneNode(true));
      for (key in bars) {
        barElement = document.querySelector(bars[key])
        if (activeObj[key]) swapContent(activeObj[key], barElement);
        else if (barElement) barElement.parentNode.removeChild(barElement);
      }
    }

    swapContent(
      (activeObj.contents || activeDom).cloneNode(true),
      document.querySelector('.content'),
      transition,
      function(){
        if (activeObj.from) {
          require([activeObj.from], function(Page){
            new Page().render();
          });
        }
      }
    );

    Push.id = id;

    document.body.offsetHeight; // force reflow to prevent scroll
  };

  // PUSH helpers
  // ============
  // swap: 新内容
  // constainer: 源容器
  // 分3个阶段，prepare、insert、transition
  // 先准备初始状态的class，然后再插入dom中，然后再改变class实现变换
  var swapContent = function (swap, container, transition, complete) {
    var enter;
    var containerDirection;
    var swapDirection;

    if (!transition) {
      
      if (container) container.innerHTML = swap.innerHTML;
      else if (swap.classList.contains('content')) document.body.appendChild(swap);
      else document.body.insertBefore(swap, document.querySelector('.content'));
      complete && complete();

      return;
    }

    enter  = /in$/.test(transition);

    if (transition == 'fade') {
      container.classList.add('in');
      container.classList.add('fade');
      swap.classList.add('fade');
    }

    if (/slide/.test(transition)) {
      swap.classList.add(enter ? 'right' : 'left');
      swap.classList.add('slide');
      container.classList.add('slide');
    }

    //插入dom
    container.parentNode.insertBefore(swap, container);

    if (transition == 'fade') {
      container.offsetWidth; // force reflow
      container.classList.remove('in');
      container.addEventListener('webkitTransitionEnd', fadeContainerEnd);

      function fadeContainerEnd() {
        container.removeEventListener('webkitTransitionEnd', fadeContainerEnd);
        swap.classList.add('in');
        swap.addEventListener('webkitTransitionEnd', fadeSwapEnd);
      }
      function fadeSwapEnd () {
        swap.removeEventListener('webkitTransitionEnd', fadeSwapEnd);
        container.parentNode.removeChild(container);
        swap.classList.remove('fade');
        swap.classList.remove('in');
        complete && complete();
      }
    }

    if (/slide/.test(transition)) {
      container.offsetWidth; // force reflow
      swapDirection      = enter ? 'right' : 'left';
      containerDirection = enter ? 'left' : 'right';
      
      // 先添加监听器，否则在android上不起作用
      swap.addEventListener('webkitTransitionEnd', slideEnd);
      // container.addEventListener('webkitTransitionEnd', function(){
      //   container.parentNode.removeChild(container);
      // });
      container.classList.add(containerDirection);
      swap.classList.remove(swapDirection);

      function slideEnd() {
        swap.removeEventListener('webkitTransitionEnd', slideEnd);
        
        container.parentNode.removeChild(container);

        swap.classList.remove('slide');
        swap.classList.remove(swapDirection);

        container.offsetWidth; // force reflow

        complete && complete();
      }
    }
  };

  var triggerStateChange = function () {
    var e = new CustomEvent('push', {
      detail: { state: getCached(Push.id) },
      bubbles: true,
      cancelable: true
    });

    window.dispatchEvent(e);
  };

  var findTarget = function (target) {
    var i, toggles = document.querySelectorAll('a');
    for (; target && target !== document; target = target.parentNode) {
      for (i = toggles.length; i--;) { if (toggles[i] === target) return target; }
    }
  };

  var locationReplace = function (url) {
    console.log("location replace:" + url);
    window.history.replaceState(null, '', '#');//首先将hash清除，以便跳转后能回到正确页面
    window.location.replace(url);
  };

  var parseURL = function (url) {
    var a = document.createElement('a'); a.href = url; return a;
  };

  var extendWithDom = function (obj, fragment, dom) {
    var i;
    var result    = {};

    for (i in obj) result[i] = obj[i];

    Object.keys(bars).forEach(function (key) {
      var el = dom.querySelector(bars[key]);
      if (el) el.parentNode.removeChild(el);
      result[key] = el;
    });

    result.contents = dom.querySelector(fragment);

    return result;
  };


  // Attach PUSH event handlers
  // ==========================

  window.addEventListener('touchstart', function () { isScrolling = false; });
  window.addEventListener('touchmove', function () { isScrolling = true; });
  window.addEventListener('touchend', touchend);
  window.addEventListener('click', function (e) { if (getTarget(e)) e.preventDefault(); });
  window.addEventListener('popstate', popstate);

  var Push = function(options) {

    //获取主容器
    options.container = options.container || options.transition ? document.querySelector('.content') : document.body;
    
    //允许传入预设的bar元素，找出当前页面的bar元素，以便之后swap
    var key;
    for (key in bars) {
      options[key] = options[key] || document.querySelector(bars[key]);
    }

    var ajax = Push.ajax;

    if (ajax && ajax.readyState < 4) {
      ajax.abort();
    }

    if (!Push.id) {
      cacheDataAndReplaceState({
        id         : +new Date(),
        url        : window.location.href,
        page       : options.page,
        from       : options.from,
        title      : document.title,
        timeout    : options.timeout,
        transition : null
      });
    }

    ajax = $.ajax({
      type: 'GET',
      url: options.url,
      beforeSend: function(xhr, settings){
        if (!options.ignorePush) {cachePush();}
      },
      success: function(response_data, status, xhr){
        swapPage(response_data, options);
      },
      error: function(xhr, errorType, error){
        throw new Error('Could not get: ' + options.url);
      },
      complete: function(xhr, status){}
    });
  };

  var parseDomText = function (responseText, transition) {
    var head;
    var body;
    var data = {};

    if (!responseText) return data;

    if (/<html/i.test(responseText)) {
      //抽取head和body一段
      head           = document.createElement('div');
      body           = document.createElement('div');
      head.innerHTML = responseText.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0];
      body.innerHTML = responseText.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
    } else {
      //直接创建一个div包裹响应内容作为body，head为一个空的div
      head           = body = document.createElement('div');
      head.innerHTML = responseText;
    }

    data.title = head.querySelector('title');
    data.title = data.title && data.title.innerText.trim();

    if (transition) {
      //抽取页面元素/容器
      $.extend(data, extraElements(body));
    } else {
      //整个响应内容用div包裹后，作为主容器
      data.contents = body;
    }

    return data;
  };

  //抽取所有bar元素和主容器（.content）
  //dom: 被抽取的dom元素
  var extraElements = function(dom){
    var data = {};

    //抽取所有bar元素
    Object.keys(bars).forEach(function (key) {
      var el = dom.querySelector(bars[key]);
      if (el) el.parentNode.removeChild(el);
      data[key] = el;
    });
    //抽取替换主容器
    data.contents = dom.querySelector('.content');

    return data;
  };

  //根据目标页面文本（可能是ajax回来的，也可能是requirejs的text插件加载进来的）进行页面切换
  var swapPage = function(page_text, options){

    //解析结果
    var data = parseDomText(page_text, options.transition);
    data.url = options.url;

    //没有找到主容器，整页静态切换
    if (!data.contents) return locationReplace(options.url);

    //替换标题
    if (data.title) document.title = data.title;

    //替换bar元素
    if (options.transition) {
      var key;
      for (key in bars) {
        barElement = document.querySelector(bars[key]);
        if (data[key]) $(barElement).replaceWith(data[key]);//如果新页面有，则换成新的
        else if (barElement) barElement.parentNode.removeChild(barElement);//如果新页面没有，则去掉
      }
    }

    //替换主容器
    swapContent(data.contents, options.container, options.transition, function () {
      cacheDataAndReplaceState({
        id         : options.id || +new Date(),
        url        : data.url,
        title      : data.title,
        timeout    : options.timeout,
        transition : options.transition
      }, options.id);
      triggerStateChange();

      if (options.page) {
        require([options.page], function(Page){
          new Page().render();
        });
      }
      
    });
  };

});