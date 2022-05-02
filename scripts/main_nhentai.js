function GetMetadataAndTransform() {
    function ConvertOriginalToImage(e) {
        let type = "jpg";
        let orientation = "square";
        switch (e.t) {
            case "j": type = "jpg"; break;
            case "p": type = "png"; break;
            case "g": type = "gif"; break;
        }

        if (e.w < e.h) orientation = "vertical"
        else if (e.h < e.w) orientation = "horizontal"

        return {
            type,
            width: e.w,
            heigth: e.h,
            orientation
        };
    };
    const scripts_array = Array.from(document.querySelectorAll("script"));
    let script_text = scripts_array.find((e) => e.innerText.includes("window._gallery")).innerText;
    if (!script_text) throw new Error("No pudimos encontrar los datos.");
    script_text = script_text.replace("window._gallery = JSON.parse(\"", "").replace("\");", "");
    script_text = script_text.replace(/\\u0022/g, "\"").replace(/\n/g, "").replace(/\t/g, "");
    const original_data = JSON.parse(script_text);

    return {
        repo_id: String(original_data.media_id),
        media_id: String(original_data.id),
        title: String(original_data.title.pretty),
        num_pages: original_data.num_pages,
        pages: original_data.images.pages.map(ConvertOriginalToImage)
    };
};

async function GenerateDownload() {
    await chrome.runtime.sendMessage({ code: "generate-download-doujin", data: GetMetadataAndTransform() });
    console.log("Este doujin se ha puesto en cola de espera");
    return true;
};

function Main() {
    //Cambiamos el botón de descarga por defecto.
    const actual_button = document.getElementById("download");
    actual_button.innerText = chrome.i18n.getMessage("generate_download_nhentai");
    actual_button.classList.toggle("btn-disabled");
    actual_button.addEventListener("click", GenerateDownload);

    // Añadimos el nuevo botón de descarga.
    const new_big_button = document.createElement("h1");
    new_big_button.classList.add("btn", "btn-primary", "extension_download_button");
    new_big_button.innerText = chrome.i18n.getMessage("generate_download_nhentai");
    new_big_button.addEventListener("click", GenerateDownload);
    document.getElementById("cover").insertAdjacentElement("afterbegin", new_big_button);
};

Main();