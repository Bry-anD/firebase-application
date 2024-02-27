
import { onAuthStateChanged } from 'firebase/auth'
import { trace } from 'firebase/performance'
import { auth, performance } from './firebase.js';
import { realtimeGet, realtimeVal, realtimeElement, realtimeObject, write } from './realtime.js';
import { saveMessagingDeviceToken } from './messaging.js';
import { addTable, addRow } from './tables.js';
import ApexCharts from 'apexcharts'


const gaugeCreateButton = document.getElementById("gauge_widget_create");
const nameProyect = document.getElementById("proyect").innerText


// Crea tabla de datos
addTable('data')

// const t = trace(performance, "traceRealtimeTable")
// t.start()
// Consulta los datos en firebase Realtime Database en el nodo correspondiente
realtimeGet(`${nameProyect}/data`).then((valor) => {

    let table = document.getElementById(`table-data`);
    addRow(valor, table);

    let Elements = Object.keys(valor);
    for (var i = 0; i < Elements.length; i++) {
        let Element = Elements[i];
        realtimeElement(`${nameProyect}/data/${Element}`, Element);
    }

}).catch((error) => {
    console.error(error);
    // t.putAttribute('errorCode', error)
});

// t.stop()

// Crea la tabla con las acciones del sistema 
addTable('actions')
// Consulta los datos en firebase Realtime Database en el nodo correspondiente
realtimeGet(`${nameProyect}/actions`).then((valor) => {

    let table = document.getElementById(`table-actions`);
    addRow(valor, table);
    let Elements = Object.keys(valor);


    for (var i = 0; i < Elements.length; i++) {
        let Element = Elements[i];
        document.getElementById(Element).innerHTML = `<a id="b-${Element}" class"w-full"> </a>`
        realtimeElement(`${nameProyect}/actions/${Element}`, `b-${Element}`);
        // realtimeElement(`${nameProyect}/actions/${Element}`, `${Element}`);

        let buttonAction = document.getElementById(`b-${Element}`);

        buttonAction.addEventListener("click", function () {

            if (buttonAction.innerText == 'true') {
                write(`${nameProyect}/actions/${Element}`, 'false')
            } else {
                write(`${nameProyect}/actions/${Element}`, 'true')
            }
        });

        // Crear un observador de mutaciones
        var observador = new MutationObserver(function (mutaciones) {
            mutaciones.forEach(function (mutacion) {
                if (buttonAction.innerText == 'false') {

                    buttonAction.className = "text-white bg-red-700  rounded-full font-medium text-xl p-6 hover:bg-black hover:text-white transition-colors";

                } else {

                    buttonAction.className = "text-white bg-green-700 rounded-full font-medium text-xl p-6 hover:bg-black hover:text-white transition-colors ";
                }
            });
        });

        // Configurar el observador para escuchar cambios en el contenido del elemento
        observador.observe(buttonAction, { childList: true, subtree: true });
    }



}).catch((error) => {
    console.error(error);
});

// Crea la tabla con los settings del sistema 
addTable('control')
realtimeGet(`${nameProyect}/settings`).then((valor) => {

    let table = document.getElementById(`table-control`);
    addRow(valor, table);
    let Elements = Object.keys(valor);

    for (var i = 0; i < Elements.length; i++) {
        let Element = Elements[i];
        let refElement = document.getElementById(Element)
        let value = refElement.innerText
        refElement.innerHTML = `<input id="c-${Element}" type="text" class"w-full" placeholder="${value}"> </input>`

        let inputElement = document.getElementById(`c-${Element}`);
        inputElement.addEventListener('change', function (e) {
            if (e.target.value != "") {
                write(`${nameProyect}/settings/${Element}`, e.target.value);
            }
        });
    }

}).catch((error) => {
    console.error(error);
});

const lampCreateForm = document.getElementById("lamp-create-form");

lampCreateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const modal = document.getElementById("widget-modal");
    modal.style.display = "none";

    const nombre = document.getElementById("l-name").value
    const operation = document.getElementById("l-operation").value
    const referencia = document.getElementById("l-reference").value
    const renderTo = `${referencia}_l`
    const color = document.getElementById("l-color").value
    const target = document.getElementById("l-target").value


    if (!document.getElementById(renderTo)) {
        const div = document.createElement('div');
        div.id = renderTo
        div.className = "border border-[4px] border-gray-400 opacity-50 w-[150px] h-[150px] bg-gray-50 rounded-full"
        const details = document.createElement('details');
        details.innerHTML = `<summary class="opacity-60 text-gray-500 text-xs"> ${nombre}</summary>
            <p class="text-gray-500 text-xs opacity-60" >Indicador enciende If: ${referencia} ${operation} ${target} </p >`

        details.className = "text-black bg-gray-100 text-sm"
        // Obtener el contenedor existente por su ID
        const container = document.getElementById('canvas-lamp');
        // Agregar el nuevo div al contenedor existente
        container.appendChild(div);
        div.appendChild(details);
    }

    let data = document.getElementById(referencia);

    let lamp = document.getElementById(renderTo)

    const observerOptions = {
        childList: true, subtree: true
    };

    // Crear un observador de mutaciones
    let observador = new MutationObserver(function (mutaciones) {
        mutaciones.forEach(function (mutacion) {

            let conditionMet = false;
            switch (operation) {
                case '==':
                    conditionMet = data.innerText == target;
                    break;
                case '>':
                    conditionMet = data.innerText > target;
                    break;
                case '<':
                    conditionMet = data.innerText < target;
                    break;
                case '!=':
                    conditionMet = data.innerText != target;
                    break;
                default:
                    console.log('Operación no soportada.');
                    return null;
            }
            if (conditionMet) {
                lamp.style.backgroundColor = color;
                lamp.style.opacity = 100;
            } else {
                lamp.style.opacity = 50;
                console.log(data.innerText);
                lamp.style.backgroundColor = '#e5e7eb';
            }


        });
    });

    // Observador para escuchar cambios en el contenido del elemento data
    observador.observe(data, observerOptions);

    if (auth.currentUser) {
        const userUid = document.getElementById("user-uid").innerText
        write(`${nameProyect}/users/${userUid}/sesionElements/lamp/${referencia}`, {
            nombre: nombre,
            operation: operation,
            color: color,
            target: target

        })
    }

});

const indicatorCreateForm = document.getElementById("indicator-create-form");

indicatorCreateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const modal = document.getElementById("widget-modal");
    modal.style.display = "none";

    const referencia = document.getElementById("i-reference").value
    const renderTo = `${referencia}_i`
    const unidades = document.getElementById("i-units").value
    const tipoDatos = document.getElementById("i-data-type").value

    // console.log(renderTo, referencia, unidades, tipoDatos);

    if (!document.getElementById(renderTo)) {
        const div = document.createElement('div');
        div.id = renderTo
        div.className = "border border-[2px] border-red-800 pt-2 bg-white/5 items-center justify-center relative flex flex-col"
        div.innerHTML = `<p class="relative flex pl-2" id="${renderTo}value"> </p><p class="relative flex text-white text-xs bg-red-800"> ${referencia}(${unidades})</p>`
        // Obtener el contenedor existente por su ID
        const container = document.getElementById('canvas-indicator');
        // Agregar el nuevo div al contenedor existente
        container.appendChild(div);
    }


    // if (!document.getElementById(renderTo)) {
    //     const div = document.createElement('div');
    //     div.id = renderTo
    //     div.className = "border border-[4px] border-gray-300 w-[150px] h-[50px] pt-2 bg-gray-50 items-center justify-center relative flex flex-col"
    //     // const span = document.createElement('span');
    //     div.innerHTML = `<p class="relative flex pl-2" id="${renderTo}value"> </p><p class="relative flex text-xs bg-transparent opacity-60"> ${referencia}(${unidades})</p>`
    //     // span.className = "flex text-black text-sm bg-transparent"
    //     // Obtener el contenedor existente por su ID
    //     const container = document.getElementById('canvas-indicator');
    //     // Agregar el nuevo div al contenedor existente
    //     container.appendChild(div);
    //     // div.appendChild(span); 
    // }

    let data = document.getElementById(referencia);

    let indicator = document.getElementById(`${renderTo}value`)

    const observerOptions = {
        childList: true, subtree: true
    };

    // Crear un observador de mutaciones
    let observador = new MutationObserver(function (mutaciones) {
        mutaciones.forEach(function (mutacion) {
            indicator.innerText = data.innerText;

        });
    });

    // Observador para escuchar cambios en el contenido del elemento data
    observador.observe(data, observerOptions);

    if (auth.currentUser) {
        const userUid = document.getElementById("user-uid").innerText
        write(`${nameProyect}/users/${userUid}/sesionElements/indicator/${referencia}`, {
            unidades: unidades,
            tipoDato: tipoDatos,
        })
    }

});

