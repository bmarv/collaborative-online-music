configure-and-sign-ssl-cert:
	./scripts/generate-and-sign-ssl-key.sh

delete-certs:
	rm -r certs/

clean:
	rm -r certs/ output/ node_modules/