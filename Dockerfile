FROM stardog/stardog
ADD ./stardog-license-key.bin /var/opt/stardog/stardog-license-key.bin
ADD ./test/fixtures/ /var/opt/stardog/test/fixtures/
ADD ./.circleci/jwt.yaml /var/opt/stardog/jwt.yaml
ADD ./.circleci/token.properties /var/opt/stardog/stardog.properties
