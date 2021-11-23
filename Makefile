configure-ssl-cert:
	./scripts/generate-ssl-key-and-start-configuration.sh

sign-ssl-cert:
	./scripts/sign-ssl-certificate-and-remove-configuration.sh

delete-certs:
	rm -r certs/

clean:
	rm -r certs/ output/ node_modules/