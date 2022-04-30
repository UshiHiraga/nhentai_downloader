function Main(){
    // Revisamos los valores previos.
    if(!localStorage.getItem("get_with_pdfmaker")){
        localStorage.setItem("get_with_pdfmaker", "0");
    }
    if(!localStorage.getItem("automatic_download_doujin")){
        localStorage.setItem("automatic_download_doujin", "0");
    };

    const BUTTON_DOWNLOAD = document.getElementById("download");
    // Cambiamos el texto del botón descargar que ya trae la página.
    BUTTON_DOWNLOAD.classList.toggle("btn-disabled");
    BUTTON_DOWNLOAD.classList.add("download_button_extension_added");
    BUTTON_DOWNLOAD.innerText = chrome.i18n.getMessage("button_download_nhentai_text");
    BUTTON_DOWNLOAD.addEventListener("click", GetDataAndDownload);


    let boton = BUTTON_DOWNLOAD.cloneNode(true);
    boton.classList.remove("download_button_extension_added");
    boton.innerText = chrome.i18n.getMessage("mensaje_opciones_descarga");
    boton.setAttribute("id", "proba_id");
    boton.addEventListener("click", function(){
        document.getElementById("opciones_descarga").showModal();
    });
    BUTTON_DOWNLOAD.parentElement.appendChild(boton);

    // Añadimos el botón de descarga.
    const COVER_SECTION = document.getElementById("cover");
    let boton_main = document.createElement("h1");
    boton_main.classList.add("btn", "btn-primary", "tooltip");
    boton_main.classList.add("download_button_extension_added");
    boton_main.innerText = chrome.i18n.getMessage("button_download_nhentai_text");
    boton_main.setAttribute("id", "button_downloader_extension");
    boton_main.addEventListener("click", GetDataAndDownload);
    COVER_SECTION.appendChild(boton_main);

    // Añadimos el diálogo de las opciones y le añadimos las opciones.
    document.body.appendChild(CreateDialogItem("opciones_descarga", chrome.i18n.getMessage("mensaje_opciones_descarga")));
    let padre = document.querySelector("#opciones_descarga .contenidoDialog");
    padre.appendChild(CreateCheckItem("get_with_pdfmaker", chrome.i18n.getMessage("label_descargar_con_pdfmake")));
    padre.appendChild(CreateCheckItem("automatic_download_doujin", chrome.i18n.getMessage("label_descargar_automaticamente")));

    if(localStorage.getItem("automatic_download_doujin") == true){BUTTON_DOWNLOAD.click()};
}

function GetDataAndDownload(){
    // Cambiamos el mientras se ejecuta el evento.
    let elements = document.querySelectorAll(".download_button_extension_added");
    elements.innerTextToAll(chrome.i18n.getMessage("mensaje_descargando_boton"));
    elements.toggleClassToAll("btn-disabled");
    elements.removeToAllEventListener("click", function(){
        console.log("Evento retirado.");
    });

    //Conseguimos los datos.


    function Comprobation(e){
        return e.h > e.w;
    };
    if(script.num_pages > 150){
        console.log("Joder, este doujin es muy largo. ¿No crees, mi amigo?");
    };
    if(localStorage.getItem("get_with_pdfmaker") == true && !script.images.pages.every(Comprobation)){
        console.warn("Crear los PDF por medio de PDFMake, en este caso, podría generar problemas de representación.");
    };

    let metodo = "normal";
    if(localStorage.getItem("get_with_pdfmaker") == true){
        script.ancho_pagina = 300;
        metodo = "pdf_make";
    };

    chrome.runtime.sendMessage([script, metodo], function(){
        elements.addToAllEventListener("click", GetDataAndDownload);
        elements.innerTextToAll(chrome.i18n.getMessage("button_download_nhentai_text"));
        elements.toggleClassToAll("btn-disabled");
    });
}

function CreateDialogItem(id, titulo){
    // Función que crea el elemento dialog.
    let actual_div, button, big_dialog;

    big_dialog = document.createElement("dialog");
    big_dialog.setAttribute("id", id);
    big_dialog.classList.add("d");

    actual_div = document.createElement("div");
    actual_div.classList.add("titleDialog");

    button = document.createElement("button");
    button.classList.add("titleText");
    button.innerText = titulo;
    actual_div.appendChild(button);

    button = document.createElement("button");
    button.addEventListener("click", function(){
        document.getElementById(id).close();
    })
    button.innerText = "X";
    actual_div.appendChild(button);
    big_dialog.appendChild(actual_div);

    actual_div = document.createElement("div");
    actual_div.classList.add("contenidoDialog");
    big_dialog.appendChild(actual_div);
    return big_dialog
};

function CreateCheckItem(id, label_text){
    // Crea los elementos check;
    let label = document.createElement("label");
    label.classList.add("chechker_values_label");
    label.innerText = label_text;
    let checher = document.createElement("input");
    checher.addEventListener("change", ChangedValue);
    checher.setAttribute("id", id);
    checher.setAttribute("type", "checkbox");
    label.appendChild(checher);

    if(localStorage.getItem(id) == true){
        checher.setAttribute("checked", "");
    }

    return label;
};

function ChangedValue(e){
    let new_value = e.target.checked;
    switch (e.target.id){
        case "get_with_pdfmaker":
            localStorage.setItem("get_with_pdfmaker", +new_value);
        break;

        case "automatic_download_doujin":
            localStorage.setItem("automatic_download_doujin", +new_value);
        break;

        default:
            throw new Error("Valor desconocido");
        break;
    }
};

function AddPersonalPrototypes(){
    function AddClassToAll(a, nueva_clase){
        console.log(a);
        if(nueva_clase == ""){
            throw new Error("El nombre de la clase a añadir no puede estar vacío.");
        }
        this.forEach(function(e){
            e.classList.add(nueva_clase);
        });
    };
    function RemoveClassToAllElements(changer_clase){
        if(changer_clase == ""){
            throw new Error("El nombre de la clase a retirar no puede estar vacío.");
        }
        this.forEach(function(e){
            e.classList.remove(nueva_clase);
        });
    };
    function AddInnerText(texto){
        this.forEach(function(e){
            e.innerText = texto;
        });
    };
    function ToogleClassList(clase){
        this.forEach(function(e){
            e.classList.toggle(clase);
        });
    };
    function AddAnListenerToAll(tipo, accion, options){
        if(typeof accion !== "function"){
            throw new Error("El parámetro dos no es una función.");
        }
        this.forEach(function(e){
            e.addEventListener(tipo, accion, options);
        });
    };
    function RemoveAnListenerToAll(tipo, accion, options){
        if(typeof accion !== "function"){
            throw new Error("El parámetro dos no es una función.");
        }
        this.forEach(function(e){
            e.removeEventListener(tipo, accion, options);
        });
    };
    NodeList.prototype.addClassToAll = AddClassToAll;
    NodeList.prototype.removeClassToAll = RemoveClassToAllElements;
    NodeList.prototype.toggleClassToAll = ToogleClassList;
    NodeList.prototype.innerTextToAll = AddInnerText;
    NodeList.prototype.addToAllEventListener = AddAnListenerToAll;
    NodeList.prototype.removeToAllEventListener = RemoveAnListenerToAll;
};

AddPersonalPrototypes();
Main();
// Diseñado por Ushi Hiraga División Aikawa.
// https://sites.google.com/view/ushihiraga/p%C3%A1gina-principal
// Creado el 8 de agosto del 2021.