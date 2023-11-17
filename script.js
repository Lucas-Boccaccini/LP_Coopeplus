let prov = document.getElementById("provId");
let localidad = document.getElementById("localidadId");
let rubro = document.getElementById("rubroId");
let mapaVisible = document.getElementById("mapaVisible");
let filtro = document.getElementById("filtro");
let mapa = document.getElementById("map");
let dto10 = document.getElementById("10%");
let dto15 = document.getElementById("15%");
let dto20 = document.getElementById("20%");
let btnClose = document.getElementById("btn-close");

//Ocultar o mostrar el mapa cuando se le hace click al CheckBox
mapaVisible.addEventListener("change", function () {

    if (!mapaVisible.checked) {
        mapa.style.display = "none";
        filtro.style.paddingTop = "10vh";
    } else {
        mapa.style.display = "block";
        filtro.style.paddingTop = "0vh";
    }
});

//#region Configuaracion mapa

var map = L.map('map').setView([-38.7183, -62.2661], 14);
maxZoom: 18,

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }).addTo(map);

// Obtener el control de atribución actual
var attributionControl = map.attributionControl;
attributionControl.setPrefix('Leaflet'),
    attributionControl.addTo(map);

//#endregion
// Objeto para hacer un seguimiento de las localidades procesadas
var provinciasProcesadas = {};
var localidadesProcesadas = {};
var rubrosProcesados = {};
var comerciosFiltrados = [];  // Arreglo para almacenar los comercios filtrados
var selectedProvincia = (prov.options[prov.selectedIndex]).text;
var selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
var selectedRubro = (rubro.options[rubro.selectedIndex]).text;
var lastSelectedProvincia = {};
prov.addEventListener("change", function () {
    selectedProvincia = (prov.options[prov.selectedIndex]).text;
    //CargarFiltro();
    CargarLocalidades();
});
localidad.addEventListener("change", function () {
    selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
    //CargarFiltro();
    CargarRubros();
});
rubro.addEventListener("change", function () {
    selectedRubro = (rubro.options[rubro.selectedIndex]).text;
});

//#region Cargar y analizar el archivo CSV
fetch('./dir.csv')
    .then(function (response) {
        return response.text();
    })
    .then(function (csv) {
        // Analiza los datos CSV en formato JSON
        var jsonData = Papa.parse(csv, { header: true, skipEmptyLines: true });
        // Mapea los datos del CSV a objetos con la misma estructura que los objetos 'comercios'
        var comercios = jsonData.data.map(function (row) {
            return {
                Localidad: row.Localidad,
                Rubro: row.Rubro,
                NomComercio: row.NomComercio,
                Direccion: row.Direccion,
                Prefijo: row.Prefijo,
                NroTel: row.NroTel,
                Dto: row.Dto,
                Latitud: row.Latitud,
                Longitud: row.Longitud,
                Provincia: row.Provincia
            };
        });

        // Recorre el CSV y crea marcadores
        comercios.forEach(function (comercio) {
            //Carga el filtro por primera vez
            // Almacena el comercio filtrado
            comerciosFiltrados.push(comercio);
        });
        // CargarFiltro();
        CargarProvincias();
        CargarLocalidades();
        /*---*/
        CargarComercios();
    })
    .catch(function (error) {
        console.error("Error al cargar el CSV:", error);
    });
//#endregion

// function CargarFiltro() {
//     comerciosFiltrados.forEach(function (comercio) {
//          // // Cargar select de provincias
//     if (!provinciasProcesadas[comercio.Provincia]) {
//         var optionProv = document.createElement("option");
//         optionProv.text = comercio.Provincia;
//         prov.add(optionProv);
//         provinciasProcesadas[comercio.Provincia] = true;
//     }

//     // Cargar select de localidades
//     if (
//         (comercio.Provincia === selectedProvincia) &&
//         !localidadesProcesadas[comercio.Localidad]
//     ) {
//         var optionLoc = document.createElement("option");
//         optionLoc.text = comercio.Localidad;
//         localidad.add(optionLoc);
//         localidadesProcesadas[comercio.Localidad] = true;
//     }

//     // Cargar select de rubros
//     if (
//         (comercio.Provincia === selectedProvincia) &&
//         (comercio.Localidad === selectedLocalidad) &&
//         !rubrosProcesados[comercio.Rubro]
//     ) {
//         var optionRubro = document.createElement("option");
//         optionRubro.text = comercio.Rubro;
//         rubro.add(optionRubro);
//         rubrosProcesados[comercio.Rubro] = true;
//     }
//     });
// }


function CargarProvincias() {
    // Limpia opciones antiguas
    // prov.innerHTML = '<option value="-1"selected>Provincia de Buenos Aires</option>';
    prov.innerHTML = '<option value="-1" disabled selected>Seleccione una provincia</option>';


    // Cargar nuevas opciones de provincias
    comerciosFiltrados.forEach(function (comercio) {
        if (!provinciasProcesadas[comercio.Provincia]) {
            var optionProv = document.createElement("option");
            optionProv.text = comercio.Provincia;
            prov.add(optionProv);
            provinciasProcesadas[comercio.Provincia] = true;
        }
    });
}

