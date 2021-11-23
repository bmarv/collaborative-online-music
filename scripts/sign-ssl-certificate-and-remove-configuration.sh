echo "Self-Signing SSL-Certificate and Removing SSL-Configuration-File"
openssl x509 -req -days 9999 -in certs/csr.pem -signkey certs/key.pem -out certs/cert.pem
rm certs/csr.pem