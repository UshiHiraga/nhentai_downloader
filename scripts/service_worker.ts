function Installed(): void {
    console.log("La extensión ha sido instalada.");
}

chrome.runtime.onInstalled.addListener(Installed);