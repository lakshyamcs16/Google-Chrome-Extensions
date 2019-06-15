$(function(){

	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

		debugger;
		if(msg.status === 'getRequestId') {
			var query =	$('.successMsg strong').text();	
			if($('#dynamic').length < 1) {
				var img = $('<img id="dynamic">');
				img.attr('src',"chrome-extension://ndaljnegfcankkfmdagejkeoldkcajpk/images/loader16.gif");
				img.attr('width','16');
				img.attr('height','16');
				img.appendTo('.btn.green.pull-right.span4');
			}
			chrome.runtime.sendMessage({query: query});
		}else{		
			$("#lvc").val(msg.otp);
			let img = $('#dynamic');						
			img.hide();
			if($('#PersistentCookie:checked').length == 0){
				$('#PersistentCookie').prop('checked',true);
			}
			
			$('.btn.green.pull-right.span4').click();
		}
	});
});
