require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min',
    underscore: '../bower_components/underscore/underscore-min',
    jasmine: '../bower_components/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': '../bower_components/jasmine/lib/jasmine-core/jasmine-html',
    spec: 'spec',
    stardog : "../js/stardog",
    async: "lib/jasmine.async"
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


require(['underscore', 'jquery', 'jasmine-html', 'stardog', 'async'], function(_, $, jasmine){



  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var specs = [];

  specs.push('spec/createDB.spec');
  specs.push('spec/copyDB.spec');
  specs.push('spec/migrateDB.spec');
  specs.push('spec/dropDB.spec');

  specs.push('spec/assignPermissionToRole.spec');
  specs.push('spec/assignPermissionToUser.spec');
  specs.push('spec/changePwd.spec');
  specs.push('spec/deletePermissionFromRole.spec');
  specs.push('spec/deletePermissionFromUser.spec');
  specs.push('spec/deleteRole.spec');
  specs.push('spec/deleteUser.spec');
  specs.push('spec/explain.spec');
  specs.push('spec/getDB.spec');
  specs.push('spec/getDBOptions.spec');
  specs.push('spec/getDBSize.spec');
  specs.push('spec/getProperty.spec');
  specs.push('spec/isSuperUser.spec');
  specs.push('spec/isUserEnabled.spec');
  specs.push('spec/listDBs.spec');
  specs.push('spec/listRolePermissions.spec');
  specs.push('spec/listRoles.spec');
  specs.push('spec/listRoleUsers.spec');
  specs.push('spec/listUserEffPermissions.spec');
  specs.push('spec/listUserPermissions.spec');
  specs.push('spec/listUserRoles.spec');
  specs.push('spec/listUsers.spec');
  specs.push('spec/optimizeDB.spec');
  specs.push('spec/query.spec');
  specs.push('spec/queryGraph.spec');
  specs.push('spec/setDBOptions.spec');
  specs.push('spec/setUserRoles.spec');
  specs.push('spec/testSetEndpoint.spec');
  specs.push('spec/transactions.spec');
  specs.push('spec/userEnabled.spec');

  $(function(){
    require(specs, function() {
      jasmineEnv.execute();
    });
  });

});
