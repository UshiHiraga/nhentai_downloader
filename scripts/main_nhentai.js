// const PagesData = {
//     type: "jpg" | "png" | "gif" | "webp",
//     width: Number,
//     heigth: Number,
//     orientation: "vertical" | "horizontal" | "square"
// }

// const DoujinData = {
//     repo_id: String,
//     media_id: String,
//     title: String,
//     num_pages: Number,
//     pages: Array
// }

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
            orientation: orientation
        }
    };
    const scripts_array = Array.from(document.querySelectorAll("script"));
    let script_text = scripts_array.find((e) => e.innerText.includes("window._gallery")).innerText;
    if (!script_text) throw new Error("No pudimos encontrar los datos.");
    script_text = script_text.replace("window._gallery = JSON.parse(\"", "").replace("\");", "");
    script_text = script_text.replace(/\\u0022/g, "\"").replace(/\n/g, "").replace(/\t/g, "");
    const original_data = JSON.parse(script_text);

    return {
        repo_id: original_data.id,
        media_id: original_data.media_id,
        title: original_data.title.pretty,
        num_pages: original_data.num_pages,
        pages: original_data.images.pages.map(ConvertOriginalToImage)
    };
}

function Main() {

    a.parentElement.appendChild(b);
    console.log("Aquí");
}

Main();