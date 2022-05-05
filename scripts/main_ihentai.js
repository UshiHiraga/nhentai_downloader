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

function createDialogElement() {
    function modifyTitle() {
        console.log(this);
    }
    const dialog = document.createElement("dialog");
    dialog.classList.add("splash_dialog");

    const main_title = document.createElement("p");
    main_title.innerText = chrome.i18n.getMessage("current_image_title", [23, 34]);
    dialog.appendChild(main_title);

    const a = document.createElement("p");
    a.innerText = chrome.i18n.getMessage("do_not_close_tab");
    dialog.appendChild(a);

    const b = document.createElement("p");
    b.innerText = chrome.i18n.getMessage("duration_warning");
    dialog.appendChild(b);

    dialog.changeActualPage = modifyTitle;
    return dialog;
}

function closeDoujinAndPrint() {
    const last_page_element = document.createElement("img");
    last_page_element.classList.add("doujin_page_image", "vertical");
    last_page_element.setAttribute("src", getLocalImage("last_page"));
    document.body.appendChild(last_page_element);

    last_page_element.addEventListener("load", () => window.print());
    return true;

}

function getLocalImage(image_code) {
    const image_url = `/resources/pages/${chrome.i18n.getMessage("language_code")}/${image_code}.png`
    return chrome.runtime.getURL(image_url);
}

function loadNextImage() {
    window.last_image_index++;
    if (window.last_image_index > doujin_data.pages.length) {
        closeDoujinAndPrint();
        return true;
    };

    const base_link = "https://i.nhentai.net";
    const page_data = doujin_data.pages[window.last_image_index - 1];
    let url = `${base_link}/galleries/${doujin_data.repo_id}/${window.last_image_index}.${page_data.type}`;

    if (page_data.type == "gif") url = getLocalImage("gif_page");

    const image_element = MultipleLoadImage(url);
    image_element.classList.add("doujin_page_image", page_data.orientation);
    image_element.load();
    document.body.appendChild(image_element);
    return true;
};

async function Main() {
    const parent_tab = await chrome.runtime.sendMessage({ code: "who-is-my-parent" });
    const storage_data = await chrome.storage.local.get(null);

    document.body.appendChild(createDialogElement());

    window["last_image_index"] = 0;
    window["doujin_data"] = storage_data["request_from_tab_" + parent_tab];
    window.addEventListener("DoujinImageLoaded", loadNextImage);

    document.body.classList.add("body_printable");
    document.title = doujin_data.media_id + "_" + doujin_data.title;
    loadNextImage();
};

Main();