function CargarLocalidades() {
    // Limpia opciones antiguas
    localidadesProcesadas = {};
    // localidad.innerHTML = '<option value="-1" disabled selected>BAHÍA BLANCA</option>';
    localidad.innerHTML = '<option value="-1" disabled selected>Seleccione una localidad</option>';

    // Cargar nuevas opciones de localidades
    comerciosFiltrados.forEach(function (comercio) {
        if (
            (comercio.Provincia === selectedProvincia) &&
            !localidadesProcesadas[comercio.Localidad]
        ) {
            var optionLoc = document.createElement("option");
            optionLoc.text = comercio.Localidad;
            localidad.add(optionLoc);
            localidadesProcesadas[comercio.Localidad] = true;

            // Establecer la opción seleccionada en el nuevo valor
            //localidad.value = selectedLocalidad;
        }
    });
}

function CargarRubros() {
    // Limpia opciones antiguas
    var rubrosProcesados = {};
    rubro.innerHTML = '<option value="-1" selected>TODOS</option>';

    // Cargar nuevas opciones de rubros
    comerciosFiltrados.forEach(function (comercio) {
        if (
            (comercio.Provincia === selectedProvincia) &&
            (comercio.Localidad === selectedLocalidad) &&
            !rubrosProcesados[comercio.Rubro]
        ) {
            var optionRubro = document.createElement("option");
            optionRubro.text = comercio.Rubro;
            rubro.add(optionRubro);
            rubrosProcesados[comercio.Rubro] = true;

            // Establecer la opción seleccionada en el nuevo valor
            // rubro.value = selectedRubro;
        }
    });
}

