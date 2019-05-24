<<<<<<< HEAD
FROM stardog-eps-docker.jfrog.io/stardog:6.1.3
=======
FROM stardog-eps-docker.jfrog.io/stardog:6.1.2
>>>>>>> master
ADD ./stardog-license-key.bin /var/opt/stardog/stardog-license-key.bin
ADD ./test/fixtures/ /var/opt/stardog/test/fixtures/
