(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.$);
    }
}(this, function ($) {
    var Async = function() {
      var isDone = false,
          hasToWait = false,
          ajaxDone = function() {
            if (hasToWait) {
              isDone = true;
            }
          },
          checkDone = function() {
            if (hasToWait && isDone) {
              isDone = false;
              return true;
            } else if (!hasToWait){
              return true;
            } else {
              return false;
            }
          };

      if (typeof $ !== 'undefined') {
        hasToWait = true;
        $(document).ajaxComplete(ajaxDone);
      }

      return { done: checkDone };
    }

    return Async;
}));