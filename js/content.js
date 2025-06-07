"use strict";

(function () {

    // Wait for the page to trigger "yt-navigate-finish" event
    document.addEventListener('yt-navigate-finish', function (event) {
        // Trigger observer code only if the page contains '/watch' path
        if (location.pathname === '/watch') {
            runObserverIfExtensionEnabled();
        }
    });

function runObserverIfExtensionEnabled() {
    let currentUrl = location.href;
    let musicId = "10";

    chrome.storage.sync.get(['extensionEnabled'], function(result) {
        console.log('The status of the extension is: ' + result.extensionEnabled);

        if(result.extensionEnabled !== undefined && result.extensionEnabled === false) {
            console.log('Simple Auto HD Extension Disabled. Please enable it through popup menu.');
        } else {
            console.log('Simple Auto HD Extension Enabled. Proceeding to initiate observer ');


            chrome.runtime.sendMessage({action: "findVideoCategory", url: currentUrl}, function(videoCategoryResponse){
                var categoryId = videoCategoryResponse.json.items[0].snippet.categoryId;

                console.log("cat id is:" + categoryId);
                if(categoryId == musicId){
                    console.log("category is music, setting preferred quality to 144p");
                    chrome.storage.sync.set({preferredQuality: "144p"}, function(){});
                }
                else{
                    console.log("category is not music, removing preferred quality");
                    chrome.storage.sync.remove("preferredQuality", function() {});
                }
                
            });


            initiateObserverAndObserve();
        }
    });
}

 // Configuration of the observer
 var config = {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: true
};

var qualitiesArray = [
    '4320p',
    '4320p60',
    '4320p50',
    '4320p48',
    '2160p',
    '2160p60',
    '2160p50',
    '2160p48',
    '1440p',
    '1440p60',
    '1440p50',
    '1440p48',
    '1080p',
    '1080p60',
    '1080p50',
    '1080p48',
    '720p',
    '720p60',
    '720p50',
    '720p48',
    '480p',
    '360p',
    '240p',
    '144p',
    'Auto'
];

var qualityTitles = [
    'Gehalte',
    'Keyfiyyət',
    'Kualitas',
    'Kualiti',
    'Kvalitet',
    'Qualitat',
    'Kvalita',
    'Qualität',
    'Kvaliteet',
    'Quality',
    'Calidad',
    'Kalitatea',
    'Kalidad',
    'Qualité',
    'Calidade',
    'Kvaliteta',
    'Ikhwalithi',
    'Gæði',
    'Ubora',
    'Kvalitāte',
    'Kokybė',
    'Minőség',
    'Kwaliteit',
    'Sifati',
    'Qualidade',
    'Calitate',
    'Cilësia',
    'Kakovost',
    'Laatu',
    'Chất lượng',
    'Kalite',
    'Якасць',
    'Сапаты',
    'Квалитет',
    'Качество',
    'Якість',
    'Ποιότητα',
    'Որակ',
    'איכות',
    'معیار',
    'الجودة',
    'کیفیت',
    'गुण',
    'गुणवत्ता',
    'क्वालिटी',
    'গুণাগুণ',
    'গুণমান',
    'ਗੁਣਵੱਤਾ',
    'ક્વૉલિટી',
    'ଗୁଣବତ୍ତା',
    'தரம்',
    'క్వాలిటీ',
    'ಗುಣಮಟ್ಟ',
    'നിലവാരം',
    'ගුණත්වය',
    'คุณภาพ',
    'ຄຸນນະພາບ',
    'အရည်အသွေး',
    'ხარისხი',
    'ጥራት',
    'គុណភាព​',
    '画质',
    '畫質',
    '画質',
    '화질'
];

    // Inititate observer
    function initiateObserverAndObserve() {
        var observer = new MutationObserver(function () {
            if (!document.contains(document.querySelector('.ytp-settings-button'))) {
                return;
            }

            observer.disconnect();

        
            // Run code after 100ms
            setTimeout(() => {
                selectPreferredQuality();
            }, 100)
        });

        observer.observe(document.body, config);
    }




    // Get storage value and update to given quality
    var selectPreferredQuality = function () {
        let minQuality = "144p";
        
        chrome.storage.sync.get(["preferredQuality"], function (result1) {
            if(result1.preferredQuality == minQuality){
                console.log("preferred quality was 144p -> sending " + result1.preferredQuality + " to updateQuality");
                updateQuality(result1.preferredQuality);
            }
            else{
                chrome.storage.sync.get(["savedPreferredQuality"], function (result2) {
                    console.log("preferred quality wasn't 144p -> sending " + result2.preferredQuality + " to updateQuality");
                    updateQuality(result2.savedPreferredQuality);
                
                });
                
            }
        });
    };


      // Update to given quality
      function updateQuality(quality){
        if (quality === undefined) {
            quality = 'Auto';
            console.log("updateQuality received 'undefined' -> setting quality to Auto");
        }else{
            console.log(`updateQuality received '${quality}' -> setting quality to ${quality}`);
        }

        chrome.storage.sync.set({ preferredQuality: quality }, function () { });

        var settingsButton = document.getElementsByClassName('ytp-settings-button')[0];

        settingsButton.click();

        var buttons = document.getElementsByClassName('ytp-menuitem-label');

        for (var i = 0; i < buttons.length; i++) {
            if (qualityTitles.includes(buttons[i].innerHTML)) {
                buttons[i].click();
            }
        }

        var targetItem;

        var targetItems = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');
        targetItems = Array.from(targetItems).filter(item => !item.innerHTML.includes("ytp-premium-label"));
        
        if (quality === 'best-available') {
            targetItem = targetItems[0];
            
        } else {
            targetItem = findTargetItem(quality, targetItems);
        }

        targetItem.click();
    }

    function findTargetItem(preferredQuality, targetItems) {
        var targetItem = '';
        
        for (var i = 0; i < targetItems.length; i++) {
            var potentialTargetItem = targetItems[i].childNodes[0].childNodes[0];

            var quality = potentialTargetItem.innerHTML.split(' ')[0];

            if (quality === preferredQuality) {
                targetItem = potentialTargetItem;
            }
        }

        var key = qualitiesArray.indexOf(preferredQuality);

        if (targetItem === '' && (qualitiesArray[key + 1] !== undefined)) {
            preferredQuality = qualitiesArray[key + 1];

            return findTargetItem(preferredQuality, targetItems);
        }

        return targetItem;
    }

    // Listen for chrome storage changes
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let key in changes) {
            console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
            console.log('Old value:', changes[key].oldValue);
            console.log('New value:', changes[key].newValue);

             if (key === 'preferredQuality') {
                selectPreferredQuality();
            }
        }
    });


})();