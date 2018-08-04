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

		//console.log(request.responseText);
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
		chrome.identity.removeCachedAuthToken({ token: access_token },
																					getToken);
	}
}


function authorize(){
//  gapi.auth.setToken({access_token:tok})
	//console.log(tok);
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

	function loadDoc(url, token) {
	 		       chrome.extension.onConnect.addListener(function(port) {
			       console.log("Connected .....");
			       port.onMessage.addListener(function(msgfrompop) {
			                console.log("message recieved" + msgfrompop);
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
						chrome.tabs.sendMessage(tabs[0].id, {token: tok}, function(response) {
						});
					});
							
			       });
			  })
	 
	}
