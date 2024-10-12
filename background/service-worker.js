chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const config = message.config;

  if (message.action === "configUpdated") {
    console.log("Service Worker, Message: ", message);
    chrome.storage.local.set({ config }, () => {
      chrome.storage.local.get("config", (config) => {
        console.log(config.config);
      });
    });

    chrome.tabs.query({ url: "chrome://newtab/" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "refresh" });
      });
    });
  }

  if (message.action === "checkDarkMode") {
    if (message.isDarkMode) {
      config.currentActiveStyle = 1;
    } else {
      config.currentActiveStyle = 0;
    }

    chrome.storage.local.set({ config }, () => {
      chrome.storage.local.get("config", (config) => {
        console.log(config.config);
      });
    });
  }
});

chrome.alarms.create("checkDarkMode", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkDarkMode") {
    chrome.storage.local.get("config", (result) => {
      const config = result.config || {};

      let hour = new Date().getHours();
      if (hour > 8 && hour < 20) {
        config.currentActiveStyle = 0;
      } else {
        config.currentActiveStyle = 1;
      }

      chrome.storage.local.set({ config }, () => {
        chrome.storage.local.get("config", (newConfigResult) => {
          console.log(newConfigResult.config);
        });
      });
    });
  }
});
