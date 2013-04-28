var FacebookChat = require('../');

var fbchat = new FacebookChat({
	userId: '123456789',
	appId: '123456789',
	accessToken: 'abcdefghimnopqrstuvz1234567890'
});

fbchat.addListener('connected', function() {
	console.log('Connected!');


  fbchat.getFriends(function (result) {
  	console.log('Friends loaded - callback !');
  });

  fbchat.whoAmI(function (result) {
  	console.log('Who am i?');
  	console.log(result.name);
  });

	/*
		console.log("sending");
		fbchat.sendMessage(123456, 'Hi friend!');
	*/
});

fbchat.addListener('authenticationError', function(e) {
	console.log('Auth error: ' + e);
});


fbchat.addListener('presence:online', function (result) {
	console.log('New user online', fbchat.utils.resolveFacebookName(result.user));
});

fbchat.addListener('presence:offline', function (result) {
	console.log('New user offline', fbchat.utils.resolveFacebookName(result.user));
});

fbchat.addListener('status:composing', function (result) {
	console.log(fbchat.utils.resolveFacebookName(result.user) + ' is composing');
});

fbchat.addListener('message:received', function (result) {
	console.log(fbchat.utils.resolveFacebookName(result.user) + ' -> Me: ', result.message);
});

fbchat.addListener('message:sent', function (result) {
	console.log('Me -> ' +fbchat.utils.resolveFacebookName(result.user)+': ', result.message);
});

fbchat.addListener('list:friends', function (result) {
	console.log('Friends loaded - event');
});

fbchat.addListener('vCard:result', function (result) {
	require("fs").writeFile(__dirname+'/images/'+result.user + ".jpeg", result.photoData, 'base64', function(err) {
		console.log(err);
	});
});

//fbchat.close();