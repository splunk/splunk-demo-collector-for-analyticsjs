## Backend Collector for Client-Side Data
This is a Node.js backend collector for client-side data that is tracked by [sp.js](#appendix-how-to-use-spjs-analytics-javascript-library) Analytics JavaScript library.
All tracked events are collected in events.log following [logging best practices](http://dev.splunk.com/view/logging-best-practices/SP-CAAADP6) for Splunk log ingestion.

Refer to [appendix](#appendix-how-to-use-spjs-analytics-javascript-library) below on how to use sp.js simple API for tracking.

### Getting Started
* Install with Node.js package manager [npm](http://npmjs.org/):

        $ npm install

* Configure your collector server HTTP/HTTPS ports and SSL certs by changing HTTP_PORT, HTTPS_PORT, and SSL_OPTS variables at the top of server.js file.
	
	This configuration step can be skipped for **test & dev purposes**. By default, the server binds to ports 3000 and 4443 for HTTP/HTTPS traffic. It also uses self-signed certificates for SSL under `.ssl/` directory, so we recommend you replace them with real certificates for a secure production solution.

* Start the collector server by typing:

		$ node server.js
		
	If you have configured server ports to standard ports 80 and 443, you'll need to `sudo node server.js` to start the server as root unless you have rights to bind to privileged ports < 1024
	
	You should see something similar to:

    	Listening to HTTP on port 3000
    	Listening to HTTPS on port 4443

That's it!
After pointing sp.js library to your collector server address using `sp.load(<YOUR_COLLECTOR_URL>)`, watch the tracked events being collected in newly created local file **events.log**

### Additional Resources

* <a href="http://blogs.splunk.com/2013/10/17/still-using-3rd-party-web-analytics-providers-build-your-own-using-splunk/" target="_blank">Still using 3rd party web analytics providers? Build your own using Splunk!</a>

## Appendix: How to use sp.js Analytics JavaScript Library
### Setup
To use sp.js, simply paste the following snippet of code before the closing `</head>` tag on your page:
```html
<script type="text/javascript">
    var sp=sp||[];(function(){var e=["init","identify","track","trackLink","pageview"],t=function(e){return function(){sp.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var n=0;n<e.length;n++)sp[e[n]]=t(e[n])})(),sp.load=function(e,o){sp._endpoint=e;if(o){sp.init(o)};var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src=("https:"===document.location.protocol?"https://":"http://")+"d21ey8j28ejz92.cloudfront.net/analytics/v1/sp.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)};
    sp.load("https://www.example.com"); // Replace with your own Collector URL
</script>
```
Make sure to replace `https://www.example.com` with your **own collector server URL** to send the data to.

### API
sp.js provides a common set of tracking methods similar to leading web analytics providers & exemplified by the clean API provided by [segment.io](https://segment.io/libraries/analytics.js/).

Here’s the list of tracking methods provided by sp.js:

* [sp.track(event, properties, fn)](#sptrackevent-properties-fn)
* [sp.trackLink(links, event, properties)](#sptracklinklinks-event-properties)
* [sp.pageview(url)](#sppageviewurl)
* [sp.identify(userId, userTraits)](#spidentifyuserid-usertraits)

Full Definition:

#### sp.track(event, properties, fn)
Track a custom event (i.e. user action) along with a set of associated event properties.
```js
sp.track('Preview Movie', {
	title: 'World War Z',
	category: 'Action',
	loggedIn: false
});
```
Parameters:
* `event`: name string of the event to track
* `properties` (optional): properties object of key-value pairs associated with the event
* `fn` (optional): callback function to be called after short timeout

#### sp.trackLink(links, event, properties)
Track link clicks, including outbound links, with a custom event and custom properties. Tracking occurs before page changes. This automatically records properties such as the anchor (a) tag's href and text.
```js
sp.trackLink($('a.free-download'), 'Click Free Download Link', {
	linkColor: 'Green'
});
```
Parameters:
* `links`: link DOM or jQuery element to track clicks on. This can also be an array of such elements.
* `event`: name string of the event to track. This can also be a function which returns event string name using the clicked link element as argument.
* `properties` (optional): properties object of key-value pairs associated with the event. This can also be a function which returns properties object using the clicked link element as argument.

#### sp.pageview(url)
Tracks a 'pageview' event including document title and referrer. This is automatically called by default.
```js
sp.pageview();
```
Parameters:
* `url` (optional): url string. Defaults to page url.

#### sp.identify(userId, userTraits)
Associate a user with an ID, and record user-specific traits or persistent properties. These persistent properties will be automatically added as properties to any subsequent tracked event.
```js
sp.identify("power-user-3961", {
	email: "abc@example.com",
	age: 30,
	gender: "male"
});
```
Parameters:
* `userId` (optional): unique ID string to associate with the user. sp.js automatically assigns a universally unique id to each visitor, so you can skip this.
* `userTraits` (optional): properties object of key-value pairs associated with the user. userTraits are automatically included with all events by this user.

#### sp.init(settings)
**Advanced Usage**: method to configure library parameters. Typically `sp.load(<YOUR_COLLECTOR_URL>)` is all you need, and it's already called in the JavaScript snippet that you included in your page header. See [Setup](#setup) section above.
```js
sp.init({
	api_host: <YOUR_COLLECTOR_URL>	// typically set via sp.load(YOUR_COLLECTOR_URL)
	tracking_pageview: true,		// default to tracking all page views
	track_links_timeout: 300,		// default to 300ms
	cookie_name: "_sp",				// defaults to "_sp"
	cookie_expiration: 365,			// defaults to 365 days
	cookie_domain: "example.com"	// defaults to your website domain
});
```
Parameters:
* `settings`: settings object to apply one more custom configurations to sp.js. For most purposes, default values are applicable.


