let prov = document.getElementById("provId");
let localidad = document.getElementById("localidadId");
let rubro = document.getElementById("rubroId");
// let mapaVisible = document.getElementById("mapaVisible");
let mapaVisible = document.getElementById("toggleCheckbox");
let filtro = document.getElementById("content");
// let filtro = document.getElementById("filtro");
let mapa = document.getElementById("map");
let closeBtn = document.getElementById("closeBtn");
let img_coop = document.getElementById("imgCoope");

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

// Obtener el control de atribución actual (esquina inferior derecha)
var attributionControl = map.attributionControl;
attributionControl.setPrefix('Leaflet'),
    attributionControl.addTo(map);

//#endregion

// Objeto para hacer un seguimiento de las provincias, localidades, rubros e imagenes procesadas
var PrimeraCarga = false;
var provinciasProcesadas = {};
var localidadesProcesadas = {};
var rubrosProcesados = {};
var imgprocesada = {};

var comerciosFiltrados = [];
var selectedProvincia = (prov.options[prov.selectedIndex]).text;
var selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
var selectedRubro = (rubro.options[rubro.selectedIndex]).text;

prov.addEventListener("change", function () {
    selectedProvincia = (prov.options[prov.selectedIndex]).text;
    CargarLocalidades();
});
localidad.addEventListener("change", function () {
    selectedLocalidad = (localidad.options[localidad.selectedIndex]).text;
    CargarRubros();
    CrearCheckDto();
});
rubro.addEventListener("change", function () {
    selectedRubro = (rubro.options[rubro.selectedIndex]).text;
});

//#region Analizar el archivo CSV
fetch('./nuevo_archivo (19).csv')
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
                ImgCoop: row.ImgCoop,
                ImgCoopLink: row.ImgCoopLink,
                ImgComercio: row.ImgComercio,
                Latitud: row.Latitud,
                Longitud: row.Longitud,
                Provincia: row.Provincia
            };
        });
        // Recorre el CSV y crea marcadores
        comercios.forEach(function (comercio) {
            // Almacena el comercio filtrado
            comerciosFiltrados.push(comercio);
        });
        CargarProvincias();
        CargarComercios();
        PrimeraCarga = true;
    })
    .catch(function (error) {
        console.error("Error al cargar el CSV:", error);
    });
//#endregion

function CargarProvincias() {
    // Limpia opciones antiguas
    prov.innerHTML = '<option value="-1" disabled>Seleccione una provincia</option>';
    // Cargar nuevas opciones de provincias
    var provincias = [];

    comerciosFiltrados.forEach(function (comercio) {
        if (!provinciasProcesadas[comercio.Provincia]) {
            provincias.push(comercio.Provincia);
            provinciasProcesadas[comercio.Provincia] = true;

            // Establecer por defecto la provincia "Provincia de Buenos Aires"
            if (comercio.Provincia === "Provincia de Buenos Aires") {
                selectedProvincia = "Provincia de Buenos Aires";
            }
        }
    });
    // Ordenar provincias alfabéticamente
    provincias.sort();

    // Agregar las opciones ordenadas al elemento <select>
    provincias.forEach(function (provinciaNombre) {
        var optionProv = document.createElement("option");
        optionProv.text = provinciaNombre;
        prov.add(optionProv);

        if (provinciaNombre === selectedProvincia) {
            optionProv.selected = true;
            selectedProvincia = provinciaNombre; // Actualizar la variable selectedProvincia
        }
    });
    CargarLocalidades();
}

function CargarLocalidades() {
    // Limpia opciones antiguas
    localidadesProcesadas = {};

    localidad.innerHTML = '<option value="-1" disabled selected>Seleccione una localidad</option>';
    selectedLocalidad = "Seleccione una localidad";
    
    // Cargar nuevas localidades
    var localidades = [];

    comerciosFiltrados.forEach(function (comercio) {
        if (
            (comercio.Provincia === selectedProvincia) &&
            !localidadesProcesadas[comercio.Localidad]
        ) {
            localidades.push(comercio.Localidad);
            localidadesProcesadas[comercio.Localidad] = true;

            // Establecer por defecto la localidad es "BAHÍA BLANCA"
            if (comercio.Localidad === "BAHÍA BLANCA" && !PrimeraCarga) {
                selectedLocalidad = "BAHÍA BLANCA";
            }
        }
    });

    // Ordenar localidades alfabéticamente
    localidades.sort();

    // Agregar las opciones ordenadas al elemento <select>
    localidades.forEach(function (localidadNombre) {
        var optionLoc = document.createElement("option");
        optionLoc.text = localidadNombre;
        localidad.add(optionLoc);

        if (localidadNombre === selectedLocalidad) {
            optionLoc.selected = true;
            selectedLocalidad = localidadNombre;

        }
    });
    CargarRubros();
    CrearCheckDto();
}

