var Emitter = require('events').EventEmitter
  , xmpp = require('node-xmpp')
  , stanzaParser = require('./stanzaParser')
  , utils = require('./utils');


module.exports = exports = FacebookChat;

function FacebookChat (settings) {
	var self = this;
	Emitter.call(this);

	this.client = null;
	this.connected = false;

	if(!settings.appId)
		throw new Exception('appId missed');
	if(!settings.accessToken)
		throw new Exception('accessToken missed');
	if(!settings.userId)
		throw new Exception('userId missed');

	this.settings = settings;

	self.connect();

	process.on('SIGINT', function() {
		self.close();
	});
};

FacebookChat.prototype.__proto__ = Emitter.prototype;

FacebookChat.prototype.utils = utils;

FacebookChat.prototype.connect = function() {
	var self = this;
	
	var client = new xmpp.Client({
		jid: utils.buildUserId(this.settings.userID),
		api_key: this.settings.appId,
		access_token: this.settings.accessToken,
		host: 'chat.facebook.com'
	});

	client.addListener('online', function () {
		self.connected = true;
		self.emit('connected');
	});
	this.client = client;

	this._bindError();
	this._bindStanza();
};

FacebookChat.prototype._bindError = function () {
	var self = this;

	function onError (error) {
		if(error == 'XMPP authentication failure'){
			self.emit('authenticationError', error);
		}
		else
			console.log(error);
	}

	this.client.addListener('error', onError);
};

FacebookChat.prototype.close = function () {
	this.client.end();
};


FacebookChat.prototype._bindStanza = function () {
	var self = this;
	
	this.client.addListener('stanza', function(stanza) {
		var stanzaParsed = new stanzaParser(stanza);
		if(null !== stanzaParsed.result.type) {
			var events = [stanzaParsed.result.type + ':' + stanzaParsed.result.event];
			if(null !== stanzaParsed.result.id)
				events.push('id:'+stanzaParsed.result.id);

			events.forEach(function(event) {
				self.emit(event, stanzaParsed.result);
			});

		} else {
			console.log('non parsato');
			console.log(stanzaParsed);
		}
	});
}

FacebookChat.prototype.sendMessage = function (targetId, message) {
	var el = new xmpp.Element('message',{
			to: utils.buildUserId(targetId),
			type:'chat'
		})
		.c('body')
		.t(message);
	this.client.send(el);
}

FacebookChat.prototype.getFriends = function (cb) {
	var id = 'getFriends' + Math.floor(Math.random()*9999);
	cb = cb || function () {};

	var el = new xmpp.Element('iq', {
			type: 'get',
			id: id,
			from: utils.buildUserId(1519737027)
		}).c('query', { xmlns: 'jabber:iq:roster' }).up();

	this.once('id:'+id, cb);
	this.client.send(el);
}

FacebookChat.prototype.whoAmI = function (cb) {
	this.whoIs(null, cb);
}

FacebookChat.prototype.whoIs = function (userId, cb) {
	var id = 'whoIs'+ Math.floor(Math.random()*9999);
	cb = cb || function () {};

	var iqAttrs = {
		id: id,
		type: 'get'
	};

	if(userId)
		iqAttrs.to = utils.buildUserId(userId);

	var el = new xmpp.Element('iq', iqAttrs).c('vcard', { xmlns: 'vcard-temp' }).up();

	this.once('id:'+id, cb);
	this.client.send(el);
}

FacebookChat.prototype.test = function (targetId) {

}