var port = chrome.extension.connect({
    name: "Sample Communication"
});

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.local.set({whichPage: "default"});
    changePage();
});

window.onload = function(){
  changePage();
}



function changePage(){
  startedServer();
  console.log("function called");
  var xdefault = document.getElementById("default");
  var xpopup = document.getElementById("popup");
  var xcloseAccess = document.getElementById("closeAccess");
  chrome.storage.local.get("whichPage", function(result) {
        console.log("which page: " + result.whichPage);
          if(result.whichPage == "popup"){
            xdefault.style.display = "none";
            xpopup.style.display = "block";
            xcloseAccess.style.display = "block";
          }
          else if(result.whichPage == "locked"){
            xdefault.style.display = "none";
            xpopup.style.display = "block";
            xcloseAccess.style.display = "none";
          }
          else{
            xdefault.style.display = "block";
            xpopup.style.display = "none";
            xcloseAccess.style.display = "none";
            document.getElementById("serverName").style.borderColor="black";
          }
  });
}

function createServer(){
  var checked = document.getElementById("access").checked;
  port.postMessage({type: "create", message: checked});
  chrome.storage.local.set({whichPage: "popup"});
  changePage();
}

function joinServer(){
var serverName = document.getElementById("serverName").value;
	if(serverName){
		port.postMessage({type: "join", message: serverName});
	}
	else{
		document.getElementById("serverName").style.borderColor="red";
	}
}


function startedServer(){
  chrome.storage.local.get("serverRoom", function(result) {
            console.log(result.serverRoom);
            document.getElementById("serverID").innerHTML = result.serverRoom;
  });
}

function closeTab(){
  var closeTab = document.getElementById("closePage").value;
  if (!closeTab.replace(/\s/g, '').length) {
    document.getElementById("closePage").style.borderColor="red";
  }
  else if(closeTab){
    chrome.storage.local.set({whichPage: "popup"});
    changePage();
    port.postMessage({type: "close", message: closeTab});
  }
  else{
    document.getElementById("closePage").style.borderColor="red";
  }
}


function leaveServer(){
  port.postMessage({type: "leave", message: "none"});
  chrome.storage.local.set({whichPage: "default"});
  changePage();
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log("got message " +  request.msg);
        if (request.msg === "failed") {
            document.getElementById("serverName").style.borderColor="red";
        }
        else if(request.msg == "default"){
              chrome.storage.local.set({whichPage: "default"});
              changePage();
        }
        else if(request.msg == "notOwner"){
          chrome.storage.local.set({whichPage: "locked"});
          startedServer();
          changePage();
        }
        else{
          chrome.storage.local.set({whichPage: "popup"});
          startedServer();
          changePage();
        }
    }
);


function changeBackground(){
	document.getElementById("serverName").style.borderColor="black";
  document.getElementById("closePage").style.borderColor="black";
}


function copyToClip(){
  chrome.storage.local.get("serverRoom", function(result) {
            var message = result.serverRoom;
            console.log("copying " + message);
              var input = document.createElement('textarea');
              document.body.appendChild(input);
              input.value = message;
              input.focus();
              input.select();
              document.execCommand('Copy');
              input.remove();
  });
}


document.getElementById('create').addEventListener('click', createServer);
document.getElementById('join').addEventListener('click', joinServer);
document.getElementById('close').addEventListener('click', closeTab);
document.getElementById('leave').addEventListener('click', leaveServer);
document.getElementById("serverName").addEventListener("click", changeBackground);
document.getElementById("closePage").addEventListener("click", changeBackground);
document.getElementById('copy').addEventListener('click', copyToClip);
