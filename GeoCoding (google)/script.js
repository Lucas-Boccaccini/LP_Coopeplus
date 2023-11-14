document.getElementById("inputFile").addEventListener("change", function (event) {
  let btnDescargar = document.getElementById("finalizado");
  let conversion = document.getElementById("conversion");
  let spinner = document.getElementById("spinner");
  let faltante = document.getElementById("faltante");
  let dir = document.getElementById("dir");
  const file = event.target.files[0];

  // Verifica que se haya seleccionado un archivo CSV
  if (file && file.name.endsWith(".csv")) {
    // Leemos el archivo como texto
    const reader = new FileReader();
    reader.onload = function (e) {
      // Agregamos la cabecera al contenido del archivo
      const header = "Localidad,Rubro,NomComercio,Direccion,Prefijo,NroTel,Dto,Latitud,Longitud,Provincia" + "\n";
      const fileContent = header + e.target.result;

      // Ahora procesamos el contenido como un archivo CSV con PapaParse
      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          const data = results.data;

          let cant = 0;
          // Función para procesar una fila
          const LeerFila = (row) => {
            let direccion = row.Direccion + ", " + row.Localidad + ", Argentina";
            // Utilizar la API de geocodificación de Google
            var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                      encodeURIComponent(direccion) +
                      "&key=AIzaSyDtXKOBxVhIhYEs_AdfMFuLRSFiGNiVsac";

            fetch(url)
              .then(function (response) {
                return response.json();
              })
              .then(function (jsonData) {
                if (jsonData.results.length > 0) {
                  var location = jsonData.results[0].geometry.location;
                  var prov = jsonData.results[0].formatted_address;
                  var Provincia = prov.split(", ");

                  // Asignar las coordenadas y provincia dentro del csv
                  row.Latitud = location.lat;
                  row.Longitud = location.lng;
                  row.Provincia = Provincia[Provincia.length - 2];
                }
                // Incrementar el contador de filas procesadas
                cant++;

                // Actualizar el contador de direcciones faltantes
                faltante.textContent = (cant - 1) + "/" + (data.length - 1);
                dir.style.display = "inline";

                // Verificar si es la última fila
                if (cant === data.length) {
                  // Ocultar el spinner y mostrar el resultado
                  spinner.style.display = "none";
                  // Convertir el JSON modificado a CSV
                  const csv = Papa.unparse(data);
                  // Crear un Blob con el CSV
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

                  // Crear un enlace de descarga y simular un clic para iniciar la descarga
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "nuevo_archivo.csv";
                  a.text = "Descargar";

                  a.style.display = "inline";
                  conversion.style.display = "inline";

                  dir.style.display = "none";
                  faltante.style.display = "none";

                  btnDescargar.appendChild(a);

                  // Eliminar el archivo seleccionado en el input después de hacer clic en el enlace de descarga
                  a.onclick = () => {
                    btnDescargar.removeChild(a);
                    conversion.style.display = "none"; //Oculta el párrafo
                    event.target.value = null; // Resetea el valor del input
                  }
                } else {
                  // Procesar la siguiente fila (10/seg)
                  setTimeout(() => LeerFila(data[cant]), 100);
                }
              });
          };
          //Empieza el procesamiento del csv
          LeerFila(data[0]);
        },
      });
    };

    reader.readAsText(file);

    // Mostrar el spinner mientras se procesan los datos
    spinner.style.display = "block";
    faltante.style.display = "inline";
  }
});
