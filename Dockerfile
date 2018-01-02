FROM complexible-eps-docker.jfrog.io/stardog:5.1.0
ADD ./stardog-license-key.bin /var/opt/stardog/stardog-license-key.bin
ADD ./test/fixtures/ /var/opt/stardog/test/fixtures/
