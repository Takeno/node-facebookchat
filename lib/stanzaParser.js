var utils = require('./utils');

function stanzaParser (stanza) {
	this._stanza = stanza;
	this.result = {
		id: null,
		type: null,
		response: this._stanza.toString()
	};
	this._parse();
}

module.exports = exports = stanzaParser;

stanzaParser.prototype._parse = function () {
	var rootName = this._stanza.getName()
		, methodName = 'parse' + utils.capitalize(rootName);

	if('function' === typeof this[methodName])
		this[methodName]();
}

stanzaParser.prototype.parsePresence = function () {
	this.result = {
		id: this._stanza.attrs.id ? this._stanza.attrs.id : null,
		type: 'presence',
		event: 'unavailable' === this._stanza.attrs.type ? 'offline' : 'online',
		user: utils.parseUserId(this._stanza.attrs.from)
	};
}

stanzaParser.prototype.parseMessage = function () {
	if('chat' !== this._stanza.attrs.type)
		return;

	if(this._stanza.getChild('composing'))
		this.result = {
			type: 'status',
			event: 'composing',
			user: utils.parseUserId(this._stanza.attrs.from)
		}
	else if(this._stanza.getChild('active') && (body = this._stanza.getChild('body')))
		this.result = {
			type: 'message',
			event: 'received',
			user: utils.parseUserId(this._stanza.attrs.from),
			message: body.getText()
		};
}

stanzaParser.prototype.parseIq = function () {
	if(undefined !== this._stanza.attrs.id && 0 === this._stanza.attrs.id.indexOf('fbiq') && (child = this._stanza.getChild('own-message'))) {
		this.result = {
			type: 'message',
			event: 'sent',
			user: utils.parseUserId(child.attrs.to),
			message: child.getChild('body').getText()
		};
	} else if(this._stanza.getChild('query', 'jabber:iq:roster')) {
		this._parseFriendList();
	} else if("result" === this._stanza.attrs.type && (child = this._stanza.getChild('vCard'))) {
		this.result = {
			id: this._stanza.attrs.id ? this._stanza.attrs.id : null,
			type: 'vCard',
			event: 'result',
			user: utils.parseUserId(this._stanza.attrs.from),
			name: child.getChild('FN').getText(),
			photoType: child.getChild('PHOTO').getChild('TYPE').getText(),
			photoData: child.getChild('PHOTO').getChild('BINVAL').getText()
		}
	}
}


stanzaParser.prototype._parseFriendList = function () {
	var items = this._stanza.getChild('query', 'jabber:iq:roster').getChildren('item');
	var users = {};


	for(var i in items) {
		users[utils.parseUserId(items[i].attrs.jid)] = items[i].attrs.name
		utils.saveFacebookName(utils.parseUserId(items[i].attrs.jid), items[i].attrs.name);
	}

	this.result = {
		id: this._stanza.attrs.id ? this._stanza.attrs.id : null,
		type: 'list',
		event: 'friends',
		friends: users
	};

}