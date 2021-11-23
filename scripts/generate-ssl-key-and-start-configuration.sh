#!/bin/sh
echo "Creating Directory <certs> and Generating an SSL-key"
mkdir certs
openssl genrsa -out certs/key.pem
openssl req -new -key certs/key.pem -out certs/csr.pem