function CargarRubros() {
    // Limpia opciones antiguas
    rubro.innerHTML = '<option value="-1" selected>TODOS</option>';
    rubrosProcesados = {};

    // Cargar nuevas opciones de rubros
    var rubros = [];

    comerciosFiltrados.forEach(function (comercio) {
        if (
            (comercio.Provincia === selectedProvincia) &&
            (comercio.Localidad === selectedLocalidad) &&
            !rubrosProcesados[comercio.Rubro]
        ) {
            rubros.push(comercio.Rubro);
            rubrosProcesados[comercio.Rubro] = true;
            if (rubro.options[rubro.selectedIndex].text === "TODOS") {
                selectedRubro = "TODOS"; // Actualizar la variable selectedrubro
            }
        }
    });

    rubros.sort();

    // Agregar las opciones ordenadas al elemento <select>
    rubros.forEach(function (rubroNombre) {
        var optionRubro = document.createElement("option");
        optionRubro.text = rubroNombre;

        rubro.add(optionRubro);
    });
}

function CargarComercios() {
    //Controla que se seleccione una localidad
    if (selectedLocalidad === "Seleccione una localidad") {
        alert("Seleccione una localidad");
        return;
    }

    // Limpia los comercios que están por defecto o seleccionados previamente
    LimpiarComercios();

    // Filtra los comercios en base a las opciones seleccionadas
    comerciosFiltrados.forEach(function (comercio) {
        const cumpleProvincia = selectedProvincia === "Seleccione una provincia" || comercio.Provincia === selectedProvincia;
        const cumpleLocalidad = selectedLocalidad === "Seleccione una localidad" || comercio.Localidad === selectedLocalidad;
        const cumpleRubro = selectedRubro === "TODOS" || comercio.Rubro === selectedRubro;

        var checkboxes = document.querySelectorAll('.dto');
        const cumpleDescuento = Array.from(checkboxes).some(function (checkbox) {
            return checkbox.checked && comercio.Dto === checkbox.value;
        });
        //Si Cumple con los criterios
        if (cumpleProvincia && cumpleLocalidad && cumpleRubro && cumpleDescuento) {
            SetMarker(comercio);
            CrearCards(comercio);
            CargarImgCooperativa(comercio);

            if (selectedLocalidad != "Seleccione una provincia" && selectedProvincia != "Seleccione una localidad") {
                map.setView([comercio.Latitud, comercio.Longitud], 14);
            }
            
        }
    });
    // Cerrar menú filtros
    closeBtn.click();
}

function CargarImgCooperativa(comercio) {
    // Eliminar la imagen anterior
    imgprocesada = {}

    if (comercio.Localidad == selectedLocalidad && !imgprocesada[comercio.Localidad]) {
        if(!comercio.ImgCoop){
            return;
        }
        img_coop.innerHTML = '';
        img_coop.removeAttribute("href");
        let img = document.createElement("img");
        img.src = "img/" + comercio.ImgCoop + ".svg";
        img.classList.add("img-fluid", "w-100")
        if (comercio.ImgCoopLink != "") {
            img_coop.href = comercio.ImgCoopLink
            img_coop.target = "_blank"
        }
        img_coop.appendChild(img);
        // Marcar la localidad como procesada
        imgprocesada[comercio.Localidad] = true;
    }
}