function gaugeCreate() {
    const modal = document.getElementById("widget-modal");
    modal.style.display = "none";

    const thickInterval = document.getElementById("tick_interval_");
    const nameInput = document.getElementById("name_");
    const sourceInput = document.getElementById("source_");
    const minInput = document.getElementById("min_");
    const maxInput = document.getElementById("max_");
    const unitsInput = document.getElementById("units_");

    const name = nameInput.value;
    const source = sourceInput.value;
    const min = parseFloat(minInput.value);
    const max = parseFloat(maxInput.value);
    const thicks = parseFloat(thickInterval.value);
    const units = unitsInput.value;
    const renderTo = `${source}_g`;

    if (source.length < 1) {
        document.getElementById("p_source").innerText =
            "Plese insert a source and name correctly";
        return;
    } else if (name.length < 1) {
        document.getElementById("p_source").innerText =
            "Plese write a name";
        return;
    }

    function getThicks(minimo, maximo, paso) {
        let valores = [];
        for (let i = minimo; i <= maximo; i += paso) {
            valores.push(i);
        }
        return valores;
    }

    // Uso del generador con valores específicos
    const majorTicks = getThicks(min, max, thicks);

    const data = {
        renderTo: renderTo,
        width: 200,
        height: 200,
        strokeTicks: true,
        units,
        title: name,
        minValue: min,
        maxValue: max,
        colorPlate: "#fff",
        borderShadowWidth: 0,
        needleType: "arrow",
        needleCircleOuter: true,
        needleCircleInner: false,
        majorTicks
    };

    if (!document.getElementById(renderTo)) {
        const canvas = document.createElement('canvas');
        canvas.id = renderTo
        // Obtener el contenedor existente por su ID
        const container = document.getElementById('canvas-gauge');
        // Agregar el nuevo div al contenedor existente
        container.appendChild(canvas);
    }

    let newGauge = new RadialGauge(data).draw();

    realtimeObject(`${nameProyect}/data/${source}`, newGauge)

    if (auth.currentUser) {
        const userUid = document.getElementById("user-uid").innerText
        write(`${nameProyect}/users/${userUid}/sesionElements/gauge/${source}`, data)
    }

};
function sesionElemets(uid) {

    realtimeGet(`${nameProyect}/users/${uid}/sesionElements/lamp`).then((valor) => {

        const elements = Object.keys(valor);

        for (var i = 0; i < elements.length; i++) {

            const referencia = elements[i];
            const nombre = valor[referencia]['nombre'];
            const operation = valor[referencia]['operation'];
            const renderTo = `${referencia}_l`
            const color = valor[referencia]['color'];
            const target = valor[referencia]['target']

            if (!document.getElementById(renderTo)) {
                const div = document.createElement('div');
                div.id = renderTo
                div.className = "border border-[2px] border-gray-400 opacity-50 w-[150px] h-[150px] bg-gray-50 rounded-full items-end justify-center relative flex"
                const details = document.createElement('details');
                details.innerHTML = `<summary class="opacity-60 text-gray-500 text-xs"> ${nombre} </summary>
                    <p class="text-gray-500 text-xs" >Indicador enciende If: ${referencia}${operation}${target} </p >`

                details.className = "text-black bg-gray-100 text-sm"
                // Obtener el contenedor existente por su ID
                const container = document.getElementById('canvas-lamp');
                // Agregar el nuevo div al contenedor existente
                container.appendChild(div);
                div.appendChild(details);
            }
            let data = document.getElementById(referencia);

            let lamp = document.getElementById(renderTo)

            const observerOptions = {
                childList: true, subtree: true
            };

            // Crear un observador de mutaciones
            let observador = new MutationObserver(function (mutaciones) {
                mutaciones.forEach(function (mutacion) {

                    let conditionMet = false;
                    switch (operation) {
                        case '==':
                            conditionMet = data.innerText == target;
                            break;
                        case '>':
                            conditionMet = data.innerText > target;
                            break;
                        case '<':
                            conditionMet = data.innerText < target;
                            break;
                        case '!=':
                            conditionMet = data.innerText != target;
                            break;
                        default:
                            console.log('Operación no soportada.');
                            return null;
                    }
                    console.log(conditionMet);

                    if (conditionMet) {
                        lamp.style.backgroundColor = color;
                        lamp.style.opacity = 100;
                        // console.log('Se cumplio la condición lampara');
                    } else {
                        lamp.style.opacity = 50;
                        lamp.style.backgroundColor = '#e5e7eb';

                    }


                });
            });

            // Observador para escuchar cambios en el contenido del elemento data
            observador.observe(data, observerOptions);
        }
    }).catch((error) => {
        console.error(error);
    });

    realtimeGet(`${nameProyect}/users/${uid}/sesionElements/indicator`).then((valor) => {

        const elements = Object.keys(valor);

        for (var i = 0; i < elements.length; i++) {
            const referencia = elements[i]
            const renderTo = `${referencia}_i`
            const unidades = valor[referencia]['unidades']
            const tipoDatos = valor[referencia]['tipoDatos']

            if (!document.getElementById(renderTo)) {
                const div = document.createElement('div');
                div.id = renderTo
                div.className = "border border-[4px] border-red-800 pt-2 bg-white/5 items-center justify-center relative flex flex-col"
                div.innerHTML = `<p class="relative flex pl-2" id="${renderTo}value"> </p><p class="relative flex text-white text-xs bg-red-800"> ${referencia}(${unidades})</p>`
                // Obtener el contenedor existente por su ID
                const container = document.getElementById('canvas-indicator');
                // Agregar el nuevo div al contenedor existente
                container.appendChild(div);
            }

            let data = document.getElementById(referencia);

            let indicator = document.getElementById(`${renderTo}value`)

            const observerOptions = {
                childList: true, subtree: true
            };

            // Crear un observador de mutaciones
            let observador = new MutationObserver(function (mutaciones) {
                mutaciones.forEach(function (mutacion) {
                    indicator.innerText = data.innerText;
                });
            });

            // Observador para escuchar cambios en el contenido del elemento data
            observador.observe(data, observerOptions);

        }

    }).catch((error) => {
        console.error(error); 0
    });

    realtimeGet(`${nameProyect}/users/${uid}/sesionElements/gauge`).then((valor) => {

        const container = document.getElementById('canvas-gauge');
        const elements = Object.keys(valor);

        for (var i = 0; i < elements.length; i++) {

            let element = elements[i]
            const canvas = document.createElement('canvas');
            canvas.id = `${element}_g`

            // Agregar el nuevo div al contenedor existente
            container.appendChild(canvas);

            let data = valor[element]

            let newGauge = new RadialGauge(data).draw();
            function updateObject(changedValue) {
                try {
                    newGauge.value = changedValue;
                } catch (error) {
                    console.error(`failed updateObject('${newGauge.title}')`, error);
                }

            }
            realtimeVal(`${nameProyect}/data/${element}`, updateObject)
        }
        return null;

    }).catch((error) => {
        console.error(error);
    });
}

