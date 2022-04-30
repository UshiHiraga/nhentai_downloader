async function Main() {
    const parent_tab = await chrome.runtime.sendMessage({ code: "who-is-my-parent" });
    const storage_data = await chrome.storage.local.get(null);

    const doujin_data = storage_data["request_from_tab_" + parent_tab].doujin_information;
    document.title = doujin_data.media_id + "_" + doujin_data.title;

    // repo_id: original_data.id,
    // media_id: original_data.media_id,
    // title: original_data.title.pretty,
    // num_pages: original_data.num_pages,
    // pages: original_data.images.pages.map(ConvertOriginalToImage)
}



Main();