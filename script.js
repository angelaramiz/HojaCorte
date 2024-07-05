async function iniciarCorte() {
    let currentStep = 0;

    // Función para calcular los totales
    function calcularTotales() {
        let totalMonedas = 0;
        let totalBilletes = 0;

        // Calcular total de monedas
        for (let i = 4; i <= 8; i++) {
            const cantidad = parseFloat(document.getElementById(`row-${i}-col-2`).textContent) || 0;
            const valor = [0.5, 1, 2, 5, 10][i - 4];
            totalMonedas += cantidad * valor;
        }

        // Calcular total de billetes
        for (let i = 10; i <= 15; i++) {
            const cantidad = parseFloat(document.getElementById(`row-${i}-col-2`).textContent) || 0;
            const valor = [20, 50, 100, 200, 500, 1000][i - 10];
            totalBilletes += cantidad * valor;
        }

        // Actualizar los totales en la tabla
        document.getElementById('row-2-col-3').textContent = totalMonedas.toFixed(2);
        document.getElementById('row-9-col-3').textContent = totalBilletes.toFixed(2);

        return { totalMonedas, totalBilletes };
    }

    // Verificar si hay datos guardados en localStorage
    if (localStorage.getItem('corteInProgress')) {
        const { isConfirmed } = await Swal.fire({
            title: 'Continuar desde el último guardado',
            text: 'Se encontró un corte en progreso. ¿Desea continuar desde donde se interrumpió?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });
        
        if (isConfirmed) {
            // Cargar datos desde localStorage
            const savedData = JSON.parse(localStorage.getItem('corteInProgress'));
            for (const [key, value] of Object.entries(savedData.values)) {
                document.getElementById(key).textContent = value;
            }
            currentStep = savedData.currentStep;

            // Calcular los totales después de cargar los datos
            calcularTotales();
        } else {
            // Limpiar datos guardados si el usuario decide no continuar
            localStorage.removeItem('corteInProgress');
        }
    }

    // Función para obtener el valor ingresado
    async function getValue(promptText, showDenyButton = false) {
        const result = await Swal.fire({
            title: promptText,
            input: 'number',
            inputAttributes: {
                autocapitalize: 'off',
                inputmode: 'decimal',
                step: 'any'
            },
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showDenyButton: showDenyButton,
            denyButtonText: 'Listo',
            allowOutsideClick: false,
            allowEscapeKey: false,
            html: `<button class="swal2-close" style="position: absolute; top: 0; right: 0; background: none; border: none; font-size: 1.5em; cursor: pointer;">&times;</button>`
        });

        if (result.isDenied) {
            return 'done';
        }

        if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.backdrop || result.dismiss === Swal.DismissReason.esc) {
            return 'cancel';
        }

        return result.value ? parseFloat(result.value) : null;
    }

    const saveDataToLocalStorage = () => {
        const dataToSave = {
            values: {},
            currentStep: currentStep
        };
        elements.forEach(element => {
            const value = document.getElementById(element.id).textContent.trim();
            if (value) {
                dataToSave.values[element.id] = value;
            }
            const ttlId = element.id.replace('col-2', 'col-3');
            const ttlValue = document.getElementById(ttlId).textContent.trim();
            if (ttlValue) {
                dataToSave.values[ttlId] = ttlValue;
            }
        });
        totals.forEach(total => {
            const value = document.getElementById(total.id).textContent.trim();
            if (value) {
                dataToSave.values[total.id] = value;
            }
        });
        const additionalIds = ['row-8-col-5', 'row-2-col-3', 'row-9-col-3', 'row-17-col-1', 'row-19-col-1', 'row-17-col-4', 'row-19-col-4'];
        additionalIds.forEach(id => {
            const value = document.getElementById(id).textContent.trim();
            if (value) {
                dataToSave.values[id] = value;
            }
        });

        localStorage.setItem('corteInProgress', JSON.stringify(dataToSave));
    };

    var elements = [
        { id: 'row-4-col-2', promptText: 'Ingrese el valor para ¢50, Cat', multiplier: 0.5 },
        { id: 'row-5-col-2', promptText: 'Ingrese el valor para $1, Cat', multiplier: 1 },
        { id: 'row-6-col-2', promptText: 'Ingrese el valor para $2, Cat', multiplier: 2 },
        { id: 'row-7-col-2', promptText: 'Ingrese el valor para $5, Cat', multiplier: 5 },
        { id: 'row-8-col-2', promptText: 'Ingrese el valor para $10, Cat', multiplier: 10 },
        { id: 'row-10-col-2', promptText: 'Ingrese el valor para $20, Cat', multiplier: 20 },
        { id: 'row-11-col-2', promptText: 'Ingrese el valor para $50, Cat', multiplier: 50 },
        { id: 'row-12-col-2', promptText: 'Ingrese el valor para $100, Cat', multiplier: 100 },
        { id: 'row-13-col-2', promptText: 'Ingrese el valor para $200, Cat', multiplier: 200 },
        { id: 'row-14-col-2', promptText: 'Ingrese el valor para $500, Cat', multiplier: 500 },
        { id: 'row-15-col-2', promptText: 'Ingrese el valor para $1,000, Cat', multiplier: 1000 }
    ];

    var totals = [
        { id: 'row-3-col-3', promptText: 'Ingrese el valor para T.Débito' },
        { id: 'row-5-col-4', promptText: 'Ingrese el valor para T.Crédito' },
        { id: 'row-7-col-4', promptText: 'Ingrese el valor para T.Amex' }
    ];

    var primerDatoIngresado = false;

    for (; currentStep < elements.length; currentStep++) {
        const element = elements[currentStep];
        const value = await getValue(element.promptText);
        if (document.querySelector('.swal2-container').__cancelled) {
            saveDataToLocalStorage();
            return;
        }
        if (value === 'cancel') {
            saveDataToLocalStorage();
            return;
        }
        if (value !== null && value !== 'done') {
            document.getElementById(element.id).textContent = value;
            if (element.multiplier) {
                const ttlValue = value * element.multiplier;
                const ttlId = element.id.replace('col-2', 'col-3');
                document.getElementById(ttlId).textContent = ttlValue.toFixed(2);
            }
            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById('limpiarTablaBtn').disabled = false; // Habilitar botón "Limpiar Tabla"
            }
        }
    }

    for (; currentStep - elements.length < totals.length; currentStep++) {
        const total = totals[currentStep - elements.length];
        const value = await getValue(total.promptText);
        if (document.querySelector('.swal2-container').__cancelled) {
            saveDataToLocalStorage();
            return;
        }
        if (value === 'cancel') {
            saveDataToLocalStorage();
            return;
        }
        if (value !== null && value !== 'done') {
            document.getElementById(total.id).textContent = value.toFixed(2);
            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById('limpiarTablaBtn').disabled = false; // Habilitar botón "Limpiar Tabla"
            }
        }
    }

    // Calcular los totales finales
    const { totalMonedas, totalBilletes } = calcularTotales();

    var totalGastosVales = 0;
    const gastosResult = await getGastoValue('Ingrese los gastos', 'row-9-col-4');
    if (gastosResult) {
        gastosResult.forEach(gasto => {
            totalGastosVales += gasto.amount;
        });
    }
    document.getElementById('row-8-col-5').textContent = totalGastosVales.toFixed(2);

    // Guardar datos en localStorage
    saveDataToLocalStorage();

    var fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
    var tEfectivoSF = totalMonedas + totalBilletes + totalGastosVales - fondo;
    document.getElementById('row-17-col-1').textContent = tEfectivoSF.toFixed(2);

    var tEfectivoCF = totalMonedas + totalBilletes + totalGastosVales;
    document.getElementById('row-19-col-1').textContent = tEfectivoCF.toFixed(2);

    var tDebito = parseFloat(document.getElementById('row-3-col-3').textContent) || 0;
    var tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    var tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    var tTarjetas = tDebito + tCredito + tAmex;
    document.getElementById('row-17-col-4').textContent = tTarjetas.toFixed(2);

    var tFinal = tEfectivoCF + tTarjetas;
    document.getElementById('row-19-col-4').textContent = tFinal.toFixed(2);

    // Guardar datos en localStorage
    saveDataToLocalStorage();

    document.getElementById('sugerirFondoBtn').disabled = false;
    document.getElementById('limpiarTablaBtn').disabled = false;

    // Limpiar datos guardados en localStorage al finalizar correctamente
    localStorage.removeItem('corteInProgress');
}

