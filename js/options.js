"use strict";

document.addEventListener("DOMContentLoaded", function () {
  getApiKey();
  document.getElementById('saveKey').addEventListener('click', save_options);

  function getApiKey() {
    chrome.storage.local.get('apiKey', function (data) {
      let value = "";
      let key = data.apiKey;

      if (key == "") {
        value = "You do not have a key set.";
      } else {
        value = "Your current Youtube key is: <b id='key'>" + key + "</b>";
      }
      
      document.getElementById("currKey").innerHTML = value;
    });
  }

  function save_options() {
    if (!isValidKey()) {
      return;
    }
    
    if (confirm("Are you sure you want to save this key?")) {
      setApiKey();
      alert('You have saved your options');
    }
  }

  function isValidKey() {
    let key = document.getElementById("API_KEY").value;
    
    if (!key) {
      alert("Please enter a key");
      return false;
    }
    
    return true;
  }

  function setApiKey() {
    let key = document.getElementById("API_KEY").value;
    console.log(key);
    
    chrome.storage.local.set({ apiKey: key }, function () {
      console.log('set api key: ' + key);
      location.reload();
      chrome.runtime.reload();
    });
  }
}); 
//