function createChart() {

    var humedadSuelo = [];  // este es tu array de datos
    var humedadAire = [];  // este es tu array de datos
    var temperatura = [];  // este es tu array de datos

    var xaxisData = {
        categories: [],
        type: 'datetime',
    };

    var options = {
        chart: {
            id: 'humedad',
            group: 'riegoIot',
            type: 'line',
            height: 175
        },
        colors: ["#FF1654", "#000000"],
        series: [
            {
                name: "HumSuelo",
                data: humedadSuelo
            },
            {
                name: "HumAire",
                data: humedadAire
            },
        ],
        dataLabels: {
            enabled: true,
        },
        stroke: {
            width: [4, 4]
        },
        plotOptions: {
            bar: {
                columnWidth: "20%"
            }
        },
        xaxis: xaxisData,
        yaxis: [
            {
                axisBorder: {
                    show: true,
                    color: "#FF1654"
                },
                labels: {
                    style: {
                        colors: "#FF1654"
                    }
                },
                title: {
                    text: "Humedad Suelo",
                    style: {
                        color: "#FF1654"
                    }
                }
            },
            {
                opposite: true,
                axisTicks: {
                    show: true
                },
                axisBorder: {
                    show: true,
                    color: "#000000"
                },
                labels: {
                    style: {
                        colors: "#000000"
                    }
                },
                title: {
                    text: "Humedad Aire",
                    style: {
                        color: "#000000"
                    }
                }
            }
        ], legend: {
            show: false
        }

    };

    var chart = new ApexCharts(document.querySelector("#canvas-chart"), options);
    chart.render();

    var options2 = {
        chart: {
            id: 'temperatura',
            group: 'riegoIot',
            type: 'line',
            height: 175
        },
        colors: ["#247BA0"],
        series: [
            {
                name: "TempAire",
                data: temperatura
            }
        ],
        dataLabels: {
            enabled: true,
        },
        stroke: {
            width: [4]
        },
        plotOptions: {
            bar: {
                columnWidth: "20%"
            }
        },
        xaxis: xaxisData,
        yaxis: [
            {
                axisTicks: {
                    show: true
                },
                axisBorder: {
                    show: true,
                    color: "#247BA0"
                },
                labels: {
                    style: {
                        colors: "#247BA0"
                    }
                },
                title: {
                    text: "Temperatura",
                    style: {
                        color: "#247BA0"
                    }
                }
            }
        ]
    };

    var chart2 = new ApexCharts(document.querySelector("#canvas-chart-1"), options2);
    chart2.render();


    var humSuelo = document.getElementById('humSuelo');
    var humAire = document.getElementById('humAire');
    var tempAire = document.getElementById('tempAire');

    humedadSuelo.push(humSuelo.innerText);
    humedadAire.push(humAire.innerText);
    temperatura.push(tempAire.innerText);

    const observerOptions = {
        childList: true, subtree: true
    };

    // Crear un observador de mutaciones
    var observador = new MutationObserver(function (mutaciones) {
        mutaciones.forEach(function (mutacion) {

            humedadSuelo.push(humSuelo.innerText);
            humedadAire.push(humAire.innerText);
            temperatura.push(tempAire.innerText);
            // GTM-5 en milisegundos
            let utc = Date.now()
            let gtm5 = utc - (5 * 60 * 60 * 1000)
            xaxisData.categories.push(gtm5);

            // Actualiza el gráfico con los nuevos datos
            chart.updateSeries([
                {
                    name: "HumSuelo",
                    data: humedadSuelo
                },
                {
                    name: "HumAire",
                    data: humedadAire
                }
            ])
            chart.updateOptions({ xaxis: xaxisData });
            // Actualiza el gráfico con los nuevos datos
            chart2.updateSeries([
                {
                    name: "TempAire",
                    data: temperatura
                }
            ])
            chart2.updateOptions({ xaxis: xaxisData });
        });
    });

    // Observador para escuchar cambios en el contenido del elemento data
    observador.observe(humSuelo, observerOptions);
    observador.observe(humAire, observerOptions);
    observador.observe(tempAire, observerOptions);
}