// Continuación de las demás funciones...
function limpiarTabla() {
    const idsToClear = [
        'row-2-col-3', 'row-3-col-3', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3', 
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4', 
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2', 
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2', 
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2', 
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-17-col-1', 'row-17-col-4', 'row-19-col-1', 
        'row-19-col-4'
    ];

    idsToClear.forEach(id => {
        document.getElementById(id).textContent = '';
    });

    document.getElementById('sugerirFondoBtn').disabled = true;
    document.getElementById('limpiarTablaBtn').disabled = true;  
}

// Función para mostrar formulario de gastos con SweetAlert2
async function getGastoValue(promptText, gastoId) {
    let allValues = [];
    let currentIndex = parseInt(gastoId.split('-')[1]) - 9;
    let maxIndex = 4; // 5 espacios de gastos en total (del 9 al 13)

    function createInputHTML() {
        return `
            <select id="gasto-type" class="swal2-input">
                <option value="" disabled selected>Seleccione una opción</option>
                <option value="vales">Vales</option>
                <option value="bolsaMonedas">BolsaMonedas</option>
            </select>
            <div id="vales-input" style="display:none;">
                <input id="vales-amount" type="number" class="swal2-input" placeholder="Cantidad de Vales">
            </div>
            <div id="bolsa-input" style="display:none;">
                <input id="moneda-type" type="number" class="swal2-input" placeholder="Tipo de Moneda (Valor)">
                <input id="moneda-amount" type="number" class="swal2-input" placeholder="Cantidad de Dinero">
            </div>
        `;
    }

    function setupEventListeners() {
        const gastoTypeSelect = Swal.getPopup().querySelector('#gasto-type');
        const valesInput = Swal.getPopup().querySelector('#vales-input');
        const bolsaInput = Swal.getPopup().querySelector('#bolsa-input');
        gastoTypeSelect.addEventListener('change', (event) => {
            if (event.target.value === 'vales') {
                valesInput.style.display = 'block';
                bolsaInput.style.display = 'none';
            } else if (event.target.value === 'bolsaMonedas') {
                valesInput.style.display = 'none';
                bolsaInput.style.display = 'block';
            } else {
                valesInput.style.display = 'none';
                bolsaInput.style.display = 'none';
            }
        });
    }

    function validateAndGetFormValues() {
        const gastoType = Swal.getPopup().querySelector('#gasto-type').value;
        if (gastoType === 'vales') {
            const valesAmount = parseFloat(Swal.getPopup().querySelector('#vales-amount').value);
            if (isNaN(valesAmount) || valesAmount <= 0) {
                Swal.showValidationMessage('Por favor, ingrese una cantidad válida para los vales');
                return false;
            }
            return { 
                type: 'vales', 
                amount: valesAmount, 
                displayText: `Vales = ${valesAmount.toFixed(2)}`,
                dataType: 'vales'
            };
        } else if (gastoType === 'bolsaMonedas') {
            const monedaType = parseFloat(Swal.getPopup().querySelector('#moneda-type').value);
            const monedaAmount = parseFloat(Swal.getPopup().querySelector('#moneda-amount').value);
            if (isNaN(monedaType) || isNaN(monedaAmount) || monedaType <= 0 || monedaAmount <= 0) {
                Swal.showValidationMessage('Por favor, ingrese valores válidos para el tipo de moneda y la cantidad');
                return false;
            }
            return { 
                type: 'bolsaMonedas', 
                amount: monedaAmount,
                displayText: `${monedaType} = ${monedaAmount.toFixed(2)}`,
                dataType: 'bolsaMonedas'
            };
        }
        Swal.showValidationMessage('Por favor, seleccione un tipo de gasto');
        return false;
    }

    async function showGastoForm(index) {
        return Swal.fire({
            title: `${promptText} (Gasto ${index + 1})`,
            html: createInputHTML(),
            focusConfirm: false,
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Finalizar',
            didOpen: setupEventListeners,
            preConfirm: validateAndGetFormValues
        });
    }

    while (currentIndex <= maxIndex) {
        const swalResult = await showGastoForm(currentIndex);

        if (swalResult.isConfirmed) {
            allValues.push({ ...swalResult.value, index: currentIndex });
            currentIndex++;
            
            if (currentIndex <= maxIndex) {
                const nextResult = await Swal.fire({
                    title: '¿Desea agregar otro gasto?',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No'
                });
                
                if (!nextResult.isConfirmed) {
                    break;
                }
            } else {
                break;
            }
        } else {
            break;
        }
    }

    // Aplicar los valores a las celdas correspondientes
    allValues.forEach(value => {
        const cellId = `row-${value.index + 9}-col-4`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.setAttribute('data-type', value.dataType);
            cell.textContent = value.displayText;
        }
    });

    // Limpiar las celdas restantes si se finalizó antes de llenar todos los espacios
    for (let i = allValues.length; i < 5; i++) {
        const cellId = `row-${i + 9}-col-4`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.removeAttribute('data-type');
            cell.textContent = '';
        }
    }

    return allValues.length > 0 ? allValues : null;
}

