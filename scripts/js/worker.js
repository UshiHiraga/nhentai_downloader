function Installing(){
    console.log("La extensión ha sido instalada.");
};

async function Messages(mensaje){
    if(mensaje[0] == "cerrar_tab"){
        chrome.tabs.remove(mensaje[1]);
        return true
    };

    let ihentai_tab = await chrome.tabs.create({
        "url": "https://i.nhentai.net/descargando-doujin",
        "active": false
    });

    main_trabajos["tab" + ihentai_tab.id] = mensaje;
};

function TabsUpdated(tab_id, cambios, tab){
    if(cambios.status == "complete" && tab.url == "https://i.nhentai.net/descargando-doujin" && tab.status == "complete"){
        console.log("Sí, es nuestra pestaña");

        if(!main_trabajos["tab" + tab_id]){
            chrome.tabs.remove(tab_id);
            throw new Error("No existe un trabajo preparado para esta pestaña.");
        }

        let metodo = main_trabajos["tab" + tab_id][1]
        let send_data = main_trabajos["tab" + tab_id][0];
        delete main_trabajos["tab" + tab_id];
        console.log(send_data);


        let argumentos = {
            target: {tabId: tab_id},
            args: [send_data]
        };

        if(metodo == "normal"){
            argumentos.func = Main_DrawImages_IhentaiPage;
        } else if(metodo == "pdf_make"){
            send_data.tab_closed = tab_id;
            argumentos.func = InIhentaiGeneratePDF;
        };

        chrome.scripting.executeScript(argumentos, function(a){
            console.log("La ejecución ha finalizado.");
        });
    };
};

