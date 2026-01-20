// Fix: Changed 'const' to 'var' to allow redeclaration across script files in global scope
declare var chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('utubext: Extension Installed & Ready');
});

// Tab güncellemelerini izleyerek popup'a sinyal gönderebiliriz (opsiyonel)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com/watch')) {
    // Gelecekte buraya otomatik bildirimler eklenebilir
  }
});