// Función para verificar si hay datos en la tabla o en localStorage
function verificarDatos() {
    const idsToCheck = [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3', 
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4', 
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2', 
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2', 
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2', 
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-17-col-1', 'row-17-col-4', 'row-19-col-1', 
        'row-19-col-4'
    ];

    let hayDatosEnTabla = idsToCheck.some(id => {
        let element = document.getElementById(id);
        return element && element.textContent.trim() !== '';
    });

    let hayDatosEnLocalStorage = localStorage.getItem('corteInProgress') !== null;

    if (hayDatosEnTabla || hayDatosEnLocalStorage) {
        document.getElementById('limpiarTablaBtn').disabled = false;
    } else {
        document.getElementById('limpiarTablaBtn').disabled = true;
    }
}
// Llama a la función verificarDatos al cargar la página
window.addEventListener('load', verificarDatos);

// Modifica la función iniciarCorte para incluir la verificación de datos
async function iniciarCorte() {
    let currentStep = 0;

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
            const savedData = JSON.parse(localStorage.getItem('corteInProgress'));
            for (const [key, value] of Object.entries(savedData.values)) {
                let element = document.getElementById(key);
                if (element) {
                    element.textContent = value;
                }
            }
            currentStep = savedData.currentStep;
        } else {
            localStorage.removeItem('corteInProgress');
        }
    }

    // Resto del código para obtener valores e interactuar con el usuario
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

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('swal2-close')) {
            Swal.close();
            event.target.closest('.swal2-container').__cancelled = true;
            verificarDatos(); // Verificar datos después de cerrar el Swal
        }
    });

    const saveDataToLocalStorage = () => {
        const dataToSave = {
            values: {},
            currentStep: currentStep
        };
        elements.forEach(element => {
            const value = document.getElementById(element.id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[element.id] = value;
            }
            const ttlId = element.id.replace('col-2', 'col-3');
            const ttlValue = document.getElementById(ttlId).textContent.trim();
            if (ttlValue && !isNaN(ttlValue)) {
                dataToSave.values[ttlId] = ttlValue;
            }
        });
        totals.forEach(total => {
            const value = document.getElementById(total.id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[total.id] = value;
            }
        });
        const additionalIds = ['row-8-col-5', 'row-2-col-3', 'row-9-col-3', 'row-17-col-1', 'row-19-col-1', 'row-17-col-4', 'row-19-col-4'];
        additionalIds.forEach(id => {
            const value = document.getElementById(id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[id] = value;
            }
        });

        localStorage.setItem('corteInProgress', JSON.stringify(dataToSave));
        verificarDatos(); // Verificar datos después de guardar en localStorage
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
           { id: 'row-3-col-4', promptText: 'Ingrese el valor para T.Débito' },
           { id: 'row-5-col-4', promptText: 'Ingrese el valor para T.Crédito' },
           { id: 'row-7-col-4', promptText: 'Ingrese el valor para T.Amex' }
       ];

       var totalMonedas = 0;
       var totalBilletes = 0;
       var primerDatoIngresado = false;

       for (; currentStep < elements.length; currentStep++) {
           const element = elements[currentStep];
           const value = await getValue(element.promptText);
           if (document.querySelector('.swal2-container').__cancelled) {
               saveDataToLocalStorage();
               verificarDatos();
               return;
           }
           if (value === 'cancel') {
               saveDataToLocalStorage();
               verificarDatos();
               return;
           }
           if (value !== null && value !== 'done') {
               document.getElementById(element.id).textContent = value;
               if (element.multiplier) {
                   const ttlValue = value * element.multiplier;
                   const ttlId = element.id.replace('col-2', 'col-3');
                   document.getElementById(ttlId).textContent = ttlValue.toFixed(2);
                   if (element.id >= 'row-4-col-2' && element.id <= 'row-8-col-2') {
                       totalMonedas += ttlValue;
                   } else if (element.id >= 'row-10-col-2' && element.id <= 'row-15-col-2') {
                       totalBilletes += ttlValue;
                   }
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
               verificarDatos();
               return;
           }
           if (value === 'cancel') {
               saveDataToLocalStorage();
               verificarDatos();
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
       document.getElementById('row-2-col-3').textContent = totalMonedas.toFixed(2);
       document.getElementById('row-9-col-3').textContent = totalBilletes.toFixed(2);

       var fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
       var tEfectivoSF = totalMonedas + totalBilletes + totalGastosVales - fondo;
       document.getElementById('row-17-col-1').textContent = tEfectivoSF.toFixed(2);

       var tEfectivoCF = totalMonedas + totalBilletes + totalGastosVales;
       document.getElementById('row-19-col-1').textContent = tEfectivoCF.toFixed(2);

       var tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
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
       document.getElementById('editarValorBtn').disabled = false;

       // Limpiar datos guardados en localStorage al finalizar correctamente
       localStorage.removeItem('corteInProgress');
       verificarDatos();
   }

   // Función para limpiar la tabla y localStorage
function limpiarTabla() {
    const idsToClear = [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3', 
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4', 
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2', 
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2', 
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2', 
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-17-col-1', 'row-17-col-4', 'row-19-col-1', 
        'row-19-col-4'
    ];

    idsToClear.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.textContent = '';
        }
    });

    document.getElementById('sugerirFondoBtn').disabled = true;
    document.getElementById('limpiarTablaBtn').disabled = true;
    document.getElementById('editarValorBtn').disabled = true;

    localStorage.removeItem('corteInProgress');

    verificarDatos();
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
// funciones para el botin editar valor
let editTimeout;

