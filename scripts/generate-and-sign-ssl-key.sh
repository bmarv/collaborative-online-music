#!/bin/sh
echo "Creating Directory <certs> and Generating an SSL-key"
rm -r certs
mkdir certs
openssl req -nodes -newkey rsa:2048 -keyout certs/ssl.key -out certs/ssl.csr -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"
openssl x509 -req -days 9999 -in certs/ssl.csr -signkey certs/ssl.key -out certs/cert.pem