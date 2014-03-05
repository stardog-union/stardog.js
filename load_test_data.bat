@echo off
echo Loading data for stardog.js tests

REM load main test data
call stardog-admin db drop -n nodeDB
call stardog-admin db create -n nodeDB --searchable data/api_tests.nt

REM load reasoning test data
call stardog-admin db drop -n nodeDBReasoning
call stardog-admin db create -n nodeDBReasoning --searchable data/reasoning/tbox.ttl data/reasoning/abox.ttl

