function getLocalIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({        
        iceServers: []
    });

    pc.createDataChannel('');
    
    pc.onicecandidate = function(e) {
        if (!e.candidate) { 
            pc.close();
            callback(ips);
            return;
        }
        var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
        if (ips.indexOf(ip) == -1) 
            ips.push(ip);
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {}); 
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var ipaddress = '';
        getLocalIPs(function(ips) { 
            ipaddress = ips.join('\n');
            sendResponse(ipaddress);          
        });   
        return true;    
});
