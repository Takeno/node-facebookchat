var http = require("http")
	, https = require("https");


var utils = {};
module.exports = utils;


utils.parseUserId = function (s) {
	return s.replace('@chat.facebook.com', '').replace('-', '');
}

utils.buildUserId = function (id) {
	return ['-', id, '@chat.facebook.com'].join('');
}

utils.capitalize = function (s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Traverse ltx tree and find element */
utils.findElement = function (root, element) {
	if(root.is(element))
		return root;
	for(var i = 0; i < root.children.length; i++)
		if( el = findElement(root.children[i], element))
			return el;
	return null;
}


var fbNameCache = {};
utils.resolveFacebookName = function (userId, cb) {
	if(undefined === cb)
		cb = function () {};

	if(undefined === fbNameCache[userId]) {
		var options = {
		    host: 'graph.facebook.com',
		    port: 443,
		    path: '/' + userId,
		    method: 'GET',
		};

		getJSON(options, function (status, result) {
			fbNameCache[userId] = result.name;
		});
		return userId;
	} else
		return fbNameCache[userId];
}

utils.saveFacebookName = function (userId, name) {
	fbNameCache[userId] = name;
}


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON (options, onResult) {
    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });
    req.end();
};