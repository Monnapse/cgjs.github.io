/**
 * Infinite Tale.
 * Made by Monnapse
 * Allows user to add a new value to table
 */
document.addEventListener("DOMContentLoaded", event=>{
    //document.getElementsById("chart").customCallback();

    // PRESET NODES just add to the end ?nodes=1.32,10:00:30,5.34,08:03:03,3.6543,17:53:00
    // http://127.0.0.1:3000/ExampleSite/time-money/index.html?nodes=1.32,10:00:30,5.34,08:03:03,3.6543,12:53:05,0.3,03:03:03
    //console.log(document.URL);
    var url = new URL(document.URL);
    var nodes = url.searchParams.get("nodes");
    if (nodes) {
        var nodesList = nodes.split(",");
        nodesList.forEach(node=>{
            var price = nodesList[0];
            var time = nodesList[1];
            nodesList.splice(0,2);
            createNodeInput(price, time);
        })
        var price = nodesList[0];
        var time = nodesList[1];
        nodesList.splice(0,2);
        createNodeInput(price, time);
    } else {
        createNodeInput(5.35, "06:00:00");
        createNodeInput(3.41, "14:36:00");
        createNodeInput(3.01, "18:00:00");
        createNodeInput(1.01, "12:00:00");
        createNodeInput(7.01, "08:00:00");
    }

    document.getElementById("new-value-button").addEventListener("click", event=>{
        createNodeInput();
    })

    document.getElementById("import-nodes").addEventListener("click", event=>{
        const value = document.getElementById("node-input").value;
        var nodesList = value.split(",");
        console.log(value.length);
        if (value.indexOf(",") > 0) {
            nodesList.forEach(node=>{
                var price = nodesList[0];
                var index = nodesList[1];
                nodesList.splice(0,2);
                createNodeInput(price, index);
            })
        }
    })
})

function createNodeInput(value1, value2) {
    /*
        <tr>
            <th><input type="text"></th>
            <th><input type="time"></th>
        </tr>
        */
        var tr = document.createElement("tr");

        var priceTh = document.createElement("th");
        tr.appendChild(priceTh);
        var priceInput = document.createElement("input");
        priceInput.type = "number";
        priceInput.step = "0.01";
        priceInput.min = "0";
        priceTh.appendChild(priceInput);
        if (value1) {
            priceInput.value = value1
        }
        
        var timeTh = document.createElement("th");
        tr.appendChild(timeTh);
        var timeInput = document.createElement("input");
        timeInput.type = "time";
        timeTh.appendChild(timeInput);
        if (value2) {
            timeInput.value = value2;
        }
 
        var chart = document.getElementById("chart")
        var nodeElement = document.createElement("value-cgjs"); // <value-cgjs value1="5.35" value2="6:00"></value-cgjs>
        var parented = false;
        var price = value1 || undefined;
        var time = value2 || undefined;

        if (price && time) {
            nodeElement.setAttribute("value1", price);
            nodeElement.setAttribute("value2", time);
            parented = true;
            chart.appendChild(nodeElement);
        }
 
        priceInput.addEventListener("change", event=>{
         //console.log(event.target.value);
            price = event.target.value;
            if (time) {
                nodeElement.setAttribute("value1", price);

                if (!parented) {
                    parented = true;
                    chart.appendChild(nodeElement);
                }
             }
        })
        timeInput.addEventListener("change", event=>{
         //console.log(event.target.value);
             time = event.target.value;
             if (price) {
                 nodeElement.setAttribute("value2", time);
 
                 if (!parented) {
                     parented = true;
                     chart.appendChild(nodeElement);
                 }
             }
        })
 
        document.getElementById("value-list").insertBefore(tr, document.getElementById("new-value-button"))
}