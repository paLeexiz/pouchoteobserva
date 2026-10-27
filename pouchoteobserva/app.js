const db = new PouchDB("reportes_campus");

const form = document.getElementById("report-form");
const reportIdInput = document.getElementById("report-id");
const reportRevInput = document.getElementById("report-rev");
const tituloInput = document.getElementById("titulo");
const ubicacionInput = document.getElementById("ubicacion");
const categoriaInput = document.getElementById("categoria");
const prioridadInput = document.getElementById("prioridad");
const estadoInput = document.getElementById("estado");
const descripcionInput = document.getElementById("descripcion");
const tableBody = document.getElementById("reports-table-body");
const formTitle = document.getElementById("form-title");
const btnCancel = document.getElementById("btn-cancel");
const formMsg = document.getElementById("form-msg");

document.addEventListener("DOMContentLoaded", () => {
    cargarIncidencias();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = reportIdInput.value.trim();
    const rev = reportRevInput.value.trim();

    const titulo = tituloInput.value.trim();
    const ubicacion = ubicacionInput.value.trim();
    const categoria = categoriaInput.value;
    const prioridad = prioridadInput.value;
    const estado = estadoInput.value;
    const descripcion = descripcionInput.value.trim();

    if (titulo.length < 5 || titulo.length > 80) {
        mostrarMensaje("El título debe tener entre 5 y 80 caracteres.", "red");
        return;
    }
    if (!ubicacion) {
        mostrarMensaje("La ubicación es obligatoria.", "red");
        return;
    }
    if (!categoria) {
        mostrarMensaje("Selecciona una categoría.", "red");
        return;
    }
    if (!prioridad) {
        mostrarMensaje("Selecciona una prioridad.", "red");
        return;
    }
    if (!estado) {
        mostrarMensaje("Selecciona un estado.", "red");
        return;
    }
    if (descripcion.length < 10 || descripcion.length > 300) {
        mostrarMensaje("La descripción debe tener entre 10 y 300 caracteres.", "red");
        return;
    }

    const incidencia = {
        _id: id ? id : "incidencia-" + crypto.randomUUID(),
        titulo,
        ubicacion,
        categoria,
        prioridad,
        estado,
        descripcion,
        fecha: new Date().toISOString()
    };

    if (rev) {
        incidencia._rev = rev;
    }

    try {
        await db.put(incidencia);
        mostrarMensaje("Registro guardado correctamente.", "green");
        limpiarFormulario();
        cargarIncidencias();
    } catch (error) {
        console.error("Error al guardar el registro:", error);
        if (error.status === 409) {
            mostrarMensaje("Conflicto de revisión. Otra pestaña o acción actualizó este registro. Vuelve a intentarlo.", "red");
            cargarIncidencias();
            return;
        }
        mostrarMensaje("Error al guardar el registro: " + error.message, "red");
    }
});

btnCancel.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("", "");
});

async function cargarIncidencias() {
    try {
        tableBody.innerHTML = "";
        const result = await db.allDocs({ include_docs: true, descending: true });

        if (!result.rows || result.rows.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 7;
            td.textContent = "No hay incidencias registradas.";
            td.style.textAlign = "center";
            td.style.color = "#656d76";
            tr.appendChild(td);
            tableBody.appendChild(tr);
            return;
        }

        result.rows.forEach((row) => {
            const doc = row.doc;
            if (!doc) return;

            const tr = document.createElement("tr");

            const tdTitulo = document.createElement("td");
            tdTitulo.textContent = doc.titulo || "";

            const tdUbicacion = document.createElement("td");
            tdUbicacion.textContent = doc.ubicacion || "";

            const tdCategoria = document.createElement("td");
            tdCategoria.textContent = doc.categoria || "";

            const tdPrioridad = document.createElement("td");
            tdPrioridad.textContent = doc.prioridad || "";

            const tdEstado = document.createElement("td");
            tdEstado.textContent = doc.estado || "";

            const tdFecha = document.createElement("td");
            if (doc.fecha) {
                try {
                    const fecha = new Date(doc.fecha);
                    tdFecha.textContent = fecha.toLocaleString();
                } catch {
                    tdFecha.textContent = doc.fecha;
                }
            } else {
                tdFecha.textContent = "";
            }

            const tdAcciones = document.createElement("td");

            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.className = "btn btn-edit";
            btnEdit.type = "button";
            btnEdit.onclick = () => prepararEdicion(doc);

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Eliminar";
            btnDelete.className = "btn btn-delete";
            btnDelete.type = "button";
            btnDelete.onclick = () => eliminarIncidencia(doc);

            tdAcciones.appendChild(btnEdit);
            tdAcciones.appendChild(btnDelete);

            tr.appendChild(tdTitulo);
            tr.appendChild(tdUbicacion);
            tr.appendChild(tdCategoria);
            tr.appendChild(tdPrioridad);
            tr.appendChild(tdEstado);
            tr.appendChild(tdFecha);
            tr.appendChild(tdAcciones);

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar los registros:", error);
        mostrarMensaje("Error al cargar las incidencias.", "red");
    }
}

function prepararEdicion(doc) {
    reportIdInput.value = doc._id || "";
    reportRevInput.value = doc._rev || "";
    tituloInput.value = doc.titulo || "";
    ubicacionInput.value = doc.ubicacion || "";
    categoriaInput.value = doc.categoria || "";
    prioridadInput.value = doc.prioridad || "";
    estadoInput.value = doc.estado || "Pendiente";
    descripcionInput.value = doc.descripcion || "";

    formTitle.textContent = "Editar incidencia";
    mostrarMensaje("Editando registro. Puedes cambiar estado, prioridad o descripción.", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarIncidencia(doc) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta incidencia?");
    if (!confirmar) {
        return;
    }

    try {
        const docActual = await db.get(doc._id);
        await db.remove(docActual);
        mostrarMensaje("Incidencia eliminada correctamente.", "green");
        limpiarFormulario();
        cargarIncidencias();
    } catch (error) {
        console.error("Error al eliminar el registro:", error);
        if (error.status === 409) {
            mostrarMensaje("Conflicto de revisión al eliminar. Vuelve a intentarlo.", "red");
            cargarIncidencias();
            return;
        }
        mostrarMensaje("Error al eliminar el registro: " + error.message, "red");
    }
}

function limpiarFormulario() {
    form.reset();
    reportIdInput.value = "";
    reportRevInput.value = "";
    estadoInput.value = "Pendiente";
    formTitle.textContent = "Registrar incidencia";
    mostrarMensaje("", "");
}

function mostrarMensaje(texto, color) {
    formMsg.textContent = texto;
    if (color === "green") {
        formMsg.style.color = "#1f883d";
    } else if (color === "red") {
        formMsg.style.color = "#d1242f";
    } else {
        formMsg.style.color = "#656d76";
    }
}
