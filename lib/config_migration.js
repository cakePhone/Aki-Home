import { updateConfig } from "./commons.js";

export function migrateV1toV1_1(config) {
  config.version = "1.1";
  let style_1 = config.style;

  config.style = [style_1, style_1];
  config.currentActiveStyle = 0;
  config.daylightThemeEnabled = false;

  localStorage.removeItem("config");

  chrome.storage.local.set({ config }, () => {
    chrome.storage.local.get("config", (config) => {
      return;
    });
  });

  updateConfig(config);

  return config;
}