function InIhentaiGeneratePDF(result){
    const ANCHO_PAGE = result.ancho_pagina;
    const BASE_LINK = "https://i.nhentai.net/galleries/";
    const NORMAL_CODE = result.id;
    const PDF_TITLE = result.title.pretty;
    const PAGES_NUM = result.num_pages;
    const PAGES_INFO = result.images.pages;
    const MEDIA_ID = result.media_id;
    const AUTHOR = "Hola";

    // Añadimos los datos básicos.
    let i = 1;
    let doc_definition = {
        info: {
            title: NORMAL_CODE + "_" + PDF_TITLE,
            creator: AUTHOR
        },
        pageSize: {
            width: ANCHO_PAGE,
            height: "auto"
        },
        pageMargins: [0, 0, 0, 0],
        content: [],
        images: {
            final_image: chrome.i18n.getMessage("imagen_final_data")
        }
    };   

    // Ponemos el título de la página.
    document.title = NORMAL_CODE + "_" + PDF_TITLE;

    // Creamos la pantalla de carga.
    let big_div = document.createElement("dialog");
    big_div.setAttribute("id", "splash");
    document.body.appendChild(big_div);
    big_div.showModal();

    // Añadimos el texto.
    big_div.innerText = chrome.i18n.getMessage("cargando_texto", [i, PAGES_NUM]);
    big_div.innerText += "\n" + chrome.i18n.getMessage("info_alerta_no_cerra_pestanna");
    big_div.innerText += "\n" + chrome.i18n.getMessage("alerta_demora_trabajo");
  

    function ErrorImagen(e){
        console.error("Hubo un error al cargar la imagen.");
        e.target.setAttribute("src", chrome.i18n.getMessage("image_nopage_data"));
    }

    function CargaImagen(e){
        // Retiramos el evento de carga de esa imagen.
        console.log("La imagen " + e.target.id + " cargó");
        e.target.removeEventListener("load", function(){
            console.log("Evento retirado.");
        });
        e.target.removeEventListener("error", function(){
            console.log("Evento retirado.");
        });

        // Aumentamos el índice de la imagen actual.
        i += 1;
        let img = document.createElement("img");

        // Texto del div.
        big_div.innerText = chrome.i18n.getMessage("cargando_texto", [i, PAGES_NUM]);
        big_div.innerText += "\n" + chrome.i18n.getMessage("info_alerta_no_cerra_pestanna");
        big_div.innerText += "\n" + chrome.i18n.getMessage("alerta_demora_trabajo");

        // La añadimos a la definición del documento.
        doc_definition.images[e.target.id] = e.target.getAttribute("src");
        doc_definition.content.push({
            image: e.target.id,
            width: ANCHO_PAGE,
            pageBreak: "after",
        });


        if(i > PAGES_NUM){
            // Cuando hemos llegado a la imagen final.
           doc_definition.content.push({
                image: "final_image",
                width: ANCHO_PAGE,
            });

            big_div.innerText = chrome.i18n.getMessage("info_generando_archivo");
            pdfMake.createPdf(doc_definition).download(NORMAL_CODE + "_" + PDF_TITLE + ".pdf", function(a){
                big_div.innerText = chrome.i18n.getMessage("info_trabajo_finalizado");
                chrome.runtime.sendMessage(["cerrar_tab", result.tab_closed]);
            });

            return true;
        };
    
        // Le damos los valores a la nueva imagen.
        img.setAttribute("id", "imagen_getted_" + i);
        img.addEventListener("load", CargaImagen);
        img.addEventListener("error", ErrorImagen);

        if(PAGES_INFO[i - 1].t == "j"){
            img.setAttribute("src", BASE_LINK + MEDIA_ID + "/" + i + ".jpg");
        } else if (PAGES_INFO[i - 1].t == "p"){
            img.setAttribute("src", BASE_LINK + MEDIA_ID + "/" + i + ".png");
        } else if(PAGES_INFO[i - 1].t == "g"){
            img.setAttribute("src", chrome.i18n.getMessage("image_gif_image"));
        };
    }

    // Creamos la primer imagen.
    let img = document.createElement("img");
    img.setAttribute("id", "imagen_getted_" + i);
    img.addEventListener("load", CargaImagen);
    img.addEventListener("error", ErrorImagen);

    // Revisamos si es jpg o png.
    if(PAGES_INFO[i - 1].t == "j"){
        img.setAttribute("src", BASE_LINK + MEDIA_ID + "/1.jpg");
    } else if(PAGES_INFO[i - 1].t == "p"){
        img.setAttribute("src", BASE_LINK + MEDIA_ID + "/1.png");
    } else if(PAGES_INFO[i - 1].t = "g"){
        img.setAttribute("src", chrome.i18n.getMessage("image_gif_image"));
    }
};

