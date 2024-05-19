function checkDarkMode() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

async function sendDarkThemeMessage() {
  const config = (await chrome.storage.local.get("config")).config;

  await chrome.runtime.sendMessage({
    action: "checkDarkMode",
    isDarkMode: checkDarkMode(),
    config: config,
  });
}

sendDarkThemeMessage();

setInterval(async () => {
  sendDarkThemeMessage();
}, 60000);
