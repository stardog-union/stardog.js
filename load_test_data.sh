# load main test data
stardog-admin db drop -n nodeDB
stardog-admin db create -n nodeDB --searchable data/api_tests.nt

# load reasoning test data
stardog-admin db drop -n nodeDBReasoning
stardog-admin db create -n nodeDBReasoning --searchable data/reasoning/tbox.ttl data/reasoning/abox.ttl