function Main_DrawImages_IhentaiPage(result){
    const BASE_LINK = "https://i.nhentai.net/galleries/";
    const NORMAL_CODE = result.id;
    const PDF_TITLE = result.title.pretty;
    const PAGES_NUM = result.num_pages;
    const PAGES_INFO = result.images.pages;
    const MEDIA_ID = result.media_id;
    // Añadimos los datos básicos.
    let i = 1;
  
    // Ponemos el título de la página.
    document.title = NORMAL_CODE + "_" + PDF_TITLE;
    document.body.classList.add("body_generate_images");

    // Creamos la pantalla de carga.
    let popup = document.createElement("dialog");
    popup.setAttribute("id", "splash");
    document.body.appendChild(popup);
    popup.showModal();

    // Añadimos el texto.
    popup.innerText = chrome.i18n.getMessage("cargando_texto", [i, PAGES_NUM])
    popup.innerText += ("\n" + chrome.i18n.getMessage("seleccionar_impresora_mensaje"))
    popup.innerText += ("\n" + chrome.i18n.getMessage("alerta_demora_trabajo"));
   
    // Creamos la primer imagen.
    let img = document.createElement("img");
    img.setAttribute("id", "imagen_getted_" + i);
    img.setAttribute("title", "Imagen Nro. " + i + " del doujin.");
    img.setAttribute("alt", "Imagen Nro. " + i + " del doujin.");
    img.classList.add("images_getted_extension_work");
    img.addEventListener("load", CargaImagen);
    img.addEventListener("error", ErrorImagen);

    // Revisamos si es jpg o png.
    if(PAGES_INFO[i - 1].t == "j"){
        img.setAttribute("src", BASE_LINK + MEDIA_ID + "/1.jpg");
    } else if(PAGES_INFO[i - 1].t == "p"){
        img.setAttribute("src", BASE_LINK + MEDIA_ID + "/1.png");
    } else if(PAGES_INFO[i - 1].t == "g"){
        img.setAttribute("src", chrome.i18n.getMessage("image_gif_image"));
    }

    // Revisamos si está en retrato o pánoramica.
    if(PAGES_INFO[i-1].h > PAGES_INFO[i-1].w){
        img.classList.add("vertical")
    } else if(PAGES_INFO[i - 1].w > PAGES_INFO[i - 1].h){
        img.classList.add("horizontal")
    };

    document.body.appendChild(img);
    function ErrorImagen(e){
        console.error("Hubo un error al cargar la imagen.");
        e.target.setAttribute("src", chrome.i18n.getMessage("image_nopage_data"));
    }

    function CargaImagen(e){
        // Retiramos el evento de carga de esa imagen.
        console.log("La imagen " + e.target.id + " cargó");
        e.target.removeEventListener("load", function(){
            console.log("Evento retirado.");
        });
        e.target.removeEventListener("error", function(){
            console.log("Evento retirado.");
        });

        // Aumentamos el índice de la imagen actual.
        i += 1;
        let img = document.createElement("img");
        if(i > PAGES_NUM){
            img.setAttribute("src", chrome.i18n.getMessage("imagen_final_data"));
            img.classList.add("images_getted_extension_work");
            img.classList.add("vertical");
            document.body.appendChild(img);
            img.onload = function(){
                popup.close();
                window.print();
            };
            return true;
        };
    
        // Le damos los valores a la nueva imagen.
        img.setAttribute("id", "imagen_getted_" + i);
        img.setAttribute("title", "Imagen Nro. " + i + " del doujin.");
        img.setAttribute("alt", "Imagen Nro. " + i + " del doujin.");
        img.classList.add("images_getted_extension_work");
        img.addEventListener("load", CargaImagen);
        img.addEventListener("error", ErrorImagen);

        if(PAGES_INFO[i - 1].t == "j"){
            img.setAttribute("src", BASE_LINK + MEDIA_ID + "/" + i + ".jpg");
        } else if (PAGES_INFO[i - 1].t == "p"){
            img.setAttribute("src", BASE_LINK + MEDIA_ID + "/" + i + ".png");
        } else if(PAGES_INFO[i - 1].t == "g"){
            img.setAttribute("src", chrome.i18n.getMessage("image_gif_image"));
        };

        // Revisamos si está en retrato o pánoramica.
        if(PAGES_INFO[i-1].h > PAGES_INFO[i-1].w){
            img.classList.add("vertical")
        } else if(PAGES_INFO[i - 1].w > PAGES_INFO[i - 1].h){
            img.classList.add("horizontal")
        };
        document.body.appendChild(img);

        // Actualizamos el texto.
        popup.innerText = chrome.i18n.getMessage("cargando_texto", [i, PAGES_NUM]);
        popup.innerText += "\n" + chrome.i18n.getMessage("seleccionar_impresora_mensaje");
        popup.innerText += "\n" + chrome.i18n.getMessage("alerta_demora_trabajo");
    }
};

let main_trabajos = {};
chrome.tabs.onUpdated.addListener(TabsUpdated);
chrome.runtime.onMessage.addListener(Messages);
// Diseñado por Ushi Hiraga División Aikawa.
// https://sites.google.com/view/ushihiraga/p%C3%A1gina-principal
// Creado el 18 de agosto del 2021.