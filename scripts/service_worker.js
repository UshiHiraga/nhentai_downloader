function InstallEventHandler() {
    const default_configuration = {
        "generateMethod": "normal",
        "autoDownload": false,
        "maxAttemptNumber": 10,
    };

    chrome.storage.local.set({"config": default_configuration});
    console.log("La extensión ha sido instalada.");
    return true;
};

function MessageEventHandler(message, sender, sendResponse) {
    async function CreateTabAndSaveData() {
        const id_sender = sender.tab.id;
        const new_tab_propierties = {
            active: false,
            openerTabId: id_sender,
            url: "https://i.nhentai.net/generando-doujin"
        };

        await chrome.storage.local.set({ ["request_from_tab_" + id_sender]: message.data })
        await chrome.tabs.create(new_tab_propierties);
        return true;
    };

    async function ReturnTabInfo() {
        const id_parent_tab = sender.tab.openerTabId;
        if (id_parent_tab) sendResponse(id_parent_tab);
        else sendResponse(null);
    };

    async function KillTab(){
        await chrome.tabs.remove(sender.tab.id);
    }

    switch (message.code) {
        case "generate-download-doujin": CreateTabAndSaveData(); break;
        case "who-is-my-parent": ReturnTabInfo(); break;
        case "close-this-tab": KillTab(); break;
    };
};

chrome.runtime.onInstalled.addListener(InstallEventHandler);
chrome.runtime.onMessage.addListener(MessageEventHandler);