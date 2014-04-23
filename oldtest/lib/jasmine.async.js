// Jasmine.Async, v0.1.0
// Copyright (c)2013 Muted Solutions, LLC. All Rights Reserved.
// Distributed under MIT license
// http://github.com/derickbailey/jasmine.async

// NB:  this is a fork from https://github.com/johntimothybailey/jasmine.async
//      located at: https://github.com/schwarzmx/jasmine.async

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(root);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function() {
          return factory(root);
        });
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root);
  }
}(this, function (root) {

  var AsyncSpec = (function(global){

    // Private Methods
    // ---------------
    
    function runAsync(block, timeout){
      return function(){
        var done = false;
        var complete = function(){ done = true; };

        runs(function(){
          try{
            block.call(this,complete);
          } catch ( error ){
            complete();
            throw error;
          }
        });

        waitsFor(function(){
          return done;
        }, timeout);
      };
    }

    // Constructor Function
    // --------------------

    function AsyncSpec(spec, timeout){
      this.spec = spec;
      this.timeout = timeout ? timeout : 5000;
    }

    // Public API
    // ----------

    AsyncSpec.prototype.beforeEach = function(block){
      this.spec.beforeEach(runAsync(block, this.timeout));
    };

    AsyncSpec.prototype.afterEach = function(block){
      this.spec.afterEach(runAsync(block, this.timeout));
    };

    AsyncSpec.prototype.it = function(description, block){
      // For some reason, `it` is not attached to the current
      // test suite, so it has to be called from the global
      // context.
      global.it(description, runAsync(block, this.timeout));
    };

    return AsyncSpec;
  })(root);

  return AsyncSpec;
}));
