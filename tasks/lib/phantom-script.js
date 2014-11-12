
require('./polyfill/function.bind.js');
require('./bower_components/mocha/mocha.js');

var expect, should, asset, _files, page;

(function setup() {

  var chai = require('./bower_components/chai/chai.js');
  expect = chai.expect;
  should = chai.should;
  assert = chai.assert;

  var sprintf = require('./bower_components/sprintf/src/sprintf.js').sprintf;
  var system = require('system');
  var fs = require('fs');

  var params = JSON.parse(system.args[1]);
  _files = params.files;
  function formatMessage() {
    var msg = typeof arguments[0] === 'undefined' ? '': String(arguments[0]);
    args = Array.prototype.slice.call(arguments, 1);
    return sprintf.apply(sprintf, [msg].concat(args));
  }

  console.log = function () {
    system.stdout.writeLine(formatMessage.apply(null, arguments));
  };

  console.error = function () {
    system.stderr.writeLine(formatMessage.apply(null, arguments));
  };

  Mocha.process.stdout.write = function (msg, args) {
    system.stdout.write(formatMessage.apply(null, arguments));
  };

  mocha.setup({
    ui: 'bdd',
    reporter: 'spec'
  });

  page = require('webpage').create();

  phantom.injectJs('./page-helper.js');

}());

_files.forEach(function (file) {
  phantom.injectJs(file);
});

mocha.run(function () {
  setTimeout(function () { phantom.exit(0) }, 0);
  phantom.onError = function(){};
  throw new Error('');
});