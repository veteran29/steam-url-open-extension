import loadImagePathForServiceWorker from './loadImage';

console.log('Steam URL Opener Init');

const install = async () => {
  console.log('Steam URL Opener install');

  const openTabInSteam = async tab => {
    const steamURL = `steam://openurl/${tab.url}`;
    console.log('navigating to:', steamURL);

    chrome.tabs.update({ url: steamURL });
  };

  const RULE_ACTION_ENABLE = {
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'store.steampowered.com'}
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'steamcommunity.com'}
      })
    ],
    actions: [
      new chrome.declarativeContent.ShowAction(),
      new chrome.declarativeContent.SetIcon({
        imageData: {
          '64': await loadImagePathForServiceWorker('images/icon-on-64.png'),
          '128': await loadImagePathForServiceWorker('images/icon-on-128.png')
        }
      })
    ]
  };

  chrome.action.disable(); // do not show action by default, only when rules are fullfilled
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    console.log('Steam URL Opener removeRules');

    chrome.declarativeContent.onPageChanged.addRules([RULE_ACTION_ENABLE]);
  });

  chrome.action.onClicked.addListener(openTabInSteam);

};

install();
// chrome.runtime.onInstalled.addListener(install);
