document.addEventListener('DOMContentLoaded', function() {
    const autoCopyToggle = document.getElementById('autoCopy');
    const bReferenceInput = document.getElementById('bReference');
  
    // Load saved settings
    chrome.storage.sync.get(['autoCopy', 'bReference'], function(result) {
      autoCopyToggle.checked = result.autoCopy !== false;
      bReferenceInput.value = result.bReference || '';
    });
  
    // Save settings when changed
    autoCopyToggle.addEventListener('change', function() {
      chrome.storage.sync.set({autoCopy: autoCopyToggle.checked});
    });
  
    bReferenceInput.addEventListener('input', function() {
      chrome.storage.sync.set({bReference: bReferenceInput.value});
      
      // Send message to content script to check for B-ref
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "checkBRef", bRef: bReferenceInput.value});
      });
    });
  });