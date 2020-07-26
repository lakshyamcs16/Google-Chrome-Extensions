const LEETCODE = "leetcode"
let extension = '';
let comment_type = '/*';
var extension_map = {
    "c": "c",
    "c++": "cpp",
    "python": "py",
    "java": "java",
    "python3": "py",
    "c#": "cs",
    "javascript": "js",
    "ruby": "rb",
    "swift": "swift",
    "go": "go",
    "scala": "scala",
    "kotlin": "kt",
    "rust": "rs",
    "php": "php",
    "typescript": "js"
  };
var extension_to_comment_map = {
    "c": { start: "/*", end: "*/"},
    "cpp": { start: "/*", end: "*/"},
    "py": { start: '"""', end: '""""'},
    "java": { start: "/*", end: "*/"},
    "py": { start: '"""', end: '""""'},
    "cs": { start: "/*", end: "*/"},
    "js": { start: "/*", end: "*/"},
    "rb":{ start: '=begin', end: '=end'},
    "swift": { start: "/*", end: "*/"},
    "go": { start: "/*", end: "*/"},
    "scala": { start: "/*", end: "*/"},
    "kt": { start: "/*", end: "*/"},
    "rs": { start: "/*", end: "*/"},
    "php": { start: "/*", end: "*/"},
    "js":{ start: "/*", end: "*/"}
};

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        let result = ``;
        let object = {};
        switch(message.type) {
            case LEETCODE:
                extension = getFormattedExtension(getExtension(message).toLowerCase());
                object.extension = `.${extension}` || ".txt";
                comment_type = extension_to_comment_map[extension];
                result += `${comment_type.start} \n\n ${getQuestion(message)} \n\n ${comment_type.end}\n\n`;
                result += `${comment_type.start} \n\n ${getExample(message)} \n\n ${comment_type.end}\n\n`;
                result += `${getCode(message)}`;
                object.result = result;
                object.title = getQuestionTitle(message);
                

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
        case LEETCODE:
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
        case LEETCODE:
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

function getQuestionTitle(params) {
    let result = ``;
    switch (params.type) {
        case LEETCODE:
            result += $(".question-title").text();

            if(result.length<1) {
                result += $('[data-cy="question-title"]').text();
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
    
                if(result.length<1) {
                    result += $('.ant-select-selection-selected-value').text();
                }
    
                return result;
        
            default:
                break;
        }
}

function getFormattedExtension(extension) {
    var keys = Object.keys(extension_map); //get keys from object as an array

    for(let i=0; i<keys.length; i++) {
      if(extension.startsWith(keys[i])) {
        return extension_map[keys[i]];
      }
    }

    return null;
  }