function habilitarEdicion() {
    Swal.fire({
        title: 'Aviso',
        text: 'Toca cualquier celda para editar',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
    }).then(() => {
        let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"],td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"],td[id="row-12-col-4"],td[id="row-13-col-4"]');
        console.log(celdas)
        celdas.forEach(celda => {
            celda.style.backgroundColor = 'yellow';
            celda.addEventListener('click', editarCelda);
        });
        editTimeout = setTimeout(() => {
            Swal.fire({
                title: 'Aviso',
                text: 'Cerrando la edición de valores, pulsa el botón "Continuar" si deseas seguir editando',
                confirmButtonText: 'Continuar',
                timerProgressBar:true,
                timer:2000,
            }).then(result => {
                if (result.isConfirmed) {
                    habilitarEdicion();
                } else {
                    celdas.forEach(celda => {
                        celda.style.backgroundColor = '';
                        celda.removeEventListener('click', editarCelda);
                    });
                }
            });
        }, 5000); // 5 segundos de espera
    });
}

function editarCelda(event) {
    clearTimeout(editTimeout);
    let celda = event.target;
    let tipo = celda.previousElementSibling ? celda.previousElementSibling.textContent : '';

    // Si la celda es una de las tarjetas o vales/bolsas, tomar el texto del encabezado por ID
    const tarjetaIDs = {
        'row-3-col-4': 'T.Débito',
        'row-5-col-4': 'T.Crédito',
        'row-7-col-4': 'T.Amex'
    };
    const valesBolsasIDs = {
        'row-9-col-4': 'ValesBolsas1',
        'row-10-col-4': 'ValesBolsas2',
        'row-11-col-4': 'ValesBolsas3',
        'row-12-col-4': 'ValesBolsas4',
        'row-13-col-4': 'ValesBolsas5'
    };

    if (tarjetaIDs[celda.id]) {
        tipo = tarjetaIDs[celda.id];
    } else if (valesBolsasIDs[celda.id]) {
        tipo = valesBolsasIDs[celda.id];
    } else if (celda.previousElementSibling) {
        tipo = celda.previousElementSibling.textContent;
    }

    if (valesBolsasIDs[celda.id]) {
        editarGastoCelda(`Ingrese el valor para ${tipo}`, celda.id).then(result => {
            if (result) {
                celda.textContent = result.displayText;
                actualizarTotales();
            }
            celda.style.backgroundColor = '';
            celda.removeEventListener('click', editarCelda);
            iniciarTemporizador();
        }).catch(error => {
            console.error('Error al editar la celda:', error);
        });
    } else {
        Swal.fire({
            title: 'Editar valor',
            text: `¿Deseas editar el valor de ${tipo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Nuevo valor',
                    text: `Ingresa el nuevo valor para ${tipo}`,
                    input: 'number',
                    inputAttributes: {
                        'aria-label': 'Nuevo valor'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: (nuevoValor) => {
                        if (!nuevoValor) {
                            Swal.showValidationMessage('Debes ingresar un valor');
                        }
                        return nuevoValor;
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        celda.textContent = result.value;
                        actualizarTotales();
                        celda.style.backgroundColor = '';
                        celda.removeEventListener('click', editarCelda);
                        iniciarTemporizador();
                    }
                });
            } else {
                celda.style.backgroundColor = '';
                celda.removeEventListener('click', editarCelda);
                habilitarEdicion();
            }
        });
    }
}

async function editarGastoCelda(promptText, gastoId) {
    const cell = document.getElementById(gastoId);
    const cellText = cell ? cell.textContent : '';

    // Agregar un console.log para verificar el valor de cellText
    console.log("Valor de cellText:", cellText);

    let initialType = '';
    let initialValeAmount = '';
    let initialMonedaType = '';
    let initialMonedaAmount = '';

    // Determinar el tipo y los valores iniciales basados en cellText
    if (cellText.includes('Vales')) {
        initialType = 'vales';
        initialValeAmount = cellText.split('=')[1].trim(); // Extraer cantidad de vales
    } else {
        const parts = cellText.split('=');
        if (parts.length === 2) {
            const possibleMonedaType = parseFloat(parts[0].trim());
            if (!isNaN(possibleMonedaType) && possibleMonedaType >= 0.5 && possibleMonedaType <= 10) {
                initialType = 'bolsaMonedas';
                initialMonedaType = parts[0].trim(); // Extraer tipo de moneda
                initialMonedaAmount = parts[1].trim(); // Extraer cantidad de dinero
            }
        }
    }

    // Generar HTML basado en initialType
    function createInputHTML() {
        if (initialType === 'vales') {
            return `
                <div id="vales-input">
                    <input id="vales-amount" type="number" class="swal2-input" placeholder="Cantidad de Vales" value="${initialValeAmount}">
                </div>
            `;
        } else if (initialType === 'bolsaMonedas') {
            return `
                <div id="bolsa-input">
                    <input id="moneda-type" type="number" class="swal2-input" placeholder="Tipo de Moneda (Valor)" value="${initialMonedaType}">
                    <input id="moneda-amount" type="number" class="swal2-input" placeholder="Cantidad de Dinero" value="${initialMonedaAmount}">
                </div>
            `;
        }
        return '<div>No se detectó un tipo válido</div>';
    }

    // Validar y obtener los valores del formulario
    function validateAndGetFormValues() {
        if (initialType === 'vales') {
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
        } else if (initialType === 'bolsaMonedas') {
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

    const swalResult = await Swal.fire({
        title: `${promptText}`,
        html: createInputHTML(),
        focusConfirm: false,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        preConfirm: validateAndGetFormValues
    });

    if (swalResult.isConfirmed) {
        const newValue = { ...swalResult.value };
        const cellId = gastoId;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.setAttribute('data-type', newValue.dataType);
            cell.textContent = newValue.displayText;
            actualizarTotales();
        }
        return newValue;
    }
    return null;
}

function actualizarTotales() {
    let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"], td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]');
    let totalMonedas = 0;
    let totalBilletes = 0;
    let totalValesBolsas = 0;

    celdas.forEach(celda => {
        let valor = parseFloat(celda.textContent) || 0;
        let denominacionTexto = celda.previousElementSibling ? celda.previousElementSibling.textContent : '';
        let denominacion = 0;

        if (denominacionTexto.includes('$')) {
            denominacion = parseFloat(denominacionTexto.replace('$', '').replace(',', ''));
        } else if (denominacionTexto.includes('¢')) {
            denominacion = parseFloat(denominacionTexto.replace('¢', '')) / 100;
        }

        if (denominacion < 20) {
            totalMonedas += valor * denominacion;
        } else {
            totalBilletes += valor * denominacion;
        }

        let colTotal = celda.nextElementSibling;
        if (colTotal) {
            colTotal.textContent = (valor * denominacion).toFixed(2);
        }
    });

    // Actualizar total de vales y bolsas
    let valesBolsasCeldas = document.querySelectorAll('td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]');
    valesBolsasCeldas.forEach(celda => {
        let valor = parseFloat(celda.textContent.split('=')[1]) || 0;
        totalValesBolsas += valor;
    });

    let row2Col3 = document.getElementById('row-2-col-3');
    if (row2Col3) row2Col3.textContent = totalMonedas.toFixed(2);

    let row9Col3 = document.getElementById('row-9-col-3');
    if (row9Col3) row9Col3.textContent = totalBilletes.toFixed(2);

    let row8Col5 = document.getElementById('row-8-col-5');
    if (row8Col5) row8Col5.textContent = totalValesBolsas.toFixed(2);

    // Actualizar total de efectivo
    let fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
    let totalEfectivo = totalMonedas + totalBilletes + totalValesBolsas;
    let tEfectivoSF = totalEfectivo - fondo;
    let tEfectivoCF = totalEfectivo;

    let row17Col1 = document.getElementById('row-17-col-1');
    if (row17Col1) row17Col1.textContent = tEfectivoSF.toFixed(2);

    let row19Col1 = document.getElementById('row-19-col-1');
    if (row19Col1) row19Col1.textContent = tEfectivoCF.toFixed(2);

    // Actualizar total final
    let tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
    let tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    let tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    let tTarjetas = tDebito + tCredito + tAmex;

    let row17Col4 = document.getElementById('row-17-col-4');
    if (row17Col4) row17Col4.textContent = tTarjetas.toFixed(2);

    let row19Col4 = document.getElementById('row-19-col-4');
    if (row19Col4) row19Col4.textContent = (tEfectivoCF + tTarjetas).toFixed(2);
}

function iniciarTemporizador() {
    editTimeout = setTimeout(() => {
        Swal.fire({
            title: 'Aviso',
            text: 'Cerrado la edición de valores, pulsa el botón "Continuar" si deseas seguir editando',
            confirmButtonText: 'Continuar',
            timerProgressBar:true,
            timer: 1500
        }).then(result => {
            if (result.isConfirmed) {
                habilitarEdicion();
            } else {
                let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"],td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"],td[id="row-12-col-4"],td[id="row-13-col-4"]');
                celdas.forEach(celda => {
                    celda.style.backgroundColor = '';
                    celda.removeEventListener('click', editarCelda);
                });
            }
        });
    }, 2500);
}