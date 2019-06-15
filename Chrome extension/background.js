const LABELS = "https://www.googleapis.com//gmail/v1/users/me/labels";

//oauth2 auth
var tok;
chrome.identity.getAuthToken(
	{'interactive': true},
	function(token){
	  //load Google's javascript client libraries
		tok = token;
		loadScript('https://apis.google.com/js/client.js', token);
		window.gapi_onload = authorize;
		console.log(token);
	}
);

function loadScript(url, token){
  var request = new XMLHttpRequest();

	request.onreadystatechange = function(){
		if(request.readyState !== 4) {
			return;
		}

		if(request.status !== 200){
			return;
		}

		console.log(request.responseText);
   		eval(request.responseText);
	};

	//console.log(token);
	request.open('GET', url);
	request.setRequestHeader('Authorization', 'Bearer ' + token);
	request.onload = requestComplete;
	request.send();
}


function requestComplete() {
	if (this.status == 401 && retry) {
		retry = false;
		chrome.identity.removeCachedAuthToken({ token: access_token },getToken);
	}
}


function authorize(){
  gapi.auth.authorize(
		{
			client_id: '688351606222-188aavbalb1q0q5c97fccjm2ip09lc63.apps.googleusercontent.com',
			immediate: true,
			scope: 'https://www.googleapis.com/auth/gmail.readonly',
			access_token: tok
		},
		function(){
		  gapi.client.load('gmail', 'v1', gmailAPILoaded);
		}
	);
}

function gmailAPILoaded(){
        console.log("LOADED");
		loadDoc();
	}

	function loadDoc() {
		var otp = '';
		chrome.browserAction.onClicked.addListener(function(tab) { 
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				chrome.tabs.sendMessage(tabs[0].id, {token: tok, status: 'getRequestId'}, function(response) {
					
				});
			});
		});

		chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						console.log(this.responseText);
						var parsed = JSON.parse(this.responseText);
						let threadId = parsed.messages[0].id;


								var req = new XMLHttpRequest();
								req.onreadystatechange = function() {
								if (this.readyState == 4 && this.status == 200) {
									var parsed = JSON.parse(this.responseText);
									var msg = parsed.snippet;
									msg = msg.substr(msg.search("OTP is "), 13).split(" ");
									if(msg.length == 3){
										otp = msg[msg.length-1];
									}else{
										otp = msg[msg.length-2];
									}

									chrome.tabs.query({active: true}, function(tabs){ 
										chrome.tabs.sendMessage(tabs[0].id, {otp: otp}, function(response) { 

										}); 
									});
								}
							}
							req.open("GET", "https://www.googleapis.com/gmail/v1/users/me/messages/"+threadId+"?access_token="+tok, true);
							req.send();

					}
				}
				xhttp.open("GET", "https://www.googleapis.com/gmail/v1/users/me/messages?access_token="+tok+"&q="+request.query, true);
				xhttp.send();
			}
		);

	}
