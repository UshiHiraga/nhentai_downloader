import * as proba from "./worker.js"
const main_image = document.querySelector("img.lazyload");
function Main() {
    console.log(main_image);
    console.log(proba.hola);
}
function GetMetadata() {
    var _a;
    const scripts_tags = Array.from(document.querySelectorAll("script"));
    let data_script = (_a = scripts_tags.find((e) => e.innerText.includes("window._gallery"))) === null || _a === void 0 ? void 0 : _a.innerText;
    data_script = data_script === null || data_script === void 0 ? void 0 : data_script.replace("window._gallery = JSON.parse(\"", "").replace("\");", "");
    data_script = data_script === null || data_script === void 0 ? void 0 : data_script.replace(/\\u0022/g, "\"").replace(/\n/g, "").replace(/\t/g, "");
    let data_json = JSON.parse(String(data_script));
    return data_json;
}
Main();
export {};
