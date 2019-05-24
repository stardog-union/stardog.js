FROM stardog-eps-docker.jfrog.io/stardog:6.2.3
ADD ./stardog-license-key.bin /var/opt/stardog/stardog-license-key.bin
ADD ./test/fixtures/ /var/opt/stardog/test/fixtures/
