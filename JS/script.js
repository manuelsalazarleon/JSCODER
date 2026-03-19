/**
 * PROYECTO FINAL: Simulador Financiero Interactuando con JSON y Librerías
 */

class Finanza {
    constructor(nombre, monto) {
        this.nombre = nombre;
        this.monto = parseFloat(monto);
    }
}

// --- ESTADO INICIAL ---
let fondos = JSON.parse(localStorage.getItem("fondos")) || [];
let deudas = JSON.parse(localStorage.getItem("deudas")) || [];

// --- FUNCIONES ASÍNCRONAS (FETCH) ---
const cargarSugerencias = async () => {
    try {
        const response = await fetch('./data/sugerencias.json');
        if (!response.ok) throw new Error("Error al cargar sugerencias");
        const datos = await response.json();
        
        // Mostrar una sugerencia aleatoria usando Toastify
        const random = datos[Math.floor(Math.random() * datos.length)];
        setTimeout(() => {
            notificar(`💡 Tip: Podrías crear un "${random.categoria}" con $${random.montoSugerido}`, "#3182ce");
        }, 1500);
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

// --- UTILIDADES DE INTERFAZ (LIBRERÍAS) ---
const notificar = (mensaje, color = "#48bb78") => {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: color }
    }).showToast();
};

// --- NÚCLEO DEL SIMULADOR ---
function guardar() {
    localStorage.setItem("fondos", JSON.stringify(fondos));
    localStorage.setItem("deudas", JSON.stringify(deudas));
}

function renderizar() {
    const listaFondos = document.getElementById("lista-fondos");
    const listaDeudas = document.getElementById("lista-deudas");
    const selectFondoGasto = document.getElementById("select-fondo-gasto");
    const spanBalance = document.getElementById("balance-total");

    listaFondos.innerHTML = "";
    listaDeudas.innerHTML = "";
    selectFondoGasto.innerHTML = '<option value="">Selecciona un fondo...</option>';

    // Renderizado de Fondos
    fondos.forEach((fondo, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${fondo.nombre}</span> <span class="badge bg-success">$${fondo.monto.toLocaleString()}</span>`;
        listaFondos.appendChild(li);

        const option = document.createElement("option");
        option.value = index;
        option.text = `${fondo.nombre} ($${fondo.monto})`;
        selectFondoGasto.appendChild(option);
    });

    // Renderizado de Deudas
    deudas.forEach((deuda, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item flex-column align-items-start";
        li.innerHTML = `
            <div class="d-flex justify-content-between w-100 mb-2">
                <h6 class="mb-1">${deuda.nombre}</h6>
                <span class="badge bg-danger">$${deuda.monto.toLocaleString()}</span>
            </div>
            <div class="input-group input-group-sm">
                <select class="form-select" id="pago-fondo-${index}">
                    ${fondos.map((f, i) => `<option value="${i}">${f.nombre}</option>`).join('')}
                </select>
                <button class="btn btn-outline-success" onclick="pagarDeuda(${index})">Pagar</button>
            </div>
        `;
        listaDeudas.appendChild(li);
    });

    // Cálculo de Salida (Procesamiento)
    const totalF = fondos.reduce((acc, el) => acc + el.monto, 0);
    const totalD = deudas.reduce((acc, el) => acc + el.monto, 0);
    const totalNeto = totalF - totalD;

    spanBalance.innerText = `$${totalNeto.toLocaleString()}`;
    spanBalance.style.color = totalNeto >= 0 ? "#2f855a" : "#c53030";
}

// --- ACCIONES DEL USUARIO ---
window.pagarDeuda = (idxDeuda) => {
    const select = document.getElementById(`pago-fondo-${idxDeuda}`);
    const idxFondo = select.value;

    if (idxFondo === "") return notificar("No hay fondos seleccionados", "#e53e3e");

    const montoD = deudas[idxDeuda].monto;
    const fondoS = fondos[idxFondo];

    if (fondoS.monto >= montoD) {
        fondoS.monto -= montoD;
        deudas.splice(idxDeuda, 1);
        guardar();
        renderizar();
        Swal.fire('¡Éxito!', 'Deuda cancelada correctamente', 'success');
    } else {
        Swal.fire('Fondos Insuficientes', `No tienes suficiente dinero en ${fondoS.nombre}`, 'error');
    }
};

// --- EVENT LISTENERS ---
document.getElementById("form-fondo").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("fondo-nombre").value;
    const monto = document.getElementById("fondo-monto").value;
    fondos.push(new Finanza(nombre, monto));
    guardar();
    renderizar();
    e.target.reset();
    notificar("Fondo agregado");
});

document.getElementById("form-deuda").addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = document.getElementById("deuda-desc").value;
    const monto = document.getElementById("deuda-monto").value;
    deudas.push(new Finanza(desc, monto));
    guardar();
    renderizar();
    e.target.reset();
    notificar("Deuda registrada", "#f56565");
});

document.getElementById("form-gasto").addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = document.getElementById("select-fondo-gasto").value;
    const monto = parseFloat(document.getElementById("gasto-monto").value);

    if (idx !== "" && fondos[idx].monto >= monto) {
        fondos[idx].monto -= monto;
        guardar();
        renderizar();
        e.target.reset();
        notificar("Gasto descontado");
    } else {
        Swal.fire('Atención', 'Saldo insuficiente para este gasto', 'warning');
    }
});

document.getElementById("btn-borrar-datos").addEventListener("click", () => {
    Swal.fire({
        title: '¿Reiniciar todo?',
        text: "Perderás todos los datos guardados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            fondos = [];
            deudas = [];
            renderizar();
            notificar("Sistema reiniciado", "#4a5568");
        }
    });
});

// Inicio de la aplicación
cargarSugerencias();
renderizar();