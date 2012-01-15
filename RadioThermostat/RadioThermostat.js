var util = require("util"),
    cube = require("../../../"),
    dgram = require("dgram"),
    http = require("http"),
    options = require("./RadioThermostat-config"),
    count = 0,
    batch = 10,
    hour = 60 * 60 * 1000,
    start = Date.now();

// Connect to websocket.
util.log("starting websocket client");
var client = cube.emitter().open(options["http-host"], options["http-port"]);

// Discovery doesn't seem to work with the latest firmware...

/*
// Find tstat
var discover = dgram.createSocket("udp4");
discover.bind()
//discover.setMulticastTTL(3)

var msg = new Buffer("TYPE: WM-DISCOVER\r\nVERSION: 1.0\r\n\r\nservices: com.marvell.wm.system*\r\n\r\n");
discover.send(msg, 0, msg.length, 1900, "239.255.255.250", function(err, bytes) {
    if (err) throw err;
    util.log("Wrote " + bytes + " bytes");
});

discover.on("message", function(msg, rinfo) {
    util.log("message");
});

discover.on("listening", function() {
    util.log("listening");
});
*/

// options for tstat connect
var tstatOptions = {
    host: options['tstat-host'],
    port: options['tstat-port'],
    path: '/tstat'
};

var go = function() {
    http.get(tstatOptions, function(res) {
        res.on('data', function(chunk) {
            console.log("response: " + chunk);
            client.send({
                type: "tstat",
                time: new Date(),
                data: JSON.parse(chunk)
            });
        });
    });
};

var interval = setInterval(go, options['interval']);

// Display stats on shutdown.
process.on("SIGINT", function() {
  console.log("stopping websocket client");
  client.close();
  clearInterval(interval);
});

