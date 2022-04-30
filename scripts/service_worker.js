function InstallEventHandler() {
    console.log("La extensión ha sido instalada.");
};

function MessageEventHandler(message, sender, sendResponse) {
    async function CreateTabAndSaveData() {
        const id_sender = sender.tab.id;
        const new_tab_propierties = {
            active: false,
            openerTabId: id_sender,
            url: "https://i.nhentai.net/descargando-doujin"
        };

        await chrome.storage.local.set({ ["request_from_tab_" + id_sender]: message.data })
        await chrome.tabs.create(new_tab_propierties);
        return true;
    };

    async function ReturnTabInfo() {
        const id_opener = sender.tab.openerTabId
        if(id_opener) sendResponse(id_opener);
    }

    switch (message.code) {
        case "generate-download-doujin": CreateTabAndSaveData(); break;
        case "who-is-my-parent": ReturnTabInfo(); break;
    }
}


chrome.runtime.onInstalled.addListener(InstallEventHandler);
chrome.runtime.onMessage.addListener(MessageEventHandler);