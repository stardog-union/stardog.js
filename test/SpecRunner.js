require.config({
  // baseUrl: "../../js/",
  // urlArgs: 'cb=' + Math.random(),
  paths: {
    jquery: 'lib/jquery-1.10.1.min',
    underscore: '../node_modules/underscore/underscore-min',
    jasmine: 'lib/jasmine',
    'jasmine-html': 'lib/jasmine-html',
    spec: 'spec/',
    stardog : "../js/stardog",
  },
  shim: {
    underscore: {
      exports: "_"
    },
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    }
  }
});


require(['underscore', 'jquery', 'jasmine-html', 'stardog'], function(_, $, jasmine){

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var specs = [];

  specs.push('spec/getDBSize.spec');

  $(function(){
    require(specs, function(){
      jasmineEnv.execute();
    });
  });

});