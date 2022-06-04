/** @typedef {import('webextension-polyfill-ts').Browser} Browser */
/**
 * For VSCode IntelliSense
 * @type Browser 
 */
const app = browser;

console.log('Steam URL Opener Init');


const getCurrentTab = async () => (await app.tabs.query({ active: true, currentWindow: true }))[0];

/**
 * Checks currently activated tab and activates page button if it's valid.
 */
const checkCurrentTab = async () => {
  const currentTab = await getCurrentTab()
  if (!currentTab)
    return;

  const currentTabHostame = new URL(currentTab.url).hostname;
  if (supportedHostnames.includes(currentTabHostame)) {
    app.pageAction.show(currentTab.id);
    app.pageAction.setTitle({ tabId: currentTab.id, title: "Open in Steam"});
  } else {
    app.pageAction.hide(currentTab.id);
    app.pageAction.setTitle({ tabId: currentTab.id, title: "Not on Steam page"});
  };
};

// Check the tab on extension load
checkCurrentTab();

/**
 * Steam will open only it's own domains in built in browser.
 * List of supported domains.
 */
const supportedHostnames = [
  "store.steampowered.com",
  "steamcommunity.com",
];

app.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return;

  const currentTab = await getCurrentTab()
  if (tabId !== currentTab.id) return;

  checkCurrentTab();
});

app.tabs.onActivated.addListener(async () => {
  checkCurrentTab();
});

const FIREFOX_WORKAROUND = false;

app.pageAction.onClicked.addListener(async tab => {
  const steamURL = `steam://openurl/${tab.url}`;
  console.log('navigating to:', steamURL);

  if ((await browser.runtime.getBrowserInfo()).name === 'Firefox' && FIREFOX_WORKAROUND) {
    // open new tab, updating url with steam:// url does not work in firefox anymore
    const newTab = await app.tabs.create({ url: steamURL });

    setTimeout(() => {
      console.log('closing tab', newTab);
      // close the new temporary tab
      app.tabs.remove(newTab.id);
      // active the old tab back
      app.tabs.update(tab.id, { active: true });
    }, 100);
  } else {
    app.tabs.update({ url: steamURL });
  }
});
