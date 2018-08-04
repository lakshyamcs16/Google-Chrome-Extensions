// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let mssg = document.getElementById('msg');
let getmail = document.getElementById('getmail');

getmail.onclick = function(){
  var port = chrome.extension.connect({
      name: "Sample Communication"
  });
  port.postMessage("Hi BackGround");
  port.onMessage.addListener(function(msg) {
      mssg.innerHTML = msg;
  });
}
