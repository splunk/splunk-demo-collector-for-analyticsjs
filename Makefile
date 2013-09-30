# Starts collector server
server:
	node server.js &

# Kill collector server
kill:
	kill -9 `cat pid.txt`
	rm pid.txt
