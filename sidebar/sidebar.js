import {
  rgbToHex,
  initStorage,
  updateConfig,
  getStorage,
  setStyles,
  hexToRgb,
  updateWallpaper,
} from "../lib/commons.js";
import { migrateV1toV1_1 } from "../lib/config_migration.js";

let nickname;
let search_engine;
let daylight_theme;
let dark_theme;
let accent;
let foreground;
let background;
let wallpaper;
let wp_enabled;
let reset_defaults;

/**
 * Updates the displayed values in settings
 */
export function displayStoredValues(config) {
  if (!nickname) return;
  nickname.value = config.nickname;
  search_engine.selectedIndex = config.searchEngine;
  daylight_theme.checked = config.daylightThemeEnabled;
  dark_theme.checked = config.currentActiveStyle === 1 ? true : false;
  accent.value = rgbToHex(
    config.style[config.currentActiveStyle].accent[0],
    config.style[config.currentActiveStyle].accent[1],
    config.style[config.currentActiveStyle].accent[2],
  );
  foreground.value = rgbToHex(
    config.style[config.currentActiveStyle].foreground[0],
    config.style[config.currentActiveStyle].foreground[1],
    config.style[config.currentActiveStyle].foreground[2],
  );
  background.value = rgbToHex(
    config.style[config.currentActiveStyle].background[0],
    config.style[config.currentActiveStyle].background[1],
    config.style[config.currentActiveStyle].background[2],
  );
  wp_enabled.checked =
    config.style[config.currentActiveStyle].wallpaper.enabled;
}

/**
 * Sets all listeners for the settings
 *
 * @param {object} config
 */
function setListeners(config) {
  if (!nickname) return;
  nickname.addEventListener("input", async (event) => {
    config = await getStorage();
    config.nickname = event.target.value;
    await updateConfig(config);
  });

  search_engine.addEventListener("input", async (event) => {
    config = await getStorage();
    config.searchEngine = event.target.value;
    await updateConfig(config);
  });

  daylight_theme.addEventListener("change", async (event) => {
    config = await getStorage();
    config.daylightThemeEnabled = event.target.checked;
    await updateConfig(config);
  });

  dark_theme.addEventListener("change", async (event) => {
    config = await getStorage();
    config.currentActiveStyle = event.target.checked ? 1 : 0;
    await updateConfig(config);
  });

  accent.addEventListener("change", async (event) => {
    config = await getStorage();
    config.style[config.currentActiveStyle].accent = hexToRgb(
      event.target.value,
    );
    await updateConfig(config);
  });

  foreground.addEventListener("change", async (event) => {
    config = await getStorage();
    config.style[config.currentActiveStyle].foreground = hexToRgb(
      event.target.value,
    );
    await updateConfig(config);
  });

  background.addEventListener("change", async (event) => {
    config = await getStorage();
    config.style[config.currentActiveStyle].background = hexToRgb(
      event.target.value,
    );
    await updateConfig(config);
  });

  wallpaper.addEventListener("change", async (event) => {
    config = await getStorage();
    config.style[config.currentActiveStyle].wallpaper.url = updateWallpaper(
      event.target.files[0],
    );
    await updateConfig(config);
  });

  wp_enabled.addEventListener("change", async (event) => {
    config = await getStorage();
    config.style[config.currentActiveStyle].wallpaper.enabled =
      event.target.checked;
    await updateConfig(config);
  });

  reset_defaults.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to reset ALL your settings?")) return;
    await initStorage(config);
    config = await getStorage();
    displayStoredValues(config);

    await chrome.runtime.sendMessage({ action: "configUpdated" });
  });
}

/**
 * Initializes the config and displayed values
 */
async function init() {
  // Set settings elements
  nickname = document.getElementById("nickname");
  search_engine = document.getElementById("search-engine");
  daylight_theme = document.getElementById("theme-daylight");
  dark_theme = document.getElementById("dark-theme");
  accent = document.getElementById("accent");
  foreground = document.getElementById("foreground");
  background = document.getElementById("background");
  wallpaper = document.getElementById("wallpaper");
  wp_enabled = document.getElementById("enable-wallpaper");
  reset_defaults = document.getElementById("reset-defaults");

  let config = await getStorage();

  if (config.version === "1.0") {
    config = migrateV1toV1_1(config);
  }

  displayStoredValues(config);
  setListeners(config);
  setStyles(config);

  // Done
  console.log("Initialised");
}

document.addEventListener("load", init());
