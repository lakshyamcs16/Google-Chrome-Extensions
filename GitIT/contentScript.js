chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "leetcode":
                let result = ``;
                result += `${getQuestion(message)}\n\n`;
                result += `${getExample(message)}\n\n`;
                result += `${getCode(message)}`;

                sendResponse(result);
            break;
        }
    }
);

function getQuestion(params) {
    let result = ``;

    switch (params.type) {
        case "leetcode":
            $('.question-detail').find('p').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result.length < 1) {
                result += $('[data-key="description-content"] p').text() + '\n';
            }
            return result;
        default:
            break;
    }
}

function getExample(params) {
    let result = ``;

    switch (params.type) {
        case "leetcode":
            $('.question-detail').find('pre').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result.length <1){
                result += $('[data-key="description-content"] pre').text() + '\n';
            }
            return result;
    
        default:
            break;
    }
}

function getCode(params) {
    let result = ``;

    switch (params.type) {
        case "leetcode":
            $('.CodeMirror-code').find('pre').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result.length < 1) {
                result += $('.CodeMirror-lines').textContent + '\n';
            }
            return result;
    
        default:
            break;
    }
}