function getTime() {
    // Fecha y hora actuales en formato: 2023-08-09T17:22:20.248Z
    let current_second = new Date();
    console.log("current_second =", current_second.toISOString());

    // Fecha actual en formato: 2023-08-09
    // let current_date = current_second.toISOString().split('T')[0];
    // console.log("current_date =", current_date);

    // // Fecha y hora actuales en formato: 2023-08-09 17:22:20
    let Start_time = current_second.toISOString().replace('T', ' ').split('.')[0];
    // console.log("Start_time =", Start_time);

    // // fecha y hora actual en milisegundos desde la medianoche del 1 de enero de 1970 (UTC) 
    // let utc = Date.now()
    // // convierte automáticamente a la fecha y hora local
    // let date = new Date(utc)

    // return date;
    return Start_time;
}

let seccionActions = document.getElementById('actions');
let seccionControl = document.getElementById('control');
let homeOptions = document.getElementById('home-options');

document.addEventListener("DOMContentLoaded", (event) => {

    onAuthStateChanged(auth, function (user) {
        if (user) {
            const uid = user.uid;
            saveMessagingDeviceToken(uid);

            seccionActions.style.display = "block";
            seccionControl.style.display = "block";
            homeOptions.style.display = "block";
            sesionElemets(uid)

        } else {

            console.log('User Signed Out');

        }
    });

});
const chartCreateButton = document.getElementById('show-chart');

gaugeCreateButton.addEventListener('click', gaugeCreate, false);
chartCreateButton.addEventListener('click', createChart, false);


