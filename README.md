## Backend Collector for Client-Side Data
This is a simple Node.js backend collector for client-side data that is tracked by sp.js javascript analytics tag

## Get Started
* Install the current project:

    ```
    npm install
    ```
* Edit top section of server.js to configure your HTTP/HTTPS ports and SSL key/cert:

    ```
    vim server.js
    # set HTTP_PORT, HTTPS_PORT, SSL_OPTS
    # to quickly get up and running for dev purposes, you can use http server only by
    # commenting out SSL_OPTS and the final https.createServer() call
    ```
* Start the collector server:

    ```
    make server
    ```
You should see something similar to:

    ```
    Listening on port 3000
    Listening on port 443
    ```
* Kill collector server:

    ```
    make kill
    ```

That's it!
After pointing sp.js library to your collector server address using sp.load(<SERVER ADDRESS>), watch the tracked events being collected in events.log

