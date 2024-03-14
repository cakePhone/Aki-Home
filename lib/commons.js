let defaults = {
  version: "1.0",
  nickname: "",
  searchEngine: 0,
  style: {
    accent: [67, 92, 235],
    foreground: [62, 62, 62],
    background: [33, 33, 33],
    wallpaper: {
      url: "",
      enabled: true,
    },
  },
  bookmarks: [],
};

let wallpaperURL = "";

export const searchEngines = [
  { name: "Google", url: "https://www.google.com/search?q=" },
  { name: "Bing", url: "https://www.bing.com/search?q=" },
  { name: "Brave", url: "https://search.brave.com/search?q=" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  { name: "Ecosia", url: "https://www.ecosia.org/search?method=index&q=" },
];

/**
 * Initialize the config storage values
 */
export function initStorage() {
  localStorage.setItem("config", JSON.stringify(defaults));
  return localStorage.getItem("config");
}

export function getStorage() {
  let config = localStorage.getItem("config");

  if (config === null) {
    config = initStorage();
  }

  return JSON.parse(config);
}

/**
 * Updates the specific data in LocalStorage
 * @param {object} config Configuration Object
 * @param {string} field Field to change
 * @param {string | number | boolean} data Data to store
 */
export async function updateConfig(config, field, data) {
  switch (field) {
    case "nickname":
      config.nickname = data;
      break;
    case "search_engine":
      config.searchEngine = data;
      break;
    case "accent":
      config.style.accent = hexToRgb(data);
      break;
    case "foreground":
      config.style.foreground = hexToRgb(data);
      break;
    case "background":
      config.style.background = hexToRgb(data);
      break;
    case "wallpaper":
      config.style.wallpaper.url = await updateWallpaper(data);
      break;
    case "wp_enabled":
      config.style.wallpaper.enabled = data;
      break;
    default:
      return;
  }

  localStorage.setItem("config", JSON.stringify(config));
}

/**
 *  Converts RGB values to Hex code
 * @param {number} r Red
 * @param {number} g Green
 * @param {number} b Blue
 * @returns {string} Hex color code
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/**
 * Converts Hex codes to RGB colors
 * @param {string} hex Hex color code
 * @returns {number[]} Red, Green and Blue values
 */
export function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 *  Updates the wallpaper
 * @param {File} wallpaper Wallpaper
 * @returns
 */
export async function updateWallpaper(wallpaper) {
  try {
    const base64 = await imageToBase64(wallpaper);
    return base64;
  } catch (error) {
    alert(error);
    return;
  }
}

export function imageToBase64(image) {
  return new Promise((resolve, reject) => {
    if (!image) {
      reject("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (image.size > 4.5 * 1000000) reject("File Too Big");
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject("Error reading file");
    };
    reader.readAsDataURL(image);
  });
}

/**
 * Gets the best contrast ratio color
 * @param {number} r Red
 * @param {number} g Green
 * @param {number} b Blue
 * @returns
 */
export function getContrastColor(r, g, b) {
  // Ensure that RGB values are in the range of 0 to 255
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Calculate brightness using the YIQ formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  const betterContrast = brightness >= 128 ? "#000000" : "#FFFFFF";

  // Return black or white depending on the brightness
  return hexToRgb(betterContrast);
}

/**
 * Sets the root variable styles
 * @param {object} config
 */
export function setStyles(config) {
  let root = document.documentElement;

  root.style.setProperty("--accent", config.style.accent);
  root.style.setProperty("--foreground", config.style.foreground);
  root.style.setProperty("--background", config.style.background);

  root.style.setProperty(
    "--on-accent",
    getContrastColor(
      config.style.accent[0],
      config.style.accent[1],
      config.style.accent[2]
    )
  );
  root.style.setProperty(
    "--on-foreground",
    getContrastColor(
      config.style.foreground[0],
      config.style.foreground[1],
      config.style.foreground[2]
    )
  );
  root.style.setProperty(
    "--on-background",
    getContrastColor(
      config.style.background[0],
      config.style.background[1],
      config.style.background[2]
    )
  );
}

export function goto(config, input) {
  if (/^\s*$/.test(input)) return;
  const isValidUrl = (urlString) => {
    var urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // validate fragment locator

    return !!urlPattern.test(urlString);
  };

  if (isValidUrl(input)) {
    if (input.startsWith("https://") || input.startsWith("http://")) {
      window.location.href = input;
    } else {
      window.location.href = encodeURI("https://" + input);
    }
  } else {
    window.location.href =
      searchEngines[config.searchEngine].url + encodeURIComponent(input);
  }
}

// Function to retrieve bookmarks and process them
export function getBookmarks() {
  return new Promise((resolve, reject) => {
    if (!chrome) {
      console.log("Failed");
      reject("Chrome API not available");
      return;
    }

    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      // Process the bookmark tree nodes
      const bookmarks = processBookmarks(bookmarkTreeNodes);
      resolve(bookmarks);
    });
  });
}

// TODO: Handle the fetching of data
// Function to process bookmarks recursively
function processBookmarks(bookmarkNodes) {
  let bookmarks = [];

  bookmarkNodes.forEach(function (node) {
    if (node.children) {
      // If the node has children, recursively process them
      bookmarks.push(...processBookmarks(node.children));
    } else {
      // If the node is a bookmark, parse its content
      bookmarks.push(parseBookmark(node));
    }
  });

  return bookmarks;
}

// Function to parse bookmark content
function parseBookmark(bookmarkNode) {
  // Access bookmark details, e.g., title, URL, etc.
  let title = bookmarkNode.title.slice(0, 17) + "...";
  let url = bookmarkNode.url;
  let favicon = `https://s2.googleusercontent.com/s2/favicons?sz=256&domain_url=${url}`;

  return { title, url, favicon };
}
