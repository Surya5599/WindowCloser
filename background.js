// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//'use strict';

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });


chrome.storage.local.set({whichPage: "default"});
chrome.runtime.sendMessage({
  msg: "default"
});

var socket = io("https://server-connect-hangouts.herokuapp.com");

chrome.extension.onConnect.addListener(function(port) {
    console.log("Connected .....");
    port.onMessage.addListener(function(msg) {
        console.log("message received " + msg.type + " with " + msg.message);
		if(msg.type == "create"){
      console.log("sending create");
			socket.emit('create', msg.message);
      chrome.storage.local.set({ownerType: "owner"});
		}
		else if(msg.type == "leave"){
      console.log("sending leave");
      chrome.storage.local.get("serverRoom", function(result) {
			    socket.emit('leave', result.serverRoom);
      });
		}
		else if(msg.type == "close"){
      console.log("sending close");
      chrome.storage.local.get("serverRoom", function(result) {
			    socket.emit('close', {room: result.serverRoom, message: msg.message});
      });
		}
    else if(msg.type == "closeOthers"){
      console.log("sending close Others only");
      chrome.storage.local.get("serverRoom", function(result) {
			    socket.emit('closeOthers', {room: result.serverRoom, message: msg.message});
      });
		}
		else if(msg.type == "join"){
      console.log("sending join " + msg.message);
			socket.emit('join', msg.message);
      chrome.storage.local.set({ownerType: "notOwner"});
		}
    });
});

  socket.on('created', createdServer);
  socket.on('closed', closeHang);
  socket.on('left', leftServer);
  socket.on('badRoom', badRoom);
  socket.on('joinLock', lockClick);
  socket.on('roomSize', changeNumber);


function changeNumber(data){
  console.log("recieved roomSize: " + data);
  chrome.runtime.sendMessage({
    msg: "roomNumber",
    people: data
  });
}


function lockClick(data){
  console.log("LOCKED");
  chrome.storage.local.set({serverRoom: data});
  chrome.storage.local.get("ownerType", function(result) {
    console.log(result.ownerType);
      if(result.ownerType != "owner"){
        chrome.runtime.sendMessage({
          msg: "notOwner"
       });
      }
  });
}

function createdServer(data){
	console.log("Added to Room: " + data);
	chrome.storage.local.set({serverRoom: data});
  chrome.runtime.sendMessage({
    msg: "server Created"
});
}

function closeHang(data){
   console.log("serverReplied");
   const substring = data.toLowerCase();
   console.log("requested to end: " + substring);
   chrome.tabs.query({},function(tabs){
    tabs.forEach(function(tab){
      const string = tab.url;
      if (string.includes(substring) && substring !== " "){
		      chrome.tabs.remove(tab.id, function(){});
      }
    });
 });
};

function leftServer(data){
  console.log("Left Room: " + data);
  chrome.storage.local.set({serverRoom: data});
}

function badRoom(){
  console.log("no such room");
  chrome.runtime.sendMessage({
    msg: "failed"
});
}
