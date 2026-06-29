const DEBUG = false; 
if (!DEBUG) {
  console.log = function() {};
}

// Description: This script handles the popup functionality for the Audio Mode Extension.
"use strict";

(function () {
  var version = chrome.runtime.getManifest().version;
  var optionsElement = document.getElementById('options');
  var extensionStatusElement = document.getElementById('extension-status');
  var extensionEnabledElement = document.getElementById('extension-enabled');
  var preferredQualityElement = document.getElementById('preferred-quality');
  var wrapperElement = document.getElementsByClassName('wrapper')[0];

  var headerElem = document.querySelector('header .version');
  headerElem.innerText = 'v' + version;

  optionsElement.addEventListener('click', function () {
    console.log("options click: activate options page");
    activateOptionsPage();
  });

  function activateOptionsPage() {
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
  }

  function disableElements() {
    wrapperElement.classList.add('wrapper-enabled');
    document.body.style.backgroundColor = 'grey';
    extensionStatusElement.innerText = 'Extension Disabled';
  }

  function enableElements() {
    wrapperElement.classList.remove('wrapper-enabled');
    document.body.style.backgroundColor = '#262a32';
    extensionStatusElement.innerText = 'Extension Enabled';
  }

  chrome.storage.sync.get(['extensionEnabled'], function (result) {
    if (result.extensionEnabled !== undefined && result.extensionEnabled === false) {
      extensionEnabledElement.checked = false;
      disableElements();
    } else {
      enableElements();
      extensionEnabledElement.checked = true;
    }
  });

  chrome.storage.sync.get(['preferredQuality'], function (result) {
    if (result.preferredQuality !== undefined) {
      preferredQualityElement.value = result.preferredQuality;
    }
  });

  preferredQualityElement.addEventListener("change", function () {
    let selectedString = preferredQualityElement.options[preferredQualityElement.selectedIndex].value;
    chrome.storage.sync.set({ savedPreferredQuality: selectedString }, function () {});
  });

  extensionEnabledElement.addEventListener('change', function (event) {
    if (event.target.checked) {
      setExtensionEnabledBoolean(true);
      enableElements();
    } else {
      setExtensionEnabledBoolean(false);
      disableElements();
    }
  });

  function setExtensionEnabledBoolean(extensionEnabled) {
    chrome.storage.sync.set({ extensionEnabled: extensionEnabled }, function () {});
  }
})();