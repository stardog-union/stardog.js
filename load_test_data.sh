# load main test data
stardog-admin drop -n nodeDB
stardog-admin create -n nodeDB -e data/api_tests.nt

# load reasoning test data
stardog-admin drop -n nodeDBReasoning
stardog-admin create -n nodeDBReasoning -e data/reasoning/tbox.ttl data/reasoning/abox.ttl