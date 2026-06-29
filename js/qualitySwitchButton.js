"use strict";

// Configuration of the observer
const MIN_QUALITY = "144p";

let config = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true
};

document.addEventListener("DOMContentLoaded", function () {
  let failureCount = 0;

  const observer = new MutationObserver(() => {
    const rightControlsBox = document.querySelector('.ytp-right-controls');

    if (rightControlsBox) {
      addQualitySwitchButton();
      observer.disconnect();
    } else if (failureCount < 200) {
      failureCount++;
    } else {
      console.log('Failed to add quality button -> disconnecting observer');
      observer.disconnect();
    }
  });

  observer.observe(document.body, config);
});

function addQualitySwitchButton() {
  const rightControlsBox = document.querySelector('.ytp-right-controls');
  const audioModeButton = document.createElement("button");
  
  audioModeButton.classList.add('ytp-button');
  audioModeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path fill="currentColor" d="M7.5 16.5h9.154l-2.827-3.77l-2.615 3.308l-1.75-2.115zM4 20V4h16v16zm1-1h14V5H5zm0 0V5z"/>
    </svg>
  `;
  
  rightControlsBox.prepend(audioModeButton);
  audioModeButton.addEventListener('click', flipQualityIfExtensionEnabled);
}

function flipQualityIfExtensionEnabled() {
  chrome.storage.sync.get(['extensionEnabled'], function (result) {
    console.log('The status of the extension is: ' + result.extensionEnabled);

    if (result.extensionEnabled !== undefined && result.extensionEnabled === false) {
      console.log('Simple Auto HD Extension Disabled. Please enable it through popup menu.');
    } else {
      console.log('Simple Auto HD Extension Enabled. Proceeding to initiate observer');
      flipPreferredQuality();
    }
  });
}

function flipPreferredQuality() {
  chrome.storage.sync.get(["preferredQuality"], function (result1) {
    if (result1.preferredQuality == MIN_QUALITY) {
      chrome.storage.sync.get(["savedPreferredQuality"], function (result2) {
        console.log("preferred quality isn't 144p -> sending " + result2.preferredQuality + " to updateQuality");
        updateQuality(result2.savedPreferredQuality);
      });
    } else {
      chrome.storage.sync.set({ preferredQuality: MIN_QUALITY }, initiateObserverAndObserve);
    }
  });
} 
//