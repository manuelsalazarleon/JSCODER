/* =========================================
   ENTREGA 2: GESTIÓN DE GASTOS Y PAGOS
   ========================================= */

class Finanza {
    constructor(nombre, monto) {
        this.nombre = nombre;
        this.monto = parseFloat(monto);
    }
}

// --- ESTADO ---
let fondos = JSON.parse(localStorage.getItem("fondos")) || [];
let deudas = JSON.parse(localStorage.getItem("deudas")) || [];

// --- DOM ---
const formFondo = document.getElementById("form-fondo");
const formDeuda = document.getElementById("form-deuda");
const formGasto = document.getElementById("form-gasto"); // Nuevo

const listaFondos = document.getElementById("lista-fondos");
const listaDeudas = document.getElementById("lista-deudas");
const selectFondoGasto = document.getElementById("select-fondo-gasto"); // Nuevo
const spanBalance = document.getElementById("balance-total");

// --- FUNCIONES PRINCIPALES ---

function guardar() {
    localStorage.setItem("fondos", JSON.stringify(fondos));
    localStorage.setItem("deudas", JSON.stringify(deudas));
}

function renderizar() {
    listaFondos.innerHTML = "";
    listaDeudas.innerHTML = "";
    selectFondoGasto.innerHTML = ""; // Limpiamos el select de gastos

    // 1. DIBUJAR FONDOS Y LLENAR SELECT DE GASTOS
    fondos.forEach((fondo, index) => {
        // A. Lista visual
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${fondo.nombre}</span> <span class="badge bg-success">$${fondo.monto}</span>`;
        listaFondos.appendChild(li);

        // B. Llenar el Select del Formulario de Gastos
        const option = document.createElement("option");
        option.value = index; // El value es la posición en el array
        option.text = `${fondo.nombre} ($${fondo.monto})`;
        selectFondoGasto.appendChild(option);
    });

    // 2. DIBUJAR DEUDAS CON OPCIÓN DE PAGAR
    deudas.forEach((deuda, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item flex-column align-items-start";
        
        // Creamos un HTML interno más complejo para incluir el pago
        li.innerHTML = `
            <div class="d-flex justify-content-between w-100 mb-2">
                <h6 class="mb-1">${deuda.nombre}</h6>
                <span class="badge bg-danger">$${deuda.monto}</span>
            </div>
            <div class="input-group input-group-sm">
                <select class="form-select" id="pago-fondo-${index}">
                    </select>
                <button class="btn btn-outline-success" onclick="pagarDeuda(${index})">Pagar</button>
            </div>
        `;
        listaDeudas.appendChild(li);

        // Llenamos el select específico de esta deuda
        const selectDeuda = document.getElementById(`pago-fondo-${index}`);
        fondos.forEach((fondo, i) => {
            const opt = document.createElement("option");
            opt.value = i;
            opt.text = fondo.nombre;
            selectDeuda.appendChild(opt);
        });
    });

    // 3. ACTUALIZAR TOTALES
    const totalFondos = fondos.reduce((acc, el) => acc + el.monto, 0);
    const totalDeudas = deudas.reduce((acc, el) => acc + el.monto, 0);
    spanBalance.innerText = `$${totalFondos - totalDeudas}`;
}

// --- LÓGICA DE NEGOCIO ---

// A. PAGAR DEUDA (Se llama desde el botón en el HTML generado)
window.pagarDeuda = (indexDeuda) => {
    const select = document.getElementById(`pago-fondo-${indexDeuda}`);
    const indexFondo = select.value;

    // Validaciones
    if (indexFondo === "") {
        alert("No tienes fondos creados para pagar.");
        return;
    }

    const montoDeuda = deudas[indexDeuda].monto;
    const fondoSeleccionado = fondos[indexFondo];

    if (fondoSeleccionado.monto >= montoDeuda) {
        // Lógica de pago
        fondoSeleccionado.monto -= montoDeuda; // Restar dinero
        deudas.splice(indexDeuda, 1); // Eliminar la deuda del array
        
        guardar();
        renderizar();
        alert("¡Deuda pagada exitosamente!");
    } else {
        alert("Fondos insuficientes en " + fondoSeleccionado.nombre);
    }
};

// --- EVENT LISTENERS ---

// 1. Crear Fondo
formFondo.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("fondo-nombre").value;
    const monto = document.getElementById("fondo-monto").value;
    
    if(monto > 0) {
        fondos.push(new Finanza(nombre, monto));
        guardar();
        renderizar();
        formFondo.reset();
    }
});

// 2. Crear Deuda
formDeuda.addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = document.getElementById("deuda-desc").value;
    const monto = document.getElementById("deuda-monto").value;

    if(monto > 0) {
        deudas.push(new Finanza(desc, monto));
        guardar();
        renderizar();
        formDeuda.reset();
    }
});

// 3. Registrar Gasto (NUEVO)
formGasto.addEventListener("submit", (e) => {
    e.preventDefault();
    const indexFondo = selectFondoGasto.value; // Obtenemos el índice del array
    const montoGasto = parseFloat(document.getElementById("gasto-monto").value);

    if (indexFondo === "") {
        alert("Debes crear un fondo primero.");
        return;
    }

    if (montoGasto > 0 && fondos[indexFondo].monto >= montoGasto) {
        fondos[indexFondo].monto -= montoGasto;
        guardar();
        renderizar();
        formGasto.reset();
    } else {
        alert("Saldo insuficiente para este gasto.");
    }
});

// Reiniciar
document.getElementById("btn-borrar-datos").addEventListener("click", () => {
    if(confirm("¿Borrar todo?")) {
        localStorage.clear();
        fondos = [];
        deudas = [];
        renderizar();
    }
});

// Inicializar
renderizar();