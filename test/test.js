var should = require('should');
var hlf = require('../');

var Transform = require('stream').Transform;

describe('heroku log filter', function() {
  it('should be an export', function(done) {
    hlf.should.be.an.Object;
    hlf.should.be.an.instanceOf(Transform);
    done();
  });
});


// TODO: add some actual tests
