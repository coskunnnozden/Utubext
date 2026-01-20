// YouTube sayfasından metadata ayıklayan script
// Fix: Changed 'const' to 'var' to allow redeclaration across script files in global scope
declare var chrome: any;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_VIDEO_METADATA') {
    const title = document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() || document.title;
    const channelName = document.querySelector('#upload-info #channel-name a')?.textContent?.trim();
    const views = document.querySelector('#info-container #info span')?.textContent?.trim();
    const description = document.querySelector('#description-inline-expander')?.textContent?.trim()?.substring(0, 500);

    sendResponse({
      title,
      channelName,
      views,
      description,
      url: window.location.href
    });
  }
  return true;
});