function CrearCards(comercio) {

    // Crear elementos HTML para la card
    var cardContainer = document.getElementById("cardContainer");

    var cardCol = document.createElement("div");
    cardCol.classList.add("col-lg-3", "col-md-6", "mt-3");

    var card = document.createElement("div");
    card.classList.add("card", "mb-3","shadow");
    
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
    // img.src = "./img/e36258b3c74f08054a974a5fe1703f9c.jpg";
    if (comercio.ImgComercio == "") {
        img.src = "./img/" + comercio.Rubro + ".png";
    } else {
        img.src = "./img/" + comercio.ImgComercio + ".jpg";
    }
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

function CrearCheckDto() {
    //Si no se selecciona localidad, mostrar el resultado anterior
    if (selectedLocalidad != "Seleccione una localidad") {
        // Limpiar el contenedor de checkboxes
        checkContainer.innerHTML = '';

        // Variable para hacer un seguimiento de los descuentos ya agregados
        let descuentosAgregados = {};
        let checkboxes = [];

        // Filtrar descuentos por la localidad seleccionada
        comerciosFiltrados.forEach(function (comercio) {
            if (comercio.Localidad === selectedLocalidad) {
                checkboxes.push(comercio.Dto);
            }
        });

        // Ordenar los descuentos ascendentemente
        checkboxes.sort(function (a, b) {
            return a - b;
        });
        // Crear un checkbox por cada descuento disponible
        checkboxes.forEach(descuento => {
            // Verificar si el descuento ya ha sido agregado
            if (!descuentosAgregados[descuento]) {
                // let checkbox = document.createElement("input");
                // checkbox.type = "checkbox";
                // checkbox.classList.add("form-check-input", "dto");
                // checkbox.value = descuento;
                // checkbox.id = descuento + "%";
                // checkbox.checked = true;

                // let label = document.createElement("label");
                // label.className = "form-check-label";
                // label.htmlFor = descuento + "%";
                // label.textContent = descuento + "%";

                // let divFormCheck = document.createElement("div");
                // divFormCheck.className = "form-check";
                // divFormCheck.appendChild(checkbox);
                // divFormCheck.appendChild(label);

                // let divCol = document.createElement("div");
                // divCol.className = "col-4";
                // divCol.appendChild(divFormCheck);

                // checkContainer.appendChild(divCol);

                // // Marcar el descuento como agregado
                // descuentosAgregados[descuento] = true;

                //---------------------------------------------------

                let checkbox = document.createElement("input");
                checkbox.classList.add("dto");
                checkbox.type = "checkbox";
                checkbox.value = descuento;
                checkbox.id = descuento + "%";
                checkbox.checked = true;

                let label = document.createElement("label");
                label.htmlFor = descuento + "%";
                label.textContent = descuento + "%";

                let divCheck = document.createElement("div");
                divCheck.className = "check";
                divCheck.appendChild(checkbox);
                divCheck.appendChild(label);

                checkContainer.appendChild(divCheck);
                descuentosAgregados[descuento] = true;
            }
        });
    }
}

var marker = "";
function SetMarker(comercio) {
     marker = L.marker([comercio.Latitud, comercio.Longitud]).addTo(map);
    //icono del marcador
    var customIcon = L.icon({
        iconUrl: 'img/' + comercio.Dto + '.jpg',
        iconSize: [40, 32],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    marker.setIcon(customIcon);
    // Contenido del marcador 
    var contenido =
        '<b>Nombre:</b> ' + comercio.NomComercio + '<br>' +
        '<b>Rubro:</b> ' + comercio.Rubro + '<br>' +
        '<b>Dirección:</b> ' + comercio.Direccion + '<br>' +
        '<b>Descuento:</b> ' + comercio.Dto + '%<br>' +
        '<b>Teléfono:</b> ' + comercio.Prefijo + ' ' + comercio.NroTel;
    // Asignar el contenido al marcador
    marker.bindPopup(contenido);
    //marker.bindPopup(contenido).openPopup();
}

function LimpiarFiltro() {
    selectedProvincia = "Provincia de Buenos Aires";
    prov.value = selectedProvincia;
    CargarLocalidades();
    selectedLocalidad = "BAHÍA BLANCA";
    localidad.value = selectedLocalidad;
    //selectedRubro = "TODOS";
    CargarRubros();
    CrearCheckDto();
    //Cargar las opciones de localidades y rubros con los valores predeterminados
    //rubro.value = selectedRubro;

    // Establecer el atributo selected en las opciones predeterminadas
    var provinciaOption = document.querySelector(`#provincia option[value="${selectedProvincia}"]`);
    var localidadOption = document.querySelector(`#localidad option[value="${selectedLocalidad}"]`);
    var rubroOption = document.querySelector(`#rubro option[value="${selectedRubro}"]`);

    if (provinciaOption) {
        provinciaOption.selected = true;
    }

    if (localidadOption) {
        localidadOption.selected = true;
    }

    if (rubroOption) {
        rubroOption.selected = true;
    }

    mapaVisible.checked = true;

    var mapaVisibleChange = new Event('change');
    mapaVisible.dispatchEvent(mapaVisibleChange);

    check = document.querySelectorAll('.dto');
    check.forEach(dto => {
        dto.checked = true
    })
    
    CargarComercios();
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
