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

app.pageAction.onClicked.addListener(async tab => {
  const steamURL = `steam://openurl/${tab.url}`;
  console.log('navigating to:', steamURL);

  app.tabs.update({ url: steamURL });
});