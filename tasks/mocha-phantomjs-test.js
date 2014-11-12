var phantomjs = require('phantomjs');
var child_process = require('child_process');

module.exports = function (grunt) {


  grunt.registerMultiTask('mochaPhantomJsTest', 'Run mocha tests in phantomJS environment', function () {
    var done = this.async();
    var options = this.options();
    var files = this.filesSrc;

    if (files.length === 0) {
      grunt.log.write('No files to check...');
      grunt.log.ok();
      done(true);
      return;
    }

    var args = [];

    var params = {
      files: files,
      options: options,
      cwd: process.cwd()
    };

    if (options.environmentScript) {
      var environmentScript = require(options.environmentScript);
      environmentScript.startup && environmentScript.startup();
    }

    args.push('--web-security=false');
    args.push(__dirname + '/lib/phantom-script.js');
    args.push(JSON.stringify(params));

    var child = child_process.execFile(phantomjs.path, args, function (err) {

      if (options.environmentScript) {
        environmentScript.teardown && environmentScript.teardown();
      }

      if (err) {
        grunt.log.errorlns(err.message);
        done(false);
      } else {
        done(true);
      }
    });

    child.stdout.on('data', function (chunk) {
      grunt.log.write(chunk);
    });

    child.stderr.on('data', function (chunk) {
      grunt.log.write(chunk);
    });

  });

};