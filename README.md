# Backend Collector for Client-Side Data
This is a simple Node.js backend collector for client-side data tracked by sp.js javascript analytics tag

# Get Started
* Install the current project
	npm install
* Edit top section of server.js to configure your HTTP/HTTPS ports and SSL key/cert
	vim server.js
	# set HTTP_PORT, HTTPS_PORT, SSL_OPTS
	# to quickly get up and running for dev purposes, you can comment out SSL_OPTS and final https.createServer() call to use http server only.
* Start the collector server
	make server
* Kill collector server
	make kill

That's it!
After pointing sp.load() to your server address, watch the tracked events being collected in events.log