// Función para sugerir la mejor combinación para el fondo
function sugerirFondo() {
    const fondoObjetivo = 3000;
    let restante = fondoObjetivo;

    // Recolección de valores de "vales" y "BolsaMonedas" de las celdas row-9 a row-13 en col-4
    let vales = [];
    let bolsaMonedas = [];

    for (let i = 9; i <= 13; i++) {
        const cell = document.getElementById(`row-${i}-col-4`);
        const valorTexto = cell.textContent;
        const tipo = cell.getAttribute("data-type");
        const valor = parseFloat(valorTexto.split('=')[1]) || 0;
        if (tipo === "vales") {
            vales.push(valor);
        } else if (tipo === "bolsaMonedas") {
            const tipoMoneda = parseFloat(valorTexto.split('=')[0].trim());
            bolsaMonedas.push({ tipoMoneda, valor });
        }
    }

    const monedas = [
        { denominacion: 0.5, cantidad: parseInt(document.getElementById('row-4-col-2').textContent) || 0 },
        { denominacion: 1, cantidad: parseInt(document.getElementById('row-5-col-2').textContent) || 0 },
        { denominacion: 2, cantidad: parseInt(document.getElementById('row-6-col-2').textContent) || 0 },
        { denominacion: 5, cantidad: parseInt(document.getElementById('row-7-col-2').textContent) || 0 },
        { denominacion: 10, cantidad: parseInt(document.getElementById('row-8-col-2').textContent) || 0 }
    ];

    const billetes = [
        { denominacion: 20, cantidad: parseInt(document.getElementById('row-10-col-2').textContent) || 0 },
        { denominacion: 50, cantidad: parseInt(document.getElementById('row-11-col-2').textContent) || 0 },
        { denominacion: 100, cantidad: parseInt(document.getElementById('row-12-col-2').textContent) || 0 },
        { denominacion: 200, cantidad: parseInt(document.getElementById('row-13-col-2').textContent) || 0 },
        { denominacion: 500, cantidad: parseInt(document.getElementById('row-14-col-2').textContent) || 0 },
        { denominacion: 1000, cantidad: parseInt(document.getElementById('row-15-col-2').textContent) || 0 }
    ];

    function generarSugerencia(priorizarMonedas) {
        let sugerencia = {};
        let restanteLocal = fondoObjetivo;

        // Sugerir Vales
        vales.sort((a, b) => b - a);
        for (const vale of vales) {
            if (vale <= restanteLocal) {
                sugerencia.vales = sugerencia.vales || [];
                sugerencia.vales.push(vale);
                restanteLocal -= vale;
            }
            if (restanteLocal === 0) break;
        }

        // Sugerir Bolsa Monedas
        bolsaMonedas.sort((a, b) => b.tipoMoneda - a.tipoMoneda);
        for (const item of bolsaMonedas) {
            if (item.valor <= restanteLocal) {
                sugerencia.bolsaMonedas = sugerencia.bolsaMonedas || [];
                sugerencia.bolsaMonedas.push(item);
                restanteLocal -= item.valor;
            }
            if (restanteLocal === 0) break;
        }

        function sugerirDenominacion(items, key) {
            for (const item of items) {
                if (item.cantidad > 0) {
                    const cantidadNecesaria = Math.min(Math.floor(restanteLocal / item.denominacion), item.cantidad);
                    if (cantidadNecesaria > 0) {
                        sugerencia[key] = sugerencia[key] || [];
                        sugerencia[key].push({
                            denominacion: item.denominacion,
                            cantidad: cantidadNecesaria
                        });
                        restanteLocal -= cantidadNecesaria * item.denominacion;
                    }
                }
                if (restanteLocal === 0) break;
            }
        }

        if (priorizarMonedas) {
            sugerirDenominacion(monedas.reverse(), 'monedas');
            sugerirDenominacion(billetes.reverse(), 'billetes');
        } else {
            sugerirDenominacion(billetes.reverse(), 'billetes');
            sugerirDenominacion(monedas.reverse(), 'monedas');
        }

        return { sugerencia, restante: restanteLocal };
    }

    function generarMensaje(resultado, priorizarMonedas) {
        const { sugerencia, restante } = resultado;
        let mensaje = `Sugerencia para el fondo de $${fondoObjetivo} (${priorizarMonedas ? 'Priorizando Monedas' : 'Priorizando Billetes'}):\n`;

        if (sugerencia.vales && sugerencia.vales.length > 0) {
            mensaje += `Vales:\n`;
            sugerencia.vales.forEach(vale => {
                mensaje += `  Vales = $${vale.toFixed(2)}\n`;
            });
        }

        if (sugerencia.bolsaMonedas && sugerencia.bolsaMonedas.length > 0) {
            mensaje += `BolsaMonedas:\n`;
            sugerencia.bolsaMonedas.forEach(item => {
                mensaje += `  ${item.tipoMoneda} = $${item.valor.toFixed(2)}\n`;
            });
        }

        if (sugerencia.billetes && sugerencia.billetes.length > 0) {
            mensaje += `Billetes:\n`;
            sugerencia.billetes.forEach(item => {
                const total = item.denominacion * item.cantidad;
                mensaje += `  $${item.denominacion} x ${item.cantidad} = $${total.toFixed(2)}\n`;
            });
        }

        if (sugerencia.monedas && sugerencia.monedas.length > 0) {
            mensaje += `Monedas:\n`;
            sugerencia.monedas.forEach(item => {
                const total = item.denominacion * item.cantidad;
                if (item.denominacion < 1) {
                    mensaje += `  ${(item.denominacion * 100).toFixed(0)}¢ x ${item.cantidad} = $${total.toFixed(2)}\n`;
                } else {
                    mensaje += `  $${item.denominacion.toFixed(2)} x ${item.cantidad} = $${total.toFixed(2)}\n`;
                }
            });
        }

        if (restante > 0) {
            mensaje += `\nAdvertencia: No se pudo alcanzar el fondo objetivo. Falta: $${restante.toFixed(2)}`;
        } else if (restante < 0) {
            mensaje += `\nAdvertencia: La sugerencia excede el fondo objetivo por: $${Math.abs(restante).toFixed(2)}`;
        } else {
            mensaje += `\nLa sugerencia alcanza exactamente el fondo objetivo de $${fondoObjetivo}.`;
        }

        return mensaje;
    }

    const resultadoMonedas = generarSugerencia(true);
    const resultadoBilletes = generarSugerencia(false);

    let priorizarMonedas = true;

    Swal.fire({
        title: 'Sugerencia de Fondo',
        html: `
            <div id="mensaje-sugerencia">${generarMensaje(resultadoMonedas, true).replace(/\n/g, '<br>')}</div>
            <div class="switch-container" style="margin-top: 20px;">
                <label class="switch">
                    <input type="checkbox" id="prioridad-switch">
                    <span class="slider round"></span>
                </label>
                <span id="prioridad-label" style="margin-left: 10px;">Priorizar Monedas</span>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        didOpen: () => {
            const switchElement = document.getElementById('prioridad-switch');
            const labelElement = document.getElementById('prioridad-label');
            const mensajeElement = document.getElementById('mensaje-sugerencia');

            switchElement.addEventListener('change', (event) => {
                priorizarMonedas = !event.target.checked;
                labelElement.textContent = priorizarMonedas ? 'Priorizar Monedas' : 'Priorizar Billetes';
                mensajeElement.innerHTML = generarMensaje(
                    priorizarMonedas ? resultadoMonedas : resultadoBilletes,
                    priorizarMonedas
                ).replace(/\n/g, '<br>');
            });
        }
    });
}
