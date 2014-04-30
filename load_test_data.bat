@echo off
echo Loading data for stardog.js tests

call stardog-admin db drop -n nodeDB
call stardog-admin db create -n nodeDB --searchable data/api_tests.nt

call stardog-admin db drop -n nodeDBReasoning
call stardog-admin db create -n nodeDBReasoning --searchable data/reasoning/tbox.ttl data/reasoning/abox.ttl