function SetMarker(comercio) {
    var marker = L.marker([comercio.Latitud, comercio.Longitud]).addTo(map);
    //iconos 10% y 15%
    var customIcon = L.icon({
        iconUrl: 'img/' + comercio.Dto + '.jpg',
        iconSize: [40, 32],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    marker.setIcon(customIcon);
    // Contenido personalizado del marcador con valores del comercio
    var contenido =
        '<b>Nombre:</b> ' + comercio.NomComercio + '<br>' +
        '<b>Rubro:</b> ' + comercio.Rubro + '<br>' +
        '<b>Ubicación:</b> ' + comercio.Direccion + '<br>' +
        '<b>Descuento:</b> ' + comercio.Dto + '%<br>' +
        '<b>Teléfono:</b> ' + comercio.Prefijo + ' ' + comercio.NroTel;
    // Asignar el contenido al marcador
    // marker.bindPopup(contenido).openPopup();
    marker.bindPopup(contenido);
}

function CrearCards(comercio) {
    // Crear elementos HTML para la card
    var cardContainer = document.getElementById("cardContainer");

    var cardCol = document.createElement("div");
    cardCol.classList.add("col-lg-3", "col-md-6", "mt-3");

    var card = document.createElement("div");
    card.classList.add("card", "mb-3");

    var cardRow = document.createElement("div");
    cardRow.classList.add("row", "g-0");

    // Añadir el badge de dto
    var dtoBadge = document.createElement("div");
    dtoBadge.style.top = "-0.8rem";
    dtoBadge.style.left = "25%";
    dtoBadge.innerText = comercio.Dto + "%";
    if (comercio.Dto == "15") {
        dtoBadge.classList.add("badge", "bg-primary", "text-white", "position-absolute", "w-50");
    } else {
        dtoBadge.classList.add("badge", "bg-danger", "text-white", "position-absolute", "w-50");
    }

    // Añadir la imagen
    var imgCol = document.createElement("div");
    imgCol.classList.add("col-4", "col-md-12");

    var img = document.createElement("img");
    img.src = "./img/e36258b3c74f08054a974a5fe1703f9c.jpg";
    img.classList.add("img-fluid");
    img.style.height = "200px";
    img.style.width = "300px";
    imgCol.appendChild(img)
    // Añadir el contenido de la card
    var contentCol = document.createElement("div");
    contentCol.classList.add("col-8", "col-md-12");

    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "pt-md-0");

    var comercioTitle = document.createElement("h6");
    comercioTitle.classList.add("fw-bold", "text-truncate", "text-center");
    comercioTitle.innerText = comercio.NomComercio;

    var hr = document.createElement("hr");
    hr.style.border = "1px solid #4273b4";

    var rubroP = document.createElement("p");
    rubroP.classList.add("text-truncate", "mb-1");
    rubroP.innerText = comercio.Rubro;

    var dirP = document.createElement("p");
    dirP.classList.add("text-truncate", "mb-1");
    dirP.innerText = comercio.Direccion;

    var localidadP = document.createElement("p");
    localidadP.classList.add("text-truncate", "mb-1");
    localidadP.innerText = comercio.Localidad;

    var provinciaP = document.createElement("p");
    provinciaP.classList.add("text-truncate", "mb-1");
    provinciaP.innerText = comercio.Provincia;

    var nroTelP = document.createElement("p");
    nroTelP.classList.add("text-truncate", "mb-1");
    nroTelP.style.color = "#5a5c69";
    nroTelP.innerHTML = `<i class="fas fa-phone"></i> ${comercio.Prefijo} ${comercio.NroTel}`;

    // Construir la estructura de la card
    cardBody.appendChild(comercioTitle);
    cardBody.appendChild(hr);
    cardBody.appendChild(rubroP);
    cardBody.appendChild(dirP);
    cardBody.appendChild(localidadP);
    cardBody.appendChild(provinciaP);
    cardBody.appendChild(nroTelP);

    contentCol.appendChild(cardBody);

    cardRow.appendChild(dtoBadge);
    cardRow.appendChild(imgCol);
    cardRow.appendChild(contentCol);

    card.appendChild(cardRow);
    cardCol.appendChild(card);

    // Agregar la card al contenedor
    cardContainer.appendChild(cardCol);
}

function CrearCheckDto(comercio) {
    let = checkContainer = document.getElementById("checkContainer");
    // Verificar si ya existe un checkbox con el mismo valor
    if (document.getElementById(comercio.Dto + "%")) {
        return; // No crear otro checkbox si ya existe uno con el mismo valor
    }

    // Crear un elemento div con la clase "col-4"
    var divCol = document.createElement("div");
    divCol.className = "col-4";

    // Crear un elemento div con la clase "form-check"
    var divFormCheck = document.createElement("div");
    divFormCheck.className = "form-check";

    // Crear un elemento input de tipo checkbox con la clase "form-check-input"
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    // checkbox.className = "form-check-input";
    checkbox.classList.add("form-check-input", "dto");

    checkbox.value = comercio.Dto;
    checkbox.id = comercio.Dto + "%";
    checkbox.checked = true;

    // Crear un elemento label con la clase "form-check-label"
    var label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = comercio.Dto + "%";
    label.textContent = comercio.Dto + "%";

    // Agregar el input y el label al div con la clase "form-check"
    divFormCheck.appendChild(checkbox);
    divFormCheck.appendChild(label);

    // Agregar el div con la clase "form-check" al div con la clase "col-4"
    divCol.appendChild(divFormCheck);

    // Agregar el div con la clase "col-4" al body o al elemento que desees
    checkContainer.appendChild(divCol);
}

function LimpiarFiltro() {

    /* Agregar que cuando limpie el filtro vuelva hacer foco en bahia blanca */
    prov.selectedIndex = 0; //por defecto Buenos aires
    localidad.selectedIndex = 0; //por defecto Bahia blanca
    rubro.selectedIndex = 0;
    mapaVisible.checked = true;

    var mapaVisibleChange = new Event('change');
    prov.dispatchEvent(mapaVisibleChange);

    var provChange = new Event('change');
    localidad.dispatchEvent(provChange);

    var localidadChange = new Event('change');
    rubro.dispatchEvent(localidadChange);

    check = document.querySelectorAll('.dto');
    check.forEach(dto => {
        dto.checked = true
    })

    //Volver a cargar todos los comercios
    // CargarFiltro();
       
    CargarComercios();
}

function CargarComercios() {
    //Limpia los comercios que estan por defecto o seleccionados previamente
    LimpiarComercios();
    //Crea los check con los descuentos correspondientes
    comerciosFiltrados.forEach(element => {
        CrearCheckDto(element);
    });
    //Filtra los comercios en base a las opciones seleccionadas
    comerciosFiltrados.forEach(function (comercio) {
        const cumpleProvincia = selectedProvincia === "Seleccione una provincia" || comercio.Provincia === selectedProvincia;
        const cumpleLocalidad = selectedLocalidad === "Seleccione una localidad" || comercio.Localidad === selectedLocalidad;
        const cumpleRubro = selectedRubro === "TODOS" || comercio.Rubro === selectedRubro;
        var checkboxes = document.querySelectorAll('.dto');
        const cumpleDescuento = Array.from(checkboxes).some(function (checkbox) {
            return checkbox.checked && comercio.Dto === checkbox.value;
        });
        if (cumpleProvincia && cumpleLocalidad && cumpleRubro && cumpleDescuento) {
            // Cumple con los criterios
            SetMarker(comercio);
            CrearCards(comercio);
            if (selectedLocalidad != "Seleccione una provincia" && selectedProvincia != "Seleccione una localidad") {
                map.setView([comercio.Latitud, comercio.Longitud], 14);
            }
        }
    });
    //Cerrar menu filtros
    btnClose.click();
}

function LimpiarComercios() {
    // Elimina el marcador
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Elimina las cards
    var cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = "";

    map.setView([-38.7183, -62.2661], 14);
}

