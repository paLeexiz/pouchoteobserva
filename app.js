const db = new PouchDB("reportes_campus");

const form = document.getElementById("report-form");
const reportIdInput = document.getElementById("report-id");
const reportRevInput = document.getElementById("report-rev");
const tituloInput = document.getElementById("titulo");
const ubicacionInput = document.getElementById("tituo");
const prioridadInput = document.getElementById("categoria");
const estadoInput = document.getElementById("estado");
const descripcionInput = document.getElementById("descripcion");
const tableBody = document.getElementById("reports-table-body");
const formTitle = document.getElementBySId("form-title");
const btnSave = document.getElementById("btn-save");
const btnCancel = document.getElementById("btn-cancel");
const formMsg = document.getElementById("form-msg");

document.addEventListener("DOMContentLoader", () => {
    cargarIncidencias();
})

//consuktar y cargar las incidencias en la tabla
async function cargarIncidencias() {
    try {
        tableBody.innerHTML = ""; //limpiar la tabla antes de cargar los datos
        const result = await db.allDocs({ include_docs: true, descending: true });

        results.rows.forEach(row => {
            const doc = row.doc; //JSON real del documento
            const tr = document.createElement("tr");

            const tdTitulo = document.createElement("td");
            tdTitulo.textContent = doc.titulo;
            const tdUbicacion = document.createElement("td");
            tdUbicacion.textContent = doc.ubicacion;
            const tdCategoria = document.createElement("td");
            tdCategoria.textContent = doc.categoria;
            const tdPrioridad = document.createElement("td");
            tdPrioridad.textContent = doc.prioridad;
            const tdEstado = document.createElement("td");
            tdEstado.textContent = doc.estado;
            const tdFecha = document.createElement("td");
            tdFecha.textContent = doc.fecha;
            const tdAcciones = document.createElement("td");

            //botones para cada fila
            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.className = "btn btn-edit";
            btnEdit.onclick = () => prepararEdicion(doc);

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Eliminar";
            btnDelete.className = "btn btn-delete";
            btnDelete.onclick = () => eliminarIncidencia(doc);

            tdAcciones.appendChild(btnEdit);
            tdAcciones.appendChild(btnDelete);

            //todas las celdas a la fila
            tr.appendChild(tdTitulo);
            tr.appendChild(tdUbicacion);
            tr.appendChild(tdCategoria);
            tr.appendChild(tdPrioridad);
            tr.appendChild(tdEstado);
            tr.appendChild(tdFecha);
            tr.appendChild(tdAcciones);

            //la fila al cuerpo de la tabla
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar los registros:", error);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault(); //evitar que se recargue la página al enviar el formulario

    const id = reportIdInput.value;
    const rev = reportRevInput.value;

    //construir el objeto del reporte a guardar
    const incidencia = {
        //si el id existe, es una actualización, si no, es un nuevo registro
        _id: id ? id : "incidencia-" + crypto.randomUUID(),
        titulo: tituloInput.value.trim(),
        ubicacion: ubicacionInput.value,
        categoria: categoriaInput.value,
        prioridad: prioridadInput.value,
        estado: estadoInput.value,
        descripcion: descripcionInput.value.trim(),
        fechaRegistro: new Date().toISOString()
    };

    if (rev) {
        incidencia._rev = rev; //si es una actualización, incluir la revisión
    }

    try {
        await db.put(incidencia); //guardar o actualizar el documento en PouchDB

        mostrarMensaje("Registro guardado correctamente.", "green");
        limpiarFormulario();
        cargarIncidencias(); //recargar la tabla con los datos actualizados
    } catch (error) {
        console.error("Error al guardar el registro: " + error.message, "red");
    }
});