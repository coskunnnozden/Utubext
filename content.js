
// utubext Content Harvester
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_VIDEO_METADATA') {
    try {
      const title = (document.querySelector('h1.ytd-watch-metadata') || document.querySelector('h1.title.ytd-video-primary-info-renderer'))?.textContent?.trim() || document.title;
      const channelName = (document.querySelector('#upload-info #channel-name a') || document.querySelector('ytd-video-owner-renderer #channel-name a'))?.textContent?.trim() || 'Unknown';
      const description = (document.querySelector('#description-inline-expander') || document.querySelector('#description-text'))?.textContent?.trim()?.substring(0, 1000) || '';

      sendResponse({
        success: true,
        title: title.replace(' - YouTube', ''),
        channelName,
        description,
        url: window.location.href
      });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }
  return true;
});
