import {
  getBookmarks,
  getStorage,
  goto,
  searchEngines,
  setStyles,
} from "../lib/commons.js";

let config = getStorage();

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
function setGreeting() {
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
function updatePage() {
  setStyles(config);

  getBookmarks()
    .then((bookmarks) => {
      bookmarks.slice(0, 8);
      for (let i = 0; i < bookmarks.length; i++) {
        generateBookmark(
          bookmarks[i].title,
          bookmarks[i].favicon,
          bookmarks[i].url,
          i,
          calculateRowSize(bookmarks.length - 1)
        );
      }
    })
    .catch((error) => {
      console.error("Error retrieving bookmarks:", error);
    });

  if (config.style.wallpaper.enabled && config.style.wallpaper.url) {
    wallpaper.src = config.style.wallpaper.url;
  } else {
    wallpaper.style.display = "none";
  }

  greeting.innerText = setGreeting();
  search.placeholder = "Search with " + searchEngines[config.searchEngine].name;
}

function setListeners() {
  search.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
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

  const delay = Math.pow((index % num) - num / 2, 2) * 0.05;

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
function init() {
  wallpaper = document.getElementById("wallpaper");
  greeting = document.getElementById("greeting");
  search = document.getElementById("search");
  bookmark_container = document.getElementById("bookmark-container");

  updatePage();
  setListeners();
  getBookmarks();

  console.log("Init");
}

document.addEventListener("load", init());
