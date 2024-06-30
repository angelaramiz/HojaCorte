async function iniciarCorte() {
    // ID de los elementos de la columna "Cat"
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

    // ID de los elementos de los totales
    var totals = [
        { id: 'row-3-col-3', promptText: 'Ingrese el valor para T.Débito' },
        { id: 'row-5-col-4', promptText: 'Ingrese el valor para T.Crédito' },
        { id: 'row-7-col-4', promptText: 'Ingrese el valor para T.Amex' }
    ];

    // ID de los elementos de Gastos
    var gastos = [
        { id: 'row-9-col-4', promptText: 'Agregar valor de gastos1' },
        { id: 'row-10-col-4', promptText: 'Agregar valor de gastos2' },
        { id: 'row-11-col-4', promptText: 'Agregar valor de gastos3' },
        { id: 'row-12-col-4', promptText: 'Agregar valor de gastos4' },
        { id: 'row-13-col-4', promptText: 'Agregar valor de gastos5' }
    ];

    // Variables para acumular totales
    var totalMonedas = 0;
    var totalBilletes = 0;

    // Función para mostrar prompt con SweetAlert2
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
            denyButtonText: 'Listo'
        });

        if (result.isDenied) {
            return 'done';
        }

        return result.value ? parseFloat(result.value) : null;
    }

    // Asignar valores a los elementos de la columna "Cat" y calcular "Ttl"
    for (const element of elements) {
        const value = await getValue(element.promptText);
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
        }
    }

    // Asignar valores a los elementos de totales
    for (const total of totals) {
        const value = await getValue(total.promptText);
        if (value !== null && value !== 'done') {
            document.getElementById(total.id).textContent = value.toFixed(2);
        }
    }

    // Asignar valores a los elementos de Gastos y sumar en row-8 col-5
    var totalGastosVales = 0;
    for (const gasto of gastos) {
        const value = await getValue(gasto.promptText, true);
        if (value === 'done') {
            break;
        }
        if (value !== null) {
            document.getElementById(gasto.id).textContent = value.toFixed(2);
            totalGastosVales += value;
        }
    }
    document.getElementById('row-8-col-5').textContent = totalGastosVales.toFixed(2);

    // Asignar totales de monedas y billetes
    document.getElementById('row-2-col-3').textContent = totalMonedas.toFixed(2);
    document.getElementById('row-9-col-3').textContent = totalBilletes.toFixed(2);

    // Calcular y asignar T.Efectivo,s/F
    var fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
    var tEfectivoSF = totalMonedas + totalBilletes + totalGastosVales - fondo;
    document.getElementById('row-17-col-1').textContent = tEfectivoSF.toFixed(2);

    // Calcular y asignar T.Efectivo,c/F
    var tEfectivoCF = totalMonedas + totalBilletes + totalGastosVales;
    document.getElementById('row-19-col-1').textContent = tEfectivoCF.toFixed(2);

    // Calcular y asignar T.Tarjetas
    var tDebito = parseFloat(document.getElementById('row-3-col-3').textContent) || 0;
    var tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    var tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    var tTarjetas = tDebito + tCredito + tAmex;
    document.getElementById('row-17-col-4').textContent = tTarjetas.toFixed(2);

    // Calcular y asignar T.Final
    var tFinal = tEfectivoCF + tTarjetas;
    document.getElementById('row-19-col-4').textContent = tFinal.toFixed(2);
}
