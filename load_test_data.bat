@echo off
echo Loading data for stardog.js tests

REM load main test data
call stardog-admin db drop -n nodeDB
call stardog-admin db create -n nodeDB -o search.enabled=true data/api_tests.nt

REM load reasoning test data
call stardog-admin db drop -n nodeDBReasoning
call stardog-admin db create -n nodeDBReasoning data/reasoning/tbox.ttl data/reasoning/abox.ttl

REM load reasoning test data
call stardog-admin db drop -n ng
call stardog-admin db create -n ng data/ng_tests.trig
