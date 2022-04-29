"use strict";
function Installed() {
    console.log("La extensión ha sido instalada.");
}
chrome.runtime.onInstalled.addListener(Installed);
