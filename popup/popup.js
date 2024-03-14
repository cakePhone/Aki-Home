import {
  rgbToHex,
  initStorage,
  updateConfig,
  getStorage,
  setStyles,
} from "../lib/commons.js";

let nickname;
let search_engine;
let accent;
let foreground;
let background;
let wallpaper;
let wp_enabled;
let reset_defaults;

/**
 * Updates the displayed values in settings
 */
function displayStoredValues(config) {
  nickname.value = config.nickname;
  search_engine.selectedIndex = config.searchEngine;
  accent.value = rgbToHex(
    config.style.accent[0],
    config.style.accent[1],
    config.style.accent[2]
  );
  foreground.value = rgbToHex(
    config.style.foreground[0],
    config.style.foreground[1],
    config.style.foreground[2]
  );
  background.value = rgbToHex(
    config.style.background[0],
    config.style.background[1],
    config.style.background[2]
  );
  wp_enabled.checked = config.style.wallpaper.enabled;
}

/**
 * Sets all listeners for the settings
 *
 * @param {object} config
 */
function setListeners(config) {
  nickname.addEventListener("change", (event) =>
    updateConfig(config, "nickname", event.target.value)
  );

  search_engine.addEventListener("change", (event) =>
    updateConfig(config, "search_engine", event.target.value)
  );

  accent.addEventListener("change", (event) =>
    updateConfig(config, "accent", event.target.value)
  );

  foreground.addEventListener("change", (event) =>
    updateConfig(config, "foreground", event.target.value)
  );

  background.addEventListener("change", (event) =>
    updateConfig(config, "background", event.target.value)
  );

  wallpaper.addEventListener("change", (event) =>
    updateConfig(config, "wallpaper", event.target.files[0])
  );

  wp_enabled.addEventListener("change", (event) =>
    updateConfig(config, "wp_enabled", event.target.checked)
  );

  reset_defaults.addEventListener("click", () => {
    if (!confirm("Are you sure you want to reset ALL your settings?")) return;
    initStorage(config);
    displayStoredValues(JSON.parse(localStorage.config));
  });
}

/**
 * Initializes the config and displayed values
 */
function init() {
  // Set settings elements
  nickname = document.getElementById("nickname");
  search_engine = document.getElementById("search-engine");
  accent = document.getElementById("accent");
  foreground = document.getElementById("foreground");
  background = document.getElementById("background");
  wallpaper = document.getElementById("wallpaper");
  wp_enabled = document.getElementById("enable-wallpaper");
  reset_defaults = document.getElementById("reset-defaults");

  let config = getStorage();

  displayStoredValues(config);
  setListeners(config);
  setStyles(config);

  // Done
  console.log("Initialised");
}

document.addEventListener("load", init());
