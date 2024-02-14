import { realtimeGet, realtimeVal, realtimeElement, write } from './realtime.js';
import { addTable, addRow } from './tables.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const nameProyect = document.getElementById("proyect").innerText


const node = 'actions';

addTable(node)
// console.log(`${node} table was created ${node}:${system[node]}`);
realtimeGet(`${nameProyect}/${node}`).then((valor) => {

    let table = document.getElementById(`table${node}`);
    addRow(valor, table);
    let Elements = Object.keys(valor);


    for (var i = 0; i < Elements.length; i++) {
        let Element = Elements[i];
        // document.getElementById(Element).innerHTML = `<button id="b-${Element}" class="text-black border-black border-[2px] rounded font-medium text-xs py-2 bg-white/5 backdrop-blur-3xl hover:bg-black hover:text-white transition-colors h-full"> </button>`
        // realtimeElement(`${nameProyect}/${node}/${Element}`, `b-${Element}`);
        realtimeElement(`${nameProyect}/${node}/${Element}`, `${Element}`);

        let buttonAction = document.getElementById(`${Element}`);

        buttonAction.addEventListener("click", function () {

            if (buttonAction.innerText == 'true') {

                write(`${nameProyect}/${node}/${Element}`, 'false')

                // buttonAction.className = "btn btn-danger";

            } else {

                write(`${nameProyect}/${node}/${Element}`, 'true')

                // buttonAction.className = "btn btn-success";
            }

        });


        // Crear un observador de mutaciones
        var observador = new MutationObserver(function (mutaciones) {
            mutaciones.forEach(function (mutacion) {
                if (buttonAction.innerText == 'false') {

                    buttonAction.className = "text-white bg-red-700";

                } else {

                    buttonAction.className = "text-white bg-green-700";
                }
            });
        });

        // Configurar el observador para escuchar cambios en el contenido del elemento
        observador.observe(buttonAction, { childList: true, subtree: true });
    }

}).catch((error) => {
    console.error(error);
});


