function MultipleLoadImage(imageUrl) {
    function load() {
        this.currentAttempt++;
        this.setAttribute("src", this.expectedUrl);
    };

    function onSuccessHandler() {
        this.removeEventListener("load", onSuccessHandler);
        this.removeEventListener("error", onErrorHandler);
        console.log("Image has been loaded.");

        const finishedEvent = new CustomEvent("DoujinImageLoaded", { detail: this })
        window.dispatchEvent(finishedEvent);
        return true;
    };

    function onErrorHandler() {
        if (this.currentAttempt > this.maxNumberAttempts) {
            this.removeEventListener("load", onSuccessHandler);
            this.removeEventListener("error", onErrorHandler);
            const finishedEvent = new CustomEvent("DoujinImagesFailed", { detail: this });
            window.dispatchEvent(finishedEvent);
            throw new Error("Maximum number of attempts exceeded.");
        }

        console.warn(`Attempt ${this.currentAttempt} has failed. Retrying.`)
        this.load();
        return true;
    }

    const imageElement = document.createElement("img");
    imageElement.expectedUrl = String(imageUrl);
    imageElement.maxNumberAttempts = 10;
    imageElement.currentAttempt = 0;
    imageElement.load = load;
    imageElement.onSuccessHandler = onSuccessHandler;
    imageElement.onErrorHandler = onErrorHandler;

    imageElement.addEventListener("load", onSuccessHandler);
    imageElement.addEventListener("error", onErrorHandler);

    return imageElement;
}

function SaveFailedImages(event) {
    console.log(event);
    window["failedImages"].push(event.detail.src);
}



async function Main() {
    function nextImagedLoad(e) {
        console.log(e);
        window.lastImageLoadedIndex++;

        const BASE_LINK = "https://i.nhentai.net/galleries";
        const actual = window.lastImageLoadedIndex;
        if (actual > doujin_data.pages.length) return true;
        console.log(actual);
        const pageData = doujin_data.pages[window.lastImageLoadedIndex - 1];
        const orientation = pageData.orientation;
        const url = `${BASE_LINK}/${doujin_data.repo_id}/${actual}.${pageData.type}`
        console.log(url);
        const image_element = MultipleLoadImage(url);
        image_element.classList.add("doujin_page_image");

        image_element.classList.add((orientation == "horizontal") ? "horizontal" : "vertical")


        document.body.appendChild(image_element);
        image_element.load();
        return true;

    }
    const parent_tab = await chrome.runtime.sendMessage({ code: "who-is-my-parent" });
    const storage_data = await chrome.storage.local.get(null);
    const doujin_data = storage_data["request_from_tab_" + parent_tab].doujin_information;

    document.body.classList.add("body_printable");
    document.title = doujin_data.media_id + "_" + doujin_data.title;
    window.lastImageLoadedIndex = 0;
    console.log(doujin_data);

    window.addEventListener("DoujinImagesFailed", SaveFailedImages);
    window.addEventListener("DoujinImageLoaded", nextImagedLoad)
    nextImagedLoad();

}



Main();