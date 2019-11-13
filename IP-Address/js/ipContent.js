chrome.runtime.sendMessage({query: 'getip'}, function(msg) {
        console.log(msg);
        localStorage.setItem('ipaddr', msg);  
});