
let head = ['#', 'NAME', 'DATA']

export function addTable(node, theadContent = head) {
    try {

        // Crea la tabla
        let table = document.createElement("table");

        table.id = `table-${node}`;
        table.className = 'min-w-full table-auto divide-y divide-gray-300  border-emerald-800';
        // table.className = 'table table-bordered'

        // Crea el encabezado de la tabla
        let thead = document.createElement("thead");
        table.appendChild(thead);

        // Llena el encabezado de la tabla
        for (let i = 0; i < theadContent.length; i++) {
            let th = document.createElement("th");
            th.textContent = theadContent[i];
            thead.appendChild(th);
        }

        // Crea el cuerpo de la tabla
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        document.getElementById(`div-${node}`).appendChild(table);
        // document.getElementsByTagName("section")[0].appendChild(table);
        // document.body.appendChild(table);
    } catch (e) {
        console.log('error en table');

        console.error(e);
    }


}

export function addRow(Element, table) {
    try {
        let tbody = table.getElementsByTagName('tbody')[0];

        if (typeof Element === 'object' && Element !== null) {
            // Element es un objeto, realiza una acción

            Object.keys(Element).forEach((clave, index) => {

                // let value = Element[clave];
                // console.log('Clave:', clave, 'Value:', value);

                // Crea una nueva fila y celdas
                var row = document.createElement("tr");
                var colum0 = document.createElement("td");
                var colum1 = document.createElement("td");
                var colum2 = document.createElement("td");

                // Asigna los valores a las celdas
                colum0.textContent = index;
                colum1.textContent = clave;
                colum2.textContent = Element[clave]; //value;


                colum2.id = clave;
                // Agrega las celdas a la fila
                row.appendChild(colum0);
                row.appendChild(colum1);
                row.appendChild(colum2);

                // Agrega la fila al cuerpo de la tabla
                tbody.appendChild(row);
            });
        } else {
            console.log(`addTable method exception. Do not create a table with:${Element}`);


        }
    } catch (e) {
        console.error(e);
    }
}


