var exec = require('child_process').exec,
    child;
var os = require('os');
var shell;
var cmd;
var bash_script = 'load_test_data.bat';
var shell_spript = 'sh load_test_data.sh';
var win_run_test = 'node node_modules/jasmine-node/bin/jasmine-node test/spec';
var unix_test = 'node_modules/jasmine-node/bin/jasmine-node test/spec';



if (os.platform() === 'win32' && process.env.SHELL === undefined) { 
  shell = process.env.COMSPEC || 'cmd.exe';

  cmd = '"' + shell + '"' + bash_script;
    child = exec(bash_script,
		  function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	});

	child = exec(win_run_test,
		  function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	});

} else {
	child = exec(shell_spript,
		  function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	});

    child = exec(unix_test,
		  function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	});

}
