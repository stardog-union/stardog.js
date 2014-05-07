"use strict";

var spawn = require("win-spawn"),
    loadData, runTests,
    bat_script = "load_test_data.bat",
    shell_script = "./load_test_data.sh",
    win_run_test = "node node_modules/mocha/bin/mocha",
    unix_run_test = "node_modules/mocha/bin/mocha";

if (process.platform === "win32" && process.env.SHELL === undefined) {
    loadData = spawn(bat_script, [], { stdio: "inherit" });
    loadData.on("exit", function (code) {
        if (code !== 0) {
            process.stdout.write("There was an error loading the test data.\n");
        } else {
            runTests = spawn(win_run_test, ["--reporter", "spec", "test/*.spec.js"], { stdio: "inherit" });
        }
    });
} else {
    loadData = spawn(shell_script, [], { stdio: "inherit" });

    loadData.on("exit", function (code) {
        if (code !== 0) {
            process.stdout.write("There was an error loading the test data.\n");
        } else {
            runTests = spawn(unix_run_test, ["--reporter", "spec", "test/*.spec.js"], { stdio: "inherit" });
        }
    });
}
