function MultipleLoadImage(imageUrl) {
    function load() {
        this.currentAttempt++;
        this.setAttribute("src", this.expectedUrl);
    };

    function onSuccessHandler() {
        this.removeEventListener("load", onSuccessHandler);
        this.removeEventListener("error", onErrorHandler);
        window.dispatchEvent(new Event("DoujinImageLoaded"));
        console.log("Image has loaded.");
        return true;
    };

    function onErrorHandler() {
        if (this.currentAttempt > this.maxNumberAttempts) {
            this.removeEventListener("load", onSuccessHandler);
            this.removeEventListener("error", onErrorHandler);
            window.dispatchEvent(new Event("DoujinImagesFailed"));
            throw new Error("Maximum number of attempts exceeded.");
        }

        console.warn(`Attempt ${this.currentAttempt} has failed. Retrying.`)
        load();
        return true;
    }

    const imageElement = document.createElement("img");
    imageElement.expectedUrl = String(imageUrl);
    imageElement.maxNumberAttempts = 10;
    imageElement.currentAttempt = 0;
    imageElement.load = load;
    imageElement.addEventListener("load", onSuccessHandler);
    imageElement.addEventListener("error", onErrorHandler);

    return imageElement;
}

function closeDoujinAndPrint() {
    const last_page_url = `/resources/pages/${chrome.i18n.getMessage("language_code")}/last_page.png`;

    const last_page_element = document.createElement("img");
    last_page_element.classList.add("doujin_page_image", "vertical");
    last_page_element.setAttribute("src", chrome.runtime.getURL(last_page_url));
    document.body.appendChild(last_page_element);

    last_page_element.addEventListener("load", () => window.print());
    return true;

}

function loadNextImage() {
    window.last_image_index++;
    if (window.last_image_index > doujin_data.pages.length) {
        closeDoujinAndPrint();
        return true;
    };

    const base_link = "https://i.nhentai.net";
    const page_data = doujin_data.pages[window.last_image_index - 1];
    const url = `${base_link}/galleries/${doujin_data.repo_id}/${window.last_image_index}.${page_data.type}`;

    const image_element = MultipleLoadImage(url);
    image_element.classList.add("doujin_page_image", page_data.orientation);
    image_element.load();
    document.body.appendChild(image_element);
    return true;
};

async function Main() {
    const parent_tab = await chrome.runtime.sendMessage({ code: "who-is-my-parent" });
    const storage_data = await chrome.storage.local.get(null);

    window["last_image_index"] = 0;
    window["doujin_data"] = storage_data["request_from_tab_" + parent_tab];
    window.addEventListener("DoujinImageLoaded", loadNextImage);

    document.body.classList.add("body_printable");
    document.title = doujin_data.media_id + "_" + doujin_data.title;
    loadNextImage();
};

Main();