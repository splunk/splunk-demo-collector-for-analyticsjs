var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var app = express();

var HTTP_PORT = 3000,
    HTTPS_PORT = 443,
    SSL_OPTS = {
      key: fs.readFileSync(path.resolve(__dirname,'.ssl/www.example.com.key')),
	  cert: fs.readFileSync(path.resolve(__dirname,'.ssl/www.example.com.cert'))
    };

/*
 *  Define Middleware & Utilties
 **********************************
 */
var allowCrossDomain = function(req, res, next) {
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Credentials', true);
  // send extra CORS headers when needed
  if ( req.headers['access-control-request-method'] ||
    req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Max-Age', 1728000);  // 20 days
    // intercept OPTIONS method
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
  }
  else {
      next();
  }
};

// trim string value and enclose it with double quotes if needed
var parseValue = function(value) {
  if (typeof value === "string") {
    // trim
    value = value.replace(/^\s+|\s+$/g, '');
    if (value == "") {
      value = '""';
    } else if (value.split(' ').length > 1) {
      // enclose with "" if needed
      value = '"' + value + '"';
    }
  }
  return value;
}

// decode and parse query param param
var parseDataQuery = function(req, debug) {
  if (!req.query.data) {
    if (debug) { console.error('No \'data\' query param defined!') };
    return false;
  }
  var data = {};
  try {
    data = JSON.parse(decodeURIComponent(req.query.data));
  } catch (e) {
    if (debug) { console.error('Failed to JSON parse \'data\' query param') };
    return false;
  }
  return data;
}

// create single event based on data which includes time, event & properties
var createAndLogEvent = function(data, req) {
  var time = (data && data.t) || new Date().toISOString(),
      event = (data && data.e) || "unknown",
      properties = (data && data.kv) || {};

  // append some request headers (ip, referrer, user-agent) to list of properties
  properties.ip = req.ip;
  properties.origin = (req.get("Origin")) ? req.get("Origin").replace(/^https?:\/\//, '') : "";
  properties.page = req.get("Referer");
  properties.useragent = req.get("User-Agent");

  // log event data in splunk friendly timestamp + key/value(s) format
  var entry = time + " event=" + parseValue(event);
  for (var key in properties) {
    var value = parseValue(properties[key]);
    entry += " " + key + "=" + value;
  }
  entry += "\n";
  fs.appendFile(path.resolve(__dirname, './events.log'), entry, function(err) {
    if (err) {
      console.log(err);
    } else {
      //console.log("Logged tracked data");
    }
  });
}

/*
 * Use Middlewares
 **********************************
 */
app.use(express.logger());
//app.use(express.compress());
app.use(allowCrossDomain);
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

/*
 *  Create Tracking Endpoints
 **********************************
 */

// API endpoint tracking
app.get('/track', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var data;
  // data query param required here
  if ((data = parseDataQuery(req, true)) === false) {
    res.send('0');
  }
  createAndLogEvent(data, req);
  res.send('1');
});

// IMG beacon tracking - data query optional
app.get('/t.gif', function(req, res) {
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'private, no-cache, no-cache=Set-Cookie, proxy-revalidate');
  res.setHeader('Expires', 'Sat, 01 Jan 2000 12:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  // data query param optional here
  var data = parseDataQuery(req) || {};
  // fill in default success event if none specified
  if (!data.e) { data.e = "success";}
  createAndLogEvent(data, req);
  res.sendfile(path.resolve(__dirname, './t.gif'));
});

// root
app.get('/', function(req, res) {
  res.send("");
});

var pidFile = path.resolve(__dirname, './pid.txt');
fs.writeFileSync(pidFile, process.pid, 'utf-8'); 

// Create an HTTP service.
http.createServer(app).listen(HTTP_PORT,function() {
  console.log('Listening on port ' + HTTP_PORT);
});

// Create an HTTPS service identical to the HTTP service.
https.createServer(SSL_OPTS, app).listen(HTTPS_PORT,function() {
  console.log('Listening on port ' + HTTPS_PORT);
});
