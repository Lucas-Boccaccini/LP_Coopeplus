let prov = document.getElementById("provId");
let localidad = document.getElementById("localidadId");
let rubro = document.getElementById("rubroId");
let mapaVisible = document.getElementById("mapaVisible");
let filtro = document.getElementById("filtro");
let mapa = document.getElementById("map");
let dto10 = document.getElementById("10%");
let dto15 = document.getElementById("15%");
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

var map = L.map('map').setView([-38.7183, -62.2661], 8);
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
var rubrosProcesadas = {};
var comerciosFiltrados = [];  // Arreglo para almacenar los comercios filtrados
var selectedProvincia = (prov.options[prov.selectedIndex]).text;
var selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
var selectedRubro = (rubro.options[rubro.selectedIndex]).text;

prov.addEventListener("change", function(){
    selectedProvincia = (prov.options[prov.selectedIndex]).text;
});
localidad.addEventListener("change", function(){
    selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
});
rubro.addEventListener("change", function(){
    selectedRubro = (rubro.options[rubro.selectedIndex]).text;
});
// Cargar y analizar el archivo CSV
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
            CargarFiltro(comercio);
            comerciosFiltrados.push(comercio);  // Almacena el comercio filtrado
        });
        CargarComercios();
    })
    .catch(function (error) {
        console.error("Error al cargar el CSV:", error);
    });

function CargarFiltro(comercio) {
    // Verificar si la provincia ya ha sido procesada

    if (!provinciasProcesadas[comercio.Provincia]) {
        // Agregar la provincia al mapa
        var option = document.createElement("option");
        option.text = comercio.Provincia;
        prov.add(option);

        // Marcar la localidad como procesada
        provinciasProcesadas[comercio.Provincia] = true;
    }
    // Verificar si la localidad ya ha sido procesada
    if (!localidadesProcesadas[comercio.Localidad]) {
        // Agregar la localidad al mapa
        var option = document.createElement("option");
        option.text = comercio.Localidad;
        localidad.add(option);

        // Marcar la localidad como procesada
        localidadesProcesadas[comercio.Localidad] = true;
    }
    // Verificar si el rubro ya ha sido procesada
    if (!rubrosProcesadas[comercio.Rubro]) {
        // Agregar la localidad al mapa
        var option = document.createElement("option");
        option.text = comercio.Rubro;
        rubro.add(option);

        // Marcar la localidad como procesada
        rubrosProcesadas[comercio.Rubro] = true;
    }
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

function LimpiarFiltro() {
    prov.selectedIndex = 0;
    localidad.selectedIndex = 0;
    rubro.selectedIndex = 0;
    mapaVisible.checked = true;
    dto10.checked = true;
    dto15.checked = true;

    var mapaVisibleChange = new Event('change');
    prov.dispatchEvent(mapaVisibleChange);

    var provChange = new Event('change');
    localidad.dispatchEvent(provChange);

    var localidadChange = new Event('change');
    rubro.dispatchEvent(localidadChange);

    //volver a cargar todos los comercios
    CargarComercios()
}

function CargarComercios() {
    LimpiarComercios();
    comerciosFiltrados.forEach(function (comercio) {
        const cumpleProvincia = selectedProvincia === "Seleccione una provincia" || comercio.Provincia === selectedProvincia;
            const cumpleLocalidad = selectedLocalidad === "Seleccione una localidad" || comercio.Localidad === selectedLocalidad;
            const cumpleRubro = selectedRubro === "TODOS" || comercio.Rubro === selectedRubro;
            const cumpleDescuento10 = dto10.checked && comercio.Dto === "10";
            const cumpleDescuento15 = dto15.checked && comercio.Dto === "15";
            if (cumpleProvincia && cumpleLocalidad && cumpleRubro && (cumpleDescuento10 || cumpleDescuento15)) {
                // Cumple con los criterios
                    SetMarker(comercio);
                    CrearCards(comercio);
            }
        });
    //Cerrar menu filtros
    btnClose.click();
}

function LimpiarComercios(){
    // Limpiar contenido
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    var cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = ""; 
}