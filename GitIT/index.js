var gh = (function() {
    'use strict';
  
    var signin_button;
    var code;
    var user_repo_select;
    var code_content_btn;
    var code_content_area;
    var code_push_btn;
    var commit_message_field;
    var commit_message;
    var revoke_button;
    var user_repo;
    var user_info_div;
    var access_token = null;
    var login_name;
    var repo_text;
    var file_name;
    var repo_tree;
    var logo_text;
    var loader;
    var extension;
    var file_extension_field;
    

    var tokenFetcher = (function() {
      // Replace clientId and clientSecret with values obtained by you for your
      // application https://github.com/settings/applications.
      var clientId = '8a6f545c0d52ad439341';
      //'Iv1.cf032acb41714b4e';
      // Note that in a real-production app, you may not want to store
      // clientSecret in your App code.
      var clientSecret = '53b6ce74fa2bc1204952325fed5bd2552ec26d94';
      //'7002690fad6c0002a5146938a5d54edd86a2c855';
      var redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/provider_cb`;
      var redirectRe = new RegExp(redirectUri + '[#\?](.*)');

      return {
        getToken: function(interactive, callback) {
          // In case we already have an access_token cached, simply return it.
          console.log(access_token);
          if (access_token) {
            callback(null, access_token);
            return;
          }
          
          var options = {
            'interactive': interactive,
            'url': 'https://github.com/login/oauth/authorize' +
                   '?client_id=' + clientId +
                   '&redirect_uri=' + encodeURIComponent(redirectUri) +
                   '&scope=repo'
          }
          chrome.identity.launchWebAuthFlow(options, function(redirectUri) {
            console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
                redirectUri);
  
            if (chrome.runtime.lastError) {
              callback(new Error(chrome.runtime.lastError));
              return;
            }
  
            // Upon success the response is appended to redirectUri, e.g.
            // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
            //     &refresh_token={value}
            // or:
            // https://{app_id}.chromiumapp.org/provider_cb#code={value}
            var matches = redirectUri.match(redirectRe);
            if (matches && matches.length > 1)
              handleProviderResponse(parseRedirectFragment(matches[1]));
            else
              callback(new Error('Invalid redirect URI'));
          });
  
          function parseRedirectFragment(fragment) {
            var pairs = fragment.split(/&/);
            var values = {};
  
            pairs.forEach(function(pair) {
              var nameval = pair.split(/=/);
              values[nameval[0]] = nameval[1];
            });
  
            return values;
          }
  
          function handleProviderResponse(values) {
            console.log('providerResponse', values);
            if (values.hasOwnProperty('access_token'))
              setAccessToken(values.access_token);
            // If response does not have an access_token, it might have the code,
            // which can be used in exchange for token.
            else if (values.hasOwnProperty('code'))
              exchangeCodeForToken(values.code);
            else 
              callback(new Error('Neither access_token nor code avialable.'));
          }
  
          function exchangeCodeForToken(code) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET',
                     'https://github.com/login/oauth/access_token?' +
                     'client_id=' + clientId +
                     '&client_secret=' + clientSecret +
                     '&redirect_uri=' + redirectUri +
                     '&code=' + code);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onload = function () {
              // When exchanging code for token, the response comes as json, which
              // can be easily parsed to an object.
              if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                console.log(response);
                if (response.hasOwnProperty('access_token')) {
                  setAccessToken(response.access_token);
                } else {
                  callback(new Error('Cannot obtain access_token from code.'));
                }
              } else {
                console.log('code exchange status:', this.status);
                callback(new Error('Code exchange failed'));
              }
            };
            xhr.send();
          }
  
          function setAccessToken(token) {
            access_token = token; 
            console.log('Setting access_token: ', access_token);
            callback(null, access_token);
          }
        },
  
        removeCachedToken: function(token_to_remove) {
          if (access_token == token_to_remove)
            access_token = null;
        }
      }
    })();
  
    function xhrWithAuth(method, url, interactive, callback) {
      var retry = true;
      var access_token;
  
      console.log('xhrWithAuth', method, url, interactive);
      getToken();
  
      function getToken() {
        tokenFetcher.getToken(interactive, function(error, token) {
          console.log('token fetch', error, token);
          if (error) {
            callback(error);
            return;
          }
          console.log(token)
          access_token = token;
          requestStart();
        });
      }
  
      function requestStart() {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.onload = requestComplete;
        xhr.send();
      }
  
      function requestComplete() {
        console.log('requestComplete', this.status, this.response);
        if ( ( this.status < 200 || this.status >=300 ) && retry) {
          retry = false;
          tokenFetcher.removeCachedToken(access_token);
          access_token = null;
          getToken();
        } else {
          callback(null, this.status, this.response);
        }
      }
    }
  
    function getUserInfo(interactive) {
      xhrWithAuth('GET',
                  'https://api.github.com/user',
                  interactive,
                  onUserInfoFetched);
    }
  
    // Functions updating the User Interface:
  
    function showButton(button) {
      button.style.display = 'inline';
      button.disabled = false;
    }
  
    function hideButton(button) {
      button.style.display = 'none';
    }
  
    function disableButton(button) {
      button.disabled = true;
    }
  
    function onUserInfoFetched(error, status, response) {
      if (!error && status == 200) {
        console.log("Got the following user info: " + response);
        var user_info = JSON.parse(response);
        populateUserInfo(user_info);
        hideButton(signin_button);
        
        showButton(revoke_button);
        showButton(code_content_btn);
        showButton(code_push_btn);
        showButton(file_name);
        showButton(commit_message_field);
        showButton(file_extension_field);
        showButton(repo_text);
        showButton(user_repo_select);
        showButton(repo_tree);
        showButton(code_content_area);
        hideButton(loader);

        fetchUserRepos(user_info["repos_url"]);
      } else {
        console.log('infoFetch failed', error, status);
        showButton(signin_button);
        hideButton(loader);
      }
    }
  
    function populateUserInfo(user_info) {
      var elem = user_info_div;
      var nameElem = document.createElement('div');
      login_name = user_info.login;
      nameElem.innerHTML = "<b>Hello " + user_info.login + "</b><br>"
          + "Your github page is: " + user_info.html_url;
      elem.appendChild(nameElem);
    }
  
  
  
    function fetchUserRepos(repoUrl) {
      xhrWithAuth('GET', repoUrl, false, onUserReposFetched);
    }
  
    function onUserReposFetched(error, status, response) {
      var elem = document.querySelector('#user_repos');
      if (!error && status == 200) {
        console.log("Got the following user repos:", response);
        var user_repos = JSON.parse(response);
        var options = ``
        user_repos.forEach(v => {
            options += `<option value="${v.name}">${v.name}</option>`
        });
        $(elem).append(options);
        user_repo = user_repos[0].name;
        fetchRepoTree({ url: `https://api.github.com/repos/${login_name}/${user_repos[0].name}/contents/` }).then(r => callback(r))
      } else {
        console.log('infoFetch failed', error, status);
      }
      
    }
  
    // Handlers for the buttons's onclick events.
  
    function rerender_repo_tree() {
      user_repo = $(this).children("option:selected").val();
      fetchRepoTree({ url: `https://api.github.com/repos/${login_name}/${user_repo}/contents/` }).then(r => callback(r))
    }

    function fetchRepoTree(params) {
      return fetch(params.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      }).then(r => r.json())
    }
    
    

    function fetchCodeFromPage() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"leetcode"}, function(object={}){
            code = object.result || "Please try the code highlighter or paste the code here.";
            commit_message = object.title? object.title.trim() : "Enter a commit message";
            extension = object.extension;
            $(code_content_area).text(code);
            commit_message_field.value = commit_message;
            file_name.value = commit_message.replace(/\s/g, "_");
            file_extension_field.value = extension;
        });
      });
    }

    function pushCodeToGit() {
      $('#status').append(`<div id="loading"></div>`);
      let encoded_code = btoa(unescape(encodeURIComponent(code)));
      let path = $('input[name="dir"]:checked').parent().find('a').attr('data-path');
      commit_message = commit_message_field.value || "Initial commit";
      let file = file_name.value || 'test';
      path = path && path.length > 0? path.replace(/\s/g, "%20") + "/" : "/";
      
      let message = 'Code has been pushed successfully!';
      try {
        fetch(`https://api.github.com/repos/lakshyamcs16/${user_repo}/contents${path}${file}${extension}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${access_token}`
          },
          body: `{"message": "${commit_message}", "committer": {"name": "${login_name}", "email": "${login_name}" }, "content": "${encoded_code}"}`
        }).then(r => r.json())
        .then(r => {
          if(r.message) {
            message = r.message;
          }

          $('#status').text(message);
        }).catch(error => {
          $('#status').text('An error occured, please try again.');
        });
      }catch(err) {
        $('#status').text('An error occured, please try again.');
      }finally{
        $("#status").html(message || ``);
      }
      
    }

    function callback(response, elem, prev_path="") {
      var html_tree = ``
      if (response && response.tree) {
        response.tree.forEach(item => {
          if (item.type !== 'dir' && item.type !== 'tree') {
            html_tree += `<li>${item.path}</li>`
          } else {
            html_tree += `<li class="folder-root closed"><input type="radio" name="dir"><a href="#" data-sha="${item.sha}" data-url="${item.url}" data-clicked="false" data-path="${prev_path}/${item.path}">${item.path}</a></input><ul id="${item.sha}"></ul></li>`
          }
        });
      } else if (response) {
        response.forEach(item => {
          if (item.type !== 'dir' && item.type !== 'tree') {
            html_tree += `<li>${item.path}</li>`
          } else {
            html_tree += `<li><input type="radio" name="dir"><a href="#" data-sha="${item.sha}" data-url="${item.git_url}" data-clicked="false" data-path="${prev_path}/${item.path}">${item.name}</a></input><ul id="${item.sha}"></ul></li>`
          }
        });
      }

      if(!elem){
        $('#repo_tree').html('');
      }

      $(elem || ".file-tree").append(html_tree);
    
      if (!elem) {
        $(".file-tree").filetree();
      }
      $("a").on("click", handleclick);  
      if(elem) {
        $(`#loading`).remove();
      }
    }
    
    function handleclick() {
      let url = $(this).attr("data-url");
      let id = $(this).attr("data-sha");
      let prev_path = $(this).attr("data-path");

      if ($(this).attr('data-clicked') === 'false') {
        $(this).append(`<div id="loading"></div>`);
        fetchRepoTree({ url }).then(r => callback(r, $('#' + id)[0], prev_path));
        $(this).attr('data-clicked', "true")
      }
    }

    function interactiveSignIn() {
      disableButton(signin_button);
      tokenFetcher.getToken(true, function(error, access_token) {
        if (error) {
          showButton(signin_button);
        } else {
          getUserInfo(true);
        }
      });
    }
  
    function revokeToken() {
      // We are opening the web page that allows user to revoke their token.
      window.open('https://github.com/settings/applications');
      // And then clear the user interface, showing the Sign in button only.
      // If the user revokes the app authorization, they will be prompted to log
      // in again. If the user dismissed the page they were presented with,
      // Sign in button will simply sign them in.
      user_info_div.textContent = '';
      hideButton(revoke_button);
      showButton(signin_button);
    }
  
    return {
      onload: function () {
        signin_button = document.querySelector('#signin');
        signin_button.onclick = interactiveSignIn;
  
        revoke_button = document.querySelector('#revoke');
        revoke_button.onclick = revokeToken;
  
        user_info_div = document.querySelector('#user_info');

        user_repo_select = document.querySelector('#user_repos');
        user_repo_select.onchange=rerender_repo_tree

        code_content_btn = document.querySelector('#fetch');
        code_content_btn.onclick = fetchCodeFromPage;
  
        code_content_area = document.querySelector('#code_content');

        code_push_btn = document.querySelector('#push');
        code_push_btn.onclick = pushCodeToGit;

        repo_text = document.querySelector('#repo_text');

        file_name = document.querySelector('#file_name');

        commit_message_field = document.querySelector('#commit_message');

        repo_tree = document.querySelector('#repo_tree');

        logo_text = document.querySelector('#logo');

        loader = document.querySelector('#loader');

        file_extension_field = document.querySelector('#file_extension');

        $(".file-tree").filetree({
          animationSpeed: 'fast'
        });
    
        $(".file-tree").filetree({
          collapsed: true,
        });
        
        getUserInfo(false);
      }
    };
  })();

  window.onload = gh.onload;

  /*

  TODO:

  3. UI Checks (Performance improvement): Check if code is already fetched? Don't fetch again. [I]
  5. Overall UI Improvements. [I]
  6. Code Highlighting. [F]
  
  -----

  F: Feature
  I: Improvements

   */