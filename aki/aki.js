import {
  getBookmarks,
  getStorage,
  goto,
  searchEngines,
  setStyles,
} from "../lib/commons.js";

/**
 * @type {HTMLImageElement}
 */
let wallpaper;
/**
 * @type {HTMLHeadingElement}
 */
let greeting;
/**
 * @type {HTMLInputElement}
 */
let search;
/**
 * @type {HTMLDivElement}
 */
let bookmark_container;

/**
 * Generates the appropiate greeting for the time of day
 * @returns {string} Greeting shown in the page
 */
function setGreeting(config) {
  const hour = new Date().getHours();
  let timeOfDayString;
  if (hour < 7 || hour > 19) {
    timeOfDayString = "Good night";
  } else if (hour < 13) {
    timeOfDayString = "Good morning";
  } else if (hour < 18) {
    timeOfDayString = "Good afternoon";
  } else {
    timeOfDayString = "Good evening";
  }

  if (config.nickname !== "") {
    return `${timeOfDayString}, ${config.nickname}!`;
  } else {
    return `${timeOfDayString}!`;
  }
}

function calculateRowSize(bookmarkNum) {
  const width = bookmark_container.getBoundingClientRect().width;
  const bookmarkMinSize = 8 * 16;

  const maxColumns = Math.floor(width / bookmarkMinSize) - 1;
  const elementsInRow = Math.min(maxColumns, bookmarkNum);

  return elementsInRow;
}

/**
 * Updates the page with data from the extesion
 */
function updatePage(config, makeBookmarks) {
  setStyles(config);

  if (makeBookmarks) {
    getBookmarks()
      .then((bookmarks) => {
        bookmarks.slice(0, 8);
        for (let i = 0; i < bookmarks.length; i++) {
          generateBookmark(
            bookmarks[i].title,
            bookmarks[i].favicon,
            bookmarks[i].url,
            i,
            calculateRowSize(bookmarks.length)
          );
        }
      })
      .catch((error) => {
        console.error("Error retrieving bookmarks:", error);
      });
  }

  if (
    config.style[config.currentActiveStyle].wallpaper.enabled &&
    config.style[config.currentActiveStyle].wallpaper.url
  ) {
    wallpaper.src = config.style[config.currentActiveStyle].wallpaper.url;
    wallpaper.style.display = "block";
  } else {
    wallpaper.style.display = "none";
  }

  greeting.innerText = setGreeting(config);
  search.placeholder = "Search with " + searchEngines[config.searchEngine].name;
}

function setListeners(config) {
  search.addEventListener("keydown", (event) => {
    if (event.code === "Enter") {
      event.preventDefault();
      goto(config, event.target.value);
    }
  });
}

/**
 * Generates a Bookmark and adds it to the page
 * @param {string} name
 * @param {string} icon Icon as a string URL
 * @param {string} url URL for the Bookmark
 */
function generateBookmark(name, icon, url, index, num) {
  let parser = new DOMParser();

  const timeModifier = 0.05;

  const delay = Math.pow((index % num) - (num - 1) / 2, 2) * timeModifier;

  const bookmarkHTMLString = `
    <a href="${url}" class="bookmark" style="animation-delay: ${delay}s">
      <div>
        <img src="${icon}" alt=""/>
      </div>
      <p>${name}</p>
    </a>
  `;

  let bookmark = parser.parseFromString(bookmarkHTMLString, "text/html");

  bookmark_container.appendChild(bookmark.body.firstChild);
}

/**
 * Initialise Page
 */
async function init() {
  wallpaper = document.getElementById("wallpaper");
  greeting = document.getElementById("greeting");
  search = document.getElementById("search");
  bookmark_container = document.getElementById("bookmark-container");

  let config = await getStorage();

  updatePage(config, true);
  setListeners(config);
  getBookmarks(config);

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === "refresh") {
        config = await getStorage();
        updatePage(config, false);
      }
    }
  );

  console.log("Init");
}

document.addEventListener("load", init());
