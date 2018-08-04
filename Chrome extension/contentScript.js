$(function(){
	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

	var query =	$('.successMsg strong').text();
  var token = msg.token;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var parsed = JSON.parse(this.responseText);
			    let threadId = parsed.messages[0].id;


					var req = new XMLHttpRequest();
					xhttp.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							var parsed = JSON.parse(this.responseText);
							var msg = parsed.snippet;
							msg = msg.substr(msg.search("OTP is "), 13).split(" ");
							$("#lvc").val(msg[msg.length-1]);
							$('#twoStepCaptchaBtn').click();
						}
					}
					xhttp.open("GET", "https://www.googleapis.com/gmail/v1/users/me/messages/"+threadId+"?access_token="+token, true);
					xhttp.send();

		 }
	};
	xhttp.open("GET", "https://www.googleapis.com/gmail/v1/users/me/messages?access_token="+token+"&q="+query, true);
	xhttp.send();
  // if (msg.action == 'open_dialog_box') {
	//
	//
	// 	sendResponse({
  //       response: $('.Q8LRLc').text()
  //   });
  // }


});
});
