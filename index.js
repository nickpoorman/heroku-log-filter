var argv = require('optimist')
  .usage('Print out the heroku logs with colors.\nUsage: $0')
  .alias('e', 'exclude')
  .describe('e', 'The regex to filter out lines.')
  .argv;

var colors = require('colors');
colors.mode = 'console';

var util = require('util');
var Transform = require('stream').Transform;
var keyRegex = /^\d{4}-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-6]\d\.\d{3,6}\+\d\d:\d\d\s\w+\[(.+)\]:\s?.+$/;
var headerRegex = /^(\d{4}-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-6]\d\.\d{3,6}\+\d\d:\d\d\s\w+\[.+\]:\s).+$/;
var bodyRegex = /^\d{4}-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-6]\d\.\d{3,6}\+\d\d:\d\d\s\w+\[.+\]:\s?(.*)$/i;

util.inherits(HerokuLogFilter, Transform);

var colorList = [
  'cyan',
  'yellow',
  'magenta',
  'blue',
  // 'green',
  'red'
];
var colorListLength = colorList.length;

function HerokuLogFilter(opts) {
  if (!(this instanceof HerokuLogFilter)) return new HerokuLogFilter(opts);
  if (!this.opts) this.opts = {};
  Transform.call(this);

  this.colors = {};
  this.numColors = 0;
  if (argv.e) {
    this.excludeRegex = new RegExp(argv.e);
  }

  return this;
}

/**
 * Boolean to see if the message should be excluded
 */
HerokuLogFilter.prototype.exclude = function(msg) {
  if (typeof this.excludeRegex === 'undefined' || !this.excludeRegex) {
    return false;
  }
  return this.excludeRegex.test(msg);
}

/**
 * Given a key return the color to log the message with
 */
HerokuLogFilter.prototype.colorLog = function(msg, index, array) {
  var r = keyRegex.exec(msg);
  if (typeof r === 'undefined' || !r || typeof r.length === 'undefined' || r.length < 2) {
    if (!msg) {
      return;
    }
    return this.out(msg);
  }
  var key = r[1];
  var color = this.colors[key];
  if (!color) {
    color = colorList[(this.numColors++ % colorListLength)];
    this.colors[key] = color;
  }
  var header = headerRegex.exec(msg);
  if (typeof header === 'undefined' || !header || typeof header.length === 'undefined' || header.length < 2) {
    return this.out(msg);
  }

  var body = bodyRegex.exec(msg)[1];
  if (typeof body === 'undefined' || !body || typeof body.length === 'undefined' || body.length < 2) {
    return this.out(msg);
  }
  return this.out(msg.replace(headerRegex, header[1][color]) + body);
}

HerokuLogFilter.prototype._transform = function(chunk, encoding, done) {
  var lines = chunk.toString().split('\n');
  lines.forEach(this.colorLog, this);
  return done();
}

HerokuLogFilter.prototype.out = function(msg) {
  if(this.exclude(msg)){
    return;
  }
  return this.push(msg + '\n');
}

var hlf = new HerokuLogFilter();

process.stdin.pipe(hlf).pipe(process.stdout);

module.exports = hlf;
