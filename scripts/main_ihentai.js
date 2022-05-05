function MultipleLoadImage(imageUrl) {
    const imageElement = document.createElement("img");

    //Definimos las propiedades.
    imageElement.expectedUrl = String(imageUrl);
    imageElement.maxNumberAttempts = 10;
    imageElement.currentAttempt = 0;

    // Definimos los métodos.
    imageElement.load = function () {
        console.log(this);
        this.currentAttempt++;
        this.setAttribute("src", this.expectedUrl);
    };

    imageElement.onSuccessHandler = function () {
        this.removeEventListener("load", this.onSuccessHandler);
        this.removeEventListener("error", this.onErrorHandler);
        window.dispatchEvent(new CustomEvent("DoujinImageLoaded", { detail: { element: this } }));
        console.log("Image has loaded.");
        return true;
    };

    imageElement.onErrorHandler = function () {
        if (this.currentAttempt > this.maxNumberAttempts) {
            this.removeEventListener("load", this.onSuccessHandler);
            this.removeEventListener("error", this.onErrorHandler);
            window.dispatchEvent(new CustomEvent("DoujinImagesFailed", { detail: { element: this } }));
            throw new Error("Maximum number of attempts exceeded.");
        }

        console.log(this);
        console.warn(`Attempt ${this.currentAttempt} has failed. Retrying.`)
        this.load();
        return true;
    }

    imageElement.initializateEvents = function () {
        this.addEventListener("load", this.onSuccessHandler);
        this.addEventListener("error", this.onErrorHandler);
    }

    imageElement.initializateEvents();
    return imageElement;
}

function createDialogElement() {
    const dialog = document.createElement("dialog");
    dialog.classList.add("splash_dialog");

    //Definimos los métodos.
    dialog.updateTitle = function () {
        const texto = chrome.i18n.getMessage("current_image_title", [window.last_image_index, doujin_data.pages.length]);
        main_title.innerText = texto;
        return true;
    };

    const big_div = document.createElement("div");
    const main_title = document.createElement("p");
    main_title.classList.add("main_title");
    main_title.innerText = chrome.i18n.getMessage("current_image_title", [0, doujin_data.pages.length]);
    big_div.appendChild(main_title);

    const a = document.createElement("p");
    a.innerText = chrome.i18n.getMessage("do_not_close_tab");
    big_div.appendChild(a);

    const b = document.createElement("p");
    b.innerText = chrome.i18n.getMessage("duration_warning");
    big_div.appendChild(b);

    dialog.appendChild(big_div);
    return dialog;
};

function getLocalImage(image_code) {
    const image_url = `/resources/pages/${chrome.i18n.getMessage("language_code")}/${image_code}.png`
    return chrome.runtime.getURL(image_url);
}

function loadNextImage() {
    window.last_image_index++;
    if (window.last_image_index > doujin_data.pages.length) {
        const last_page_element = document.createElement("img");
        last_page_element.classList.add("doujin_page_image", "vertical");
        last_page_element.setAttribute("src", getLocalImage("last_page"));
        last_page_element.addEventListener("load", () => {
            window.main_splash.close();
            window.print()
        });
        document.body.appendChild(last_page_element);
        return true;
    };

    window.main_splash.updateTitle();
    const base_link = "https://i.nhentai.net";
    const page_data = doujin_data.pages[window.last_image_index - 1];
    const url = `${base_link}/galleries/${doujin_data.repo_id}/${window.last_image_index}.${page_data.type}`;

    const image_element = MultipleLoadImage(url);
    image_element.classList.add("doujin_page_image", page_data.orientation);
    image_element.load();
    document.body.appendChild(image_element);
    return true;
};

function imageFailed(e) {
    console.error("La carga de una imagen falló");
    document.body.removeChild(e.detail.element);

    const image_element = MultipleLoadImage(getLocalImage("no_page"));
    image_element.classList.add("doujin_page_image", "vertical");
    image_element.load();
    document.body.appendChild(image_element);
    return true;
};

async function Main() {
    const parent_tab = await chrome.runtime.sendMessage({ code: "who-is-my-parent" });
    const storage_data = await chrome.storage.local.get(null);

    if (!parent_tab) await chrome.runtime.sendMessage({ code: "close-this-tab" });

    window["doujin_data"] = storage_data["request_from_tab_" + parent_tab];
    window["last_image_index"] = 0;
    window.addEventListener("DoujinImageLoaded", loadNextImage);
    window.addEventListener("DoujinImagesFailed", imageFailed);

    window["main_splash"] = createDialogElement();
    document.body.appendChild(window.main_splash);
    window.main_splash.showModal();

    document.body.classList.add("body_printable");
    document.title = doujin_data.media_id + "_" + doujin_data.title;
    loadNextImage();
};

Main();