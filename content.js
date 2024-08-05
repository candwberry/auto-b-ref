let currentBRef = '';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "checkBRef") {
      const regex = /B\d{7}(-[a-zA-Z0-9-]*)?$/;
      const match = request.bRef.match(regex);
      if (match) 
        navigateToProductPage(request.bRef);
    }
  }
);

function findAndProcessCode() {
  const regex = /B\d{7}(-[a-zA-Z0-9-]*)?$/;
  const pageContent = document.body.innerText;
  const match = pageContent.match(regex);
  
  if (match) {
    const code = match[0];
      chrome.storage.sync.get(['autoCopy'], function(result) {
        if (result.autoCopy !== false) {
          navigator.clipboard.writeText(code).then(() => {
            showToast(`Copied <strong>${code}</strong> to clipboard`);
          });
        }
      });
  }
}

function navigateToProductPage(code) {
  const searchUrl = `https://www.cwberry.com/search?q=${code}`;
  
  // Set flag before navigation
  chrome.storage.local.set({shouldClickFirstProduct: true}, function() {
    window.location.href = searchUrl;
  });
}

function checkAndClickFirstProduct() {
    if (window.location.href.includes('cwberry.com/search')) {
      chrome.storage.local.get(['shouldClickFirstProduct'], function(result) {
        if (result.shouldClickFirstProduct) {
          waitForElement('.product.photo.product-item-photo', 3000)
            .then((firstProduct) => {
              chrome.storage.local.set({shouldClickFirstProduct: false});

              if (firstProduct) {
                firstProduct.click();
              }
              // Reset the flag
            })
            .catch(() => {
              console.log('First product element not found within timeout');
              // Reset the flag even if the element wasn't found
              chrome.storage.local.set({shouldClickFirstProduct: false});
            });
        }
      });
    }
  }
  
  function waitForElement(selector, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
  
      function checkElement() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject();
        } else {
          requestAnimationFrame(checkElement);
        }
      }
  
      checkElement();
    });
  }

function showToast(message) {
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: -300px;
    background-color: #009845;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    transition: right 0.5s ease-in-out;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.right = '20px';
  }, 100);

  setTimeout(() => {
    toast.style.right = '-300px';
  }, 2500);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initial checks when the script loads
findAndProcessCode();
checkAndClickFirstProduct();
