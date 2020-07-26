const LEETCODE = "leetcode"
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        let result = ``;
        let object = {};
        switch(message.type) {
            case LEETCODE:
                result += `${getQuestion(message)}\n\n`;
                result += `${getExample(message)}\n\n`;
                result += `${getCode(message)}`;
                object.result = result;
                object.title = getQuestionTitle(message);
                object.extension = getExtension(message);

                sendResponse(object);
            break;
        }
    }
);

function getQuestion(params) {
    let result = ``;

    switch (params.type) {
        case LEETCODE:
            $('.question-detail').find('p').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result && result.length < 1) {
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
        case LEETCODE:
            $('.question-detail').find('pre').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result && result.length <1){
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
        case LEETCODE:
            $('.CodeMirror-code').find('pre').each((v, k) => {
                result += $(k).text() + '\n';
            });

            if(result && result.length < 1) {
                result += $('.CodeMirror-lines').textContent + '\n';
            }
            return result;
    
        default:
            break;
    }
}

function getQuestionTitle(params) {
    let result = ``;
    switch (params.type) {
        case LEETCODE:
            result += $(".question-title").text();

            if(result && result.length<1) {
                result += $('[data-cy="question-title"]').textContent;
            }

            return result;
    
        default:
            break;
    }
}

function getExtension(params) {
        let result = ``;
        switch (params.type) {
            case LEETCODE:
                result += $('.Select-value-label').text();
    
                if(result && result.length<1) {
                    result += $('.ant-select-selection-selected-value').textContent;
                }
    
                return result;
        
            default:
                break;
        }
}