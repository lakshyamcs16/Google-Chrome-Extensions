
$(document).ready(function () {
  fetchRepoTree({ url: 'https://api.github.com/repos/lakshyamcs16/Alexa-Skills/contents/' }).then(r => callback(r))
});

$(document).ready(function () {
  $(".file-tree").filetree({
    animationSpeed: 'fast'
  });
});

$(document).ready(function () {
  $(".file-tree").filetree({
    collapsed: true,
  });
});

function fetchRepoTree(params) {
  return fetch(params.url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer 850e0e7e035513488e69e4f10aa59285687fa9fc'
    }
  }).then(r => r.json())
}

function callback(response, elem) {
  var html_tree = ``
  if (response && response.tree) {
    response.tree.forEach(item => {
      if (item.type !== 'dir' && item.type !== 'tree') {
        html_tree += `<li>${item.path}</li>`
      } else {
        html_tree += `<li class="folder-root closed"><a href="#" onclick="handleclick('${item.sha}', '${item.url}', this)" data-clicked="false">${item.path}</a><ul id="${item.sha}"></ul></li>`
      }
    });
  } else if (response) {
    response.forEach(item => {
      if (item.type !== 'dir' && item.type !== 'tree') {
        html_tree += `<li>${item.path}</li>`
      } else {
        html_tree += `<li><a href="#" onclick="handleclick('${item.sha}', '${item.git_url}', this)" data-clicked="false">${item.name}</a><ul id="${item.sha}"></ul></li>`
      }
    });
  }
  $(elem || ".file-tree").append(html_tree);

  if (!elem)
    $(".file-tree").filetree();
}

function handleclick(id, url, that) {
  if ($(that).attr('data-clicked') === 'false') {
    fetchRepoTree({ url }).then(r => callback(r, $('#' + id)[0]));
    $(that).attr('data-clicked', "true")
  }
}
