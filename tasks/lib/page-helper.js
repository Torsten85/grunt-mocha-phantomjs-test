page.failedResources = [];
page.onResourceError = function(resourceError) {
  page.failedResources.push(resourceError.url);
};

page.viewportSize = {
  width: 2560,
  height: 1440
};

var pageOpen = page.open;
page.open = function (url, callback) {

  var wrappedCallback = function () {
    page.injectJs('./polyfill/function.bind.js');
    return callback.apply(this, arguments);
  };

  return pageOpen.call(page, url, wrappedCallback);
};

var jQuerySymbol = 'jQuery';
page.loadJquery = function (symbol, done) {

  if (typeof symbol === 'function') {
    done = symbol;
    symbol = '$$';
  }

  jQuerySymbol = symbol;

  setTimeout(function () {
    page.includeJs('http://code.jquery.com/jquery-2.1.1.min.js', function () {
      page.evaluate(function (symbol) {
        window[symbol] = $.noConflict(true);
      }, symbol);
      setTimeout(done, 100);
    });
  }, 100);

};


page.sendMouseEvent = function (eventName, selector) {
  if (typeof selector === 'object' && selector.selector)
    selector = selector.selector;

  var position;

  if (!selector) {
    position = { left: 0, top: 0};
  } else if (typeof selector === 'number') {
    position = { left: arguments[0], top: arguments[1] || 0};
  } else {
    position = page.evaluate(function (jQuerySymbol, selector) {
      return window[jQuerySymbol](selector).offset();
    }, jQuerySymbol, selector);

    expect(position).to.have.keys(['left', 'top']);
  }

  page.sendEvent(eventName, position.left, position.top);
};

page.click = function (selector) {
  return page.sendMouseEvent('click', selector);
};

page.key = page.event.key;
page.type = function (str, modifier) {
  page.sendEvent('keypress', str, null, null, modifier);
};

page.fill = function (selector, str, modifier) {
  page.click(selector);
  page.type(str, modifier);
};

page.select = function (selector) {

  var evaluate = function (method, value) {
    return page.evaluate(function (symbol, selector, method, value) {

      var _$ = window[symbol];
      var selectorMatch = selector.match(/(.*)(?:$| )iframe(?:^| )(.*)/);
      var $target = selectorMatch === null ? _$(selector) : _$(selectorMatch[1] + ' iframe').contents().find(selectorMatch[2]);

      if (typeof value !== 'undefined')
        return $target[method](value);
      return $target[method]();
    }, jQuerySymbol, selector, method, value);
  };

  return {

    selector: selector,

    select: function (selector) {
      return page.select(this.selector + ' ' + selector);
    },

    property: function (prop) {
      return evaluate('prop', prop);
    },
    attribute: function (attr) {
      return evaluate('attr', attr);
    },
    is: function (is) {
      return evaluate('is', is);
    },
    count: function () {
      return evaluate('size');
    },
    text: function () {
      return evaluate('text');
    },
    value: function () {
      return evaluate('val');
    },
    html: function () {
      return evaluate('html');
    },
    hasClass: function (classname) {
      return evaluate('hasClass', classname);
    },
    trigger: function (eventType) {
      return evaluate('trigger', eventType);
    }
  }
};