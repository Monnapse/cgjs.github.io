/**
 * Make Graphs/Charts
 * Made by Monnapse
*/

// Default Styling for charts
const CGJSChartStyleSheet = new CSSStyleSheet();
CGJSChartStyleSheet.replaceSync(`
chart-cgjs {
    display: block;
    position: relative;
    width: 800px;
    height: 250px;
    border-radius: 10px;
    border-width: 1px;
    border-style: solid;
}
`);
document.adoptedStyleSheets = [CGJSChartStyleSheet]; // Load default style sheet for this element
// Ids
var nextNodeId = 0;

// Enums
class CGJSElementNames {
    static chart = "chart-cgjs";
    static value = "value-cgjs";
}
class CGJSChartTypes {
    static timeMoney = "time-money";
    static indexMoney = "index-money";
}
class CGJSNodeValues {
    static id = "id";
    static firstValue = "value1";
    static actualFirstValue = "actualValue1";
    static secondValue = "value2";
    static actualSecondValue = "actualValue2";
}

class CGJSChart extends HTMLElement {
    /**
     * CGJS Chart is the HTML Element chart
     */

    constructor() {
        super();
        this.initialized = false;
    }
    
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            this.nodes = []

            let type = this.getAttribute("type") || defaultChart;

            if (type == "time-money") {
                this.chartTypeClass = new CGJSTimeMoney(this);
            } else if (type == "index-money") {
                this.chartTypeClass = new CGJSIndexMoney(this);
            } else {
                // No type specified or type misspelled
                this.chartTypeClass = new CGJSChartType(this);
                return;
            }

            const chart = this.chartTypeClass.buildChartStyle() || this.chartTypeClass.chartCanvas || undefined;
            chart.style.zIndex = "2";

            var isHoveringOverChart = false;
            document.onmousemove = event=>{
                // Find closest node
                if (isHoveringOverChart) {
                    var pos = getMousePosInCanvas(chart, event);
                    var nearestNodeId = this.chartTypeClass.searchNearestNode(pos.x, pos.y);
                    //console.log(nearestNodeId, this.nodes, this.getNodeById(nearestNodeId));
                    if (nearestNodeId != undefined && this.getNodeById(nearestNodeId)) {
                        //console.log(nearestNodeId);
                        var valueArray = [this.getAttribute(CGJSNodeValues.firstValue), this.getAttribute(CGJSNodeValues.secondValue)];
                        this.chartTypeClass.showNodeLabel(valueArray, this.getNodeById(nearestNodeId));
                    }
                }
            };

            if (chart) {
                chart.addEventListener("mouseenter", event=>{
                    isHoveringOverChart = true;
                    //var valueArray = [this.getAttribute(CGJSNodeValues.firstValue), this.getAttribute(CGJSNodeValues.secondValue)];
                    //this.chartTypeClass.showNodeLabel(50, 50, valueArray);
                })
                chart.addEventListener("mouseleave", event=>{
                    isHoveringOverChart = false;
                    this.chartTypeClass.hideNodeLabel();
                })
            }
        }
    }

    disconnectedCallback() {
        this.shadowRoot.innerHTML = "";
    }

    adoptedCallback() {
        //console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
      //console.log(`Attribute ${name} has changed.`);
    }

    updateChart() {
        //const shadowRoot = this.shadowRoot;
        var verticalLowest = this.getLowestNodeValue(CGJSNodeValues.actualFirstValue);
        var verticalHighest = this.getHighestNodeValue(CGJSNodeValues.actualFirstValue);

        var horizontalLowest = this.getLowestNodeValue(CGJSNodeValues.actualSecondValue);
        var horizontalHighest = this.getHighestNodeValue(CGJSNodeValues.actualSecondValue);

        var nodeList = this.sortNodes();

        this.chartTypeClass.clearChart();
        
        var lastX = 0;
        var lastY;//this.getLowestNode(CGJSNodeValues.actualSecondValue)[CGJSNodeValues.actualFirstValue];
        //console.log(lastY);
        nodeList.forEach(node=>{
            var verticalPercentage = getReversedPercentage(node[CGJSNodeValues.actualFirstValue], verticalLowest, verticalHighest)/1.01+0.005;
            var horizontalPercentage = getPercentage(node[CGJSNodeValues.actualSecondValue], horizontalLowest, horizontalHighest);

            console.log(horizontalLowest, horizontalHighest);
            if (lastY == undefined) {
                lastX = horizontalPercentage;
                lastY = getReversedPercentage(node[CGJSNodeValues.actualFirstValue], verticalLowest, verticalHighest);
                //console.log(node[CGJSNodeValues.id]);
                this.chartTypeClass.drawLine(node[CGJSNodeValues.id], lastX, lastY, lastX, lastY, false, true);
            } else {
                //console.log(lastX, lastY, horizontalPercentage);
                this.chartTypeClass.drawLine(node[CGJSNodeValues.id], lastX, lastY, horizontalPercentage, verticalPercentage);

                lastX = horizontalPercentage;
                lastY = verticalPercentage;

                //const circle = document.createElement("div");
                //circle.classList.add("cgjs-chart-value-point-circle");
                //circle.style.left = "";
                //circle.style.top = "";
                //this.shad
            }

            //this.chartTypeClass.drawNodePoint(lastX, lastY);
        })

        this.chartTypeClass.setVerticalValues(this.getOneValueType(CGJSNodeValues.firstValue));
        this.chartTypeClass.setHorizontalValues(this.getOneValueType(CGJSNodeValues.secondValue));
    }

    sortNodes() {
        this.nodes.sort((a, b)=>{
            return a[CGJSNodeValues.actualSecondValue] - b[CGJSNodeValues.actualSecondValue];
        })
        return this.nodes;
    }

    newNode(value1, value2, nodeId) {
        /**
         * Adds a new value point
         * @param {string} value1 The first value, Vertical Value.
         * @param {string} value2 The first value, Horizontal Value.
         * @param {number} id The Id of the node
         */

        //console.log("Adding Node", value1, value2, nodeId);

        if (this.chartTypeClass) {
            const node = new CGJSNode(nodeId, value1, this.chartTypeClass.firstValueToValidNumber(value1), value2, this.chartTypeClass.secondValueToValidNumber(value2));
            this.nodes.push(node);
            this.updateChart();
        }
    }

    updateNode(value1, value2, nodeId) {
        /**
         * Adds a new value point
         * @param {string} value1 The first value, Vertical Value.
         * @param {string} value2 The first value, Horizontal Value.
         * @param {number} id The Id of the node
         */

        //console.log("Updating Node", value1, value2, nodeId);

        var updated = false;
        this.nodes.forEach(node=>{
            if (node[CGJSNodeValues.id] == nodeId) {
                this.nodes.splice(this.nodes.indexOf(node), 1);
                updated = true;
            }
        })
        if (updated) {
            this.newNode(value1, value2, nodeId)
        }
    }

    // Regular Functions
    getOneValueType(valueName) {
        /**
         * getHighestNode.
         * @param {[CGJSNode]} nodeArray Array of CGJSNode nodes.
         * @param {String} valueName The name of the value.
         * @returns {Array}
         */

        var valueArray = []
        this.nodes.forEach(node => {
            var value = node[valueName];
            valueArray.push(value);
        });
        return valueArray;
    }
    getHighestNodeValue(valueName) {
        /**
         * getHighestNode.
         * @param {[CGJSNode]} nodeArray Array of CGJSNode nodes.
         * @param {String} valueName The name of the value.
         * @returns {Number}
         */

        var highest;
        this.nodes.forEach(node => {
            var value = node[valueName];
            if (highest == undefined) {highest = value;}
            if (parseFloat(value) > parseFloat(highest)) {
                highest = value;
            } else {
                console.log("Passes on", value);
            }
        });
    
        return highest;
    }
    getHighestNode(valueName) {
        /**
         * getHighestNode.
         * @param {[CGJSNode]} nodeArray Array of CGJSNode nodes.
         * @param {String} valueName The name of the value.
         * @returns {CGJSNode}
         */

        var highestValue;
        var highestNode;
        this.nodes.forEach(node => {
            var value = node[valueName];
            if (highestValue == undefined) {highestValue = value;}
            if (value > highestValue) {
                highestValue = value;
                highestNode = node;
            }
        });
    
        return highestNode;
    }
    getLowestNodeValue(valueName) {
        /**
         * getHighestNode.
         * @param {[CGJSNode]} nodeArray Array of CGJSNode nodes.
         * @param {String} valueName The name of the value.
         * @returns {Number}
         */
    
        var lowest;
        this.nodes.forEach(node => {
            var value = node[valueName];
            if (lowest == undefined) {lowest = value;}
            if (value < lowest) {
                lowest = value;
            }
        });
    
        return lowest;
    }
    getLowestNode(valueName) {
        /**
         * getHighestNode.
         * @param {[CGJSNode]} nodeArray Array of CGJSNode nodes.
         * @param {String} valueName The name of the value.
         * @returns {Number}
         */
    
        var lowestValue;
        var lowestNode;
        this.nodes.forEach(node => {
            var value = node[valueName];
            if (lowestValue == undefined) {lowestValue = value;}
            if (value < lowestValue) {
                lowestValue = value;
                lowestNode = node;
            }
        });
    
        return lowestNode;
    }
    getNodeById(nodeId) {
        /**
         * @param {number} nodeId
         * @returns {CGJSNode}
         */

        var node;
        this.nodes.forEach(n=>{
            if (n[CGJSNodeValues.id] == nodeId) {node = n;}
        })
        return node;
    }
}

class CGJSValue extends HTMLElement {
    /**
     * CGJS Value is the HTML Element that makes the node point.
     */

    static observedAttributes = [CGJSNodeValues.firstValue, CGJSNodeValues.secondValue];

    constructor() {
        super(); 
        this.initialized = false;
    }
    
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            this.nodeId = nextNodeId++;

            var parent = this.parentElement;
            if (parent.tagName.toLowerCase() == CGJSElementNames.chart) {
                //let type = parent.getAttribute("type") || defaultChart;
                let value1 = this.getAttribute(CGJSNodeValues.firstValue);
                let value2 = this.getAttribute(CGJSNodeValues.secondValue);
                //console.log(this.nodeId);
                parent.newNode(value1, value2, this.nodeId);
            }
        }
    }

    disconnectedCallback() {
        //console.log("Destroying");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(`Attribute ${name} has changed.`);
    }

    adoptedCallback() {
        //console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.nodeId != undefined) {
            var parent = this.parentElement;
            
            if (parent.tagName.toLowerCase() == CGJSElementNames.chart) {
                let value1 = this.getAttribute(CGJSNodeValues.firstValue);
                let value2 = this.getAttribute(CGJSNodeValues.secondValue);
                parent.updateNode(value1, value2, this.nodeId);
            }
        }
    }

    onAttributeChange(value) {
        // Callback function to handle attribute changes
        //console.log('Attribute value:', value);
    }
}

class CGJSNode {
    /**
     * CGJS Node is the base node for making the point.
     * @param {Number} nodeId 
     * @param {String} value1 
     * @param {String} value2 
     */

    constructor(nodeId, value1, actualValue1, value2, actualValue2) {
        this.id = nodeId;
        this.value1 = value1;
        this.actualValue1 = actualValue1;
        this.value2 = value2;
        this.actualValue2 = actualValue2;
    }
}

// Chart Class Types
class CGJSChartType {
    /**
     * CGJS Chart Type, this is different chart types
     * @param {CGJSChart} t The Chart class.
     */

    constructor(t) {
        //console.log(t);
        this.chartClass = t;
        this.nodePointArray = [];
    }

    buildChartStyle() {
        return; // MUST RETURN CHART
    }

    setVerticalValues(values) {
        return;
    }

    setHorizontalValues(values) {
        return;
    }

    searchNearestNode(x, y) {
        return;
    }

    clearChart() {
        return;
    }

    showNodeLabel(values, node) {
        return;
    }

    hideNodeLabel() {
        return;
    }

    drawLine(nodeId, x, y, x2, y2) {
        return;
    }

    drawNodePoint(x,y) {
        return;
    }
    
    formatFirstValueToReadable(value) {
        return value;
    }
    formatSecondValueToReadable(value) {
        return value;
    }

    firstValueToValidNumber(value) {
        return value;
    }
    secondValueToValidNumber(value) {
        return value;
    }
}

class CGJSTimeMoney extends CGJSChartType {
    /**
     * The Time And Money Chart, mostly made to display stock chart.
     */

    buildChartStyle() {
        //console.log(this.chartClass);

        // Create a shadow root
        const shadowRoot = this.chartClass.shadowRoot || this.chartClass.attachShadow({ mode: "open" }); 

        this.chartClass.shadowRoot.innerHTML = `
        <style>
            .chart-cgjs-side {
                display: flex;
                width: 75px;
                height: calc(100% - 70px);
                position: absolute;
                top: 50%;
                -moz-transform: translateY(-50%); /* Firefox */
                -ms-transform: translateY(-50%);  /* IE 9 */
                -webkit-transform: translateY(-50%); /* Safari and Chrome*/
                -o-transform: translateY(-50%); /* Opera */
                transform: translateY(-50%);
                flex-direction: column;
                justify-items: center;
            }
            .chart-cgjs-side span {
                position: absolute;
                text-indent: 15px;
                font-weight: 100;
                font-size: 0.75em;
            }
            .chart-cgjs-side span:first-child {
                display: flex;
                align-items: flex-start;
            }
            .chart-cgjs-side span:last-child {
                display: flex;
                align-items: flex-end;
            }
            .chart-cgjs-bottom {
                display: flex;
                width: calc(100% - 150px);
                height: 35px;
                position: absolute;
                left: 50%;
                bottom: 0px;
                -moz-transform: translateX(-50%); /* Firefox */
                -ms-transform: translateX(-50%);  /* IE 9 */
                -webkit-transform: translateX(-50%); /* Safari and Chrome*/
                -o-transform: translateX(-50%); /* Opera */
                transform: translateX(-50%);
                flex-direction: row;
                justify-content: space-between;
                justify-items: center;
            }
            .chart-cgjs-bottom span {
                display: flex;
                flex: 1;
                font-weight: 100;
                font-size: 0.75em;
                justify-content: center;
                align-items: center;
            }
            .chart-cgjs-bottom span:first-child {
                display: flex;
                justify-content: flex-start;
            }
            .chart-cgjs-bottom span:last-child {
                display: flex;
                justify-content: flex-end;
            }
            .chart-cgjs-chart {
                display: block;
                width: calc(100% - 150px);
                height: calc(100% - 70px);
                position: absolute;
                left: 50%;
                top: 50%;
                -moz-transform: translate(-50%, -50%); /* Firefox */
                -ms-transform: translate(-50%, -50%);  /* IE 9 */
                -webkit-transform: translate(-50%, -50%); /* Safari and Chrome*/
                -o-transform: translate(-50%, -50%); /* Opera */
                transform: translate(-50%, -50%);
            }
            .chart-cgjs-chart-points {
                display: block;
                width: calc(100% - 135px);
                height: calc(100% - 55px);
                position: absolute;
                left: 50%;
                top: 50%;
                -moz-transform: translate(-50%, -50%); /* Firefox */
                -ms-transform: translate(-50%, -50%);  /* IE 9 */
                -webkit-transform: translate(-50%, -50%); /* Safari and Chrome*/
                -o-transform: translate(-50%, -50%); /* Opera */
                transform: translate(-50%, -50%);
            }
            .cgjs-chart-label {
                position: absolute;
                display: block;
                width: 150px;
                height: fit-content;
                z-index: 3;
                border-radius: 10px;
                backdrop-filter: blur(2px);
                padding: 5px 22px;
            }
            .cgjs-chart-label-value {
                display: flex;
                justify-content: space-between;
            }
            .cgjs-chart-label-value span {
                display: flex;
                font-size: 0.6em;
                height: 15px;
                align-items: center;
            }
            .cgjs-chart-label-value span:first-child {
                font-weight: 200;
            }
            .cgjs-chart-label-value span:last-child {
                font-weight: 400;
            }
            .cgjs-chart-value-point-circle {
                border-radius: 100px;
                display: block;
                width: 10px;
                height: 10px;
            }
        </style>
        `; // Load default style sheet for this element

        let theme = this.chartClass.getAttribute("theme");
        //let value1 = this.chartClass.getAttribute("value1");
        //let value2 = this.chartClass.getAttribute("value2");
        //console.log(type, value1, value2);
        //ctx.fillStyle = CGJSThemes[theme].inner;

        // Theme
        const styleSheetOutside = document.createElement("link");
        styleSheetOutside.rel = "stylesheet";
        styleSheetOutside.type = "text/css";
        styleSheetOutside.href = "https://monnapse.github.io/cgjs.github.io/releases/ChartThemes/"+theme+"-outside.css";

        const styleSheetInside = document.createElement("link");
        styleSheetInside.rel = "stylesheet";
        styleSheetInside.type = "text/css";
        styleSheetInside.href = "https://monnapse.github.io/cgjs.github.io/releases/ChartThemes/"+theme+"-inside.css";

        document.head.appendChild(styleSheetOutside);
        shadowRoot.appendChild(styleSheetInside);

        // Chart Layout
        this.side = document.createElement("div");
        this.side.classList.add("chart-cgjs-side");

        this.bottom = document.createElement("div");
        this.bottom.classList.add("chart-cgjs-bottom");

        this.chartCanvas = document.createElement("canvas");
        this.chartCanvas.classList.add("chart-cgjs-chart");
        this.chartCanvas.width = this.chartCanvas.clientWidth;
        this.chartCanvas.height = this.chartCanvas.clientHeight;

        this.chartCanvasDashed = document.createElement("canvas");
        this.chartCanvasDashed.classList.add("chart-cgjs-chart");
        this.chartCanvasDashed.width = this.chartCanvasDashed.clientWidth;
        this.chartCanvasDashed.height = this.chartCanvasDashed.clientHeight;

        this.chartCanvasPoints = document.createElement("canvas");
        //this.chartCanvasPoints.classList.add("chart-cgjs-chart");
        this.chartCanvasPoints.classList.add("chart-cgjs-chart-points");
        this.chartCanvasPoints.width = this.chartCanvasPoints.clientWidth;
        this.chartCanvasPoints.height = this.chartCanvasPoints.clientHeight;

        shadowRoot.appendChild(this.side);
        shadowRoot.appendChild(this.bottom);
        shadowRoot.appendChild(this.chartCanvas);
        shadowRoot.appendChild(this.chartCanvasDashed);
        shadowRoot.appendChild(this.chartCanvasPoints);

        //this.drawLine(0,0,50,50);

        return this.chartCanvas;
    }

    setVerticalValues(values) {
        // Clear the side
        this.side.innerHTML = "";

        const lowestValue = this.chartClass.getLowestNodeValue(CGJSNodeValues.actualFirstValue);
        const highestValue = this.chartClass.getHighestNodeValue(CGJSNodeValues.actualFirstValue);

        const lowestCost = document.createElement("span");
        lowestCost.textContent = "$"+lowestValue;
        lowestCost.classList.add("cgjs-vertical-value");
        lowestCost.style.bottom = "0";

        const highestCost = document.createElement("span");
        highestCost.textContent = "$"+highestValue;
        highestCost.classList.add("cgjs-vertical-value");
        highestCost.style.top = "0";

        var average = 0;
        values.forEach(value=>{
            average += parseFloat(value);
        })
        average = average/values.length;
        const averageCost = document.createElement("span");
        averageCost.textContent = "$"+average.toFixed(2);
        averageCost.classList.add("cgjs-vertical-value");
        //console.log(average, lowestValue, highestValue);
        averageCost.style.bottom = getPercentage(average, lowestValue, highestValue)*100+"%";

        const reversedAveragePercent = getReversedPercentage(average, lowestValue, highestValue)-0.03;
        this.chartClass.chartTypeClass.drawLine(undefined, 0, reversedAveragePercent, 1, reversedAveragePercent, true);

        this.side.appendChild(highestCost);
        this.side.appendChild(averageCost);
        this.side.appendChild(lowestCost);
    }

    setHorizontalValues(values) {
        // Clear the bottom
        this.bottom.innerHTML = "";

        var lowestTime = this.chartClass.getLowestNodeValue(CGJSNodeValues.actualSecondValue);
        var highestTime = this.chartClass.getHighestNodeValue(CGJSNodeValues.actualSecondValue);

        const lowestTimeElement = document.createElement("span");
        lowestTimeElement.textContent = this.formatTime(lowestTime);
        lowestTimeElement.classList.add("cgjs-horizontal-value");
        this.bottom.appendChild(lowestTimeElement);

        var timeSplit = parseInt(this.chartClass.getAttribute("time-split"));
        var timeNormal = (highestTime-lowestTime) / (timeSplit+1);
        var lastValue = lowestTime;
        //console.log(timeNormal);
        for(var i=1;i <= timeSplit;i++) {
            const timeElement = document.createElement("span");
            lastValue = lastValue + 1*timeNormal;
            timeElement.textContent = this.formatTime(lastValue);//this.formatTime(timeNormal*i);
            
            timeElement.classList.add("cgjs-horizontal-value");
            this.bottom.appendChild(timeElement);
        }

        const highestTimeElement = document.createElement("span");
        highestTimeElement.textContent = this.formatTime(highestTime);
        highestTimeElement.classList.add("cgjs-horizontal-value");
        this.bottom.appendChild(highestTimeElement);
    }

    formatFirstValueToReadable(value) {
        return "$"+value.toFixed(2);
    }
    formatSecondValueToReadable(value) {
        return this.formatTime(value);
    }

    firstValueToValidNumber(value) {
        return parseFloat(value);
    }

    secondValueToValidNumber(value) {
        return this.convertTimeToNumber(value);
    }

    clearChart() {
        this.chartCanvas.getContext("2d").clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
        this.chartCanvasDashed.getContext("2d").clearRect(0, 0, this.chartCanvasDashed.width, this.chartCanvasDashed.height);
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height);
        this.nodePointArray = []
    }

    drawLine(nodeId, x, y, x2, y2, dashed, isFirst) {
        //console.log(nodeId, x,y, x2, y2);
        // Fix values
        if (x == undefined || y == undefined || x2 == undefined || y2 == undefined) {return;}

        // Fix Canvas size
        if (!this.chartCanvas.width) {
            this.chartCanvas.width = this.chartCanvas.clientWidth;
            this.chartCanvasDashed.width = this.chartCanvas.clientWidth;
        }
        if (!this.chartCanvas.height) {
            this.chartCanvas.height = this.chartCanvas.clientHeight;
            this.chartCanvasDashed.height = this.chartCanvas.clientHeight;
        }

        var width = this.chartCanvas.width;
        var height = this.chartCanvas.height;

        if (width == undefined || height == undefined) {return;}

        //console.log("Line", x2, y2);

        // Draw line
        var ctx;

        if (dashed) {
            ctx = this.chartCanvasDashed.getContext("2d");
            ctx.setLineDash([5, 2]);
            ctx.lineWidth = 0.9;
        } else {
            ctx = this.chartCanvas.getContext("2d");
            ctx.lineWidth = 0.7;

            // Save point
            ctx = this.chartCanvas.getContext("2d");
            ctx.lineWidth = 0.7;
            //console.log(nodeId, isFirst, x,y);
            if (nodeId != undefined || !isFirst) {
                this.nodePointArray.push({
                    id: nodeId,
                    x: x2*width,
                    y: y2*height,
                })
            } else if (nodeId != undefined || isFirst) {
                this.nodePointArray.push({
                    id: nodeId,
                    x: x*width,
                    y: y*height,
                })
                return;
            }
        }

        if (isFirst) {return;}

        ctx.beginPath();
        ctx.moveTo(x*width, y*height);
        ctx.lineTo(x2*width, y2*height);
        //0 182.40875912408757 976 182.40875912408757 true
        //console.log(x*width, y*height, x2*width, y2*height, dashed);
        ctx.strokeStyle = "black";
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let theme = this.chartClass.getAttribute("theme");
        if (dashed) {
            ctx.strokeStyle = CGJSThemes[theme].dashedLineColor;
        } else {
            ctx.strokeStyle = CGJSThemes[theme].lineColor;
        }
        
        ctx.stroke();

        //console.log(dashed);
    }

    drawNodePoint(x, y) {
        // Fix Canvas size
        if (!this.chartCanvasPoints.width) {
            this.chartCanvasPoints.width = this.chartCanvasPoints.clientWidth;
        }
        if (!this.chartCanvasPoints.height) {
            this.chartCanvasPoints.height = this.chartCanvasPoints.clientHeight;
        }

        var ctx = this.chartCanvasPoints.getContext("2d");
        ctx.beginPath();

        var width = this.chartCanvasPoints.width;
        var height = this.chartCanvasPoints.height;

        //console.log(x,y);
        var offset = 7;
        ctx.arc(x+offset, y+offset, 4, 0, 2 * Math.PI);

        let theme = this.chartClass.getAttribute("theme");
        ctx.fillStyle = CGJSThemes[theme].lineColor;

        ctx.fill()
    }

    searchNearestNode(x1, y1) {
        //console.log(x, y);
        //console.log(this.nodePointArray);
        var closestMagnitude;
        var closestNodeId;
        this.nodePointArray.forEach(point=>{
            var x2 = point.x;
            var y2 = point.y;
            var magnitude = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            //console.log(point);
            if (!closestMagnitude) {closestMagnitude = magnitude; closestNodeId = point.id}
            //if (point.id) {console.log(point.id, magnitude, closestMagnitude)}
            if (magnitude < closestMagnitude) {
                closestMagnitude = magnitude;
                closestNodeId = point.id;
            }
        })
        //console.log("Closest:", closestNodeId);
        return closestNodeId;
    }

    showNodeLabel(values, node) {
        //console.log(values, node)
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height); // Clear all other points
        if (!this.label) {
            this.label = document.createElement("div");
            this.label.classList.add("cgjs-chart-label");
            this.chartClass.shadowRoot.appendChild(this.label);        
            //this.labelValueElements = {};
        } else {
            this.label.innerHTML = "";
        }

        values.forEach((valueName)=>{
            const valueDiv = document.createElement("div");
            valueDiv.classList.add("cgjs-chart-label-value");

            const valueNameElement = document.createElement("span");
            valueNameElement.textContent = valueName;

            const valueElement = document.createElement("span");

            if (this.chartClass.getAttribute(CGJSNodeValues.firstValue) == valueName) {
                valueElement.textContent = this.formatFirstValueToReadable(parseFloat(node[CGJSNodeValues.actualFirstValue]));
            }
            if (this.chartClass.getAttribute(CGJSNodeValues.secondValue) == valueName) {
                valueElement.textContent = this.formatSecondValueToReadable(parseInt(node[CGJSNodeValues.actualSecondValue]));
            }

            valueDiv.appendChild(valueNameElement);
            valueDiv.appendChild(valueElement);
            this.label.appendChild(valueDiv);

            //this.labelValueElements[valueName] = valueElement;
        })

        var nodePoint = this.getNodePointById(node.id);
        //console.log(nodePoint);
        var offsetLeft = this.label.clientWidth/1.6;
        var offsetTop = this.label.clientHeight/4;
        var totalLeft = nodePoint.x-offsetLeft;
        var totalTop = nodePoint.y-offsetTop;

        if (totalLeft < this.label.clientWidth) {
            //console.log("Too left");
            totalLeft = nodePoint.x+offsetLeft/1.6;
        }
        if (totalTop < this.label.clientHeight) {
            //console.log("Too left");
            totalTop = nodePoint.y+offsetTop*4;
        }

        this.label.style.left = totalLeft+"px";
        this.label.style.top = totalTop+"px";
        this.label.style.visibility = "visible";

        this.drawNodePoint(nodePoint.x, nodePoint.y);
    }

    hideNodeLabel() {
        //console.log(this.label);
        if (this.label) {this.label.style.visibility = "hidden";}
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height); // Clear all points
    }

    // FUNCTIONS
    convertTimeToNumber(time) {
        const [hours, minutes] = time.split(':');
        const hoursNumber = parseInt(hours, 10);
        const minutesNumber = parseInt(minutes, 10);
        const timeInNumber = (hoursNumber * 100) + minutesNumber;
        return timeInNumber;
    }
    formatTime(number) {
        const hours = Math.floor(number / 100);
        const minutes = number % 100;
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
        return formattedTime;
    }
    getNodePointById(nodeId) {
        var node;
        this.nodePointArray.forEach(nodePoint=>{
            if (nodePoint.id == nodeId) {node = nodePoint;}
        })
        return node;
    }
}

class CGJSIndexMoney extends CGJSChartType {
    /**
     * The Time And Money Chart, mostly made to display stock chart.
     */

    buildChartStyle() {
        //console.log(this.chartClass);

        // Create a shadow root
        const shadowRoot = this.chartClass.shadowRoot || this.chartClass.attachShadow({ mode: "open" }); 

        this.chartClass.shadowRoot.innerHTML = `
        <style>
            .chart-cgjs-side {
                display: flex;
                width: 75px;
                height: calc(100% - 70px);
                position: absolute;
                top: 50%;
                -moz-transform: translateY(-50%); /* Firefox */
                -ms-transform: translateY(-50%);  /* IE 9 */
                -webkit-transform: translateY(-50%); /* Safari and Chrome*/
                -o-transform: translateY(-50%); /* Opera */
                transform: translateY(-50%);
                flex-direction: column;
                justify-items: center;
            }
            .chart-cgjs-side span {
                position: absolute;
                text-indent: 15px;
                font-weight: 100;
                font-size: 0.75em;
            }
            .chart-cgjs-side span:first-child {
                display: flex;
                align-items: flex-start;
            }
            .chart-cgjs-side span:last-child {
                display: flex;
                align-items: flex-end;
            }
            .chart-cgjs-bottom {
                display: flex;
                width: calc(100% - 150px);
                height: 35px;
                position: absolute;
                left: 50%;
                bottom: 0px;
                -moz-transform: translateX(-50%); /* Firefox */
                -ms-transform: translateX(-50%);  /* IE 9 */
                -webkit-transform: translateX(-50%); /* Safari and Chrome*/
                -o-transform: translateX(-50%); /* Opera */
                transform: translateX(-50%);
                flex-direction: row;
                justify-content: space-between;
                justify-items: center;
            }
            .chart-cgjs-bottom span {
                display: flex;
                flex: 1;
                font-weight: 100;
                font-size: 0.75em;
                justify-content: center;
                align-items: center;
            }
            .chart-cgjs-bottom span:first-child {
                display: flex;
                justify-content: flex-start;
            }
            .chart-cgjs-bottom span:last-child {
                display: flex;
                justify-content: flex-end;
            }
            .chart-cgjs-chart {
                display: block;
                width: calc(100% - 150px);
                height: calc(100% - 70px);
                position: absolute;
                left: 50%;
                top: 50%;
                -moz-transform: translate(-50%, -50%); /* Firefox */
                -ms-transform: translate(-50%, -50%);  /* IE 9 */
                -webkit-transform: translate(-50%, -50%); /* Safari and Chrome*/
                -o-transform: translate(-50%, -50%); /* Opera */
                transform: translate(-50%, -50%);
            }
            .chart-cgjs-chart-points {
                display: block;
                width: calc(100% - 135px);
                height: calc(100% - 55px);
                position: absolute;
                left: 50%;
                top: 50%;
                -moz-transform: translate(-50%, -50%); /* Firefox */
                -ms-transform: translate(-50%, -50%);  /* IE 9 */
                -webkit-transform: translate(-50%, -50%); /* Safari and Chrome*/
                -o-transform: translate(-50%, -50%); /* Opera */
                transform: translate(-50%, -50%);
            }
            .cgjs-chart-label {
                position: absolute;
                display: block;
                width: 150px;
                height: fit-content;
                z-index: 3;
                border-radius: 10px;
                backdrop-filter: blur(2px);
                padding: 5px 22px;
            }
            .cgjs-chart-label-value {
                display: flex;
                justify-content: space-between;
            }
            .cgjs-chart-label-value span {
                display: flex;
                font-size: 0.6em;
                height: 15px;
                align-items: center;
            }
            .cgjs-chart-label-value span:first-child {
                font-weight: 200;
            }
            .cgjs-chart-label-value span:last-child {
                font-weight: 400;
            }
            .cgjs-chart-value-point-circle {
                border-radius: 100px;
                display: block;
                width: 10px;
                height: 10px;
            }
        </style>
        `; // Load default style sheet for this element

        let theme = this.chartClass.getAttribute("theme");
        //let value1 = this.chartClass.getAttribute("value1");
        //let value2 = this.chartClass.getAttribute("value2");
        //console.log(type, value1, value2);
        //ctx.fillStyle = CGJSThemes[theme].inner;

        // Theme
        const styleSheetOutside = document.createElement("link");
        styleSheetOutside.rel = "stylesheet";
        styleSheetOutside.type = "text/css";
        styleSheetOutside.href = "https://monnapse.github.io/cgjs.github.io/releases/ChartThemes/"+theme+"-outside.css";

        const styleSheetInside = document.createElement("link");
        styleSheetInside.rel = "stylesheet";
        styleSheetInside.type = "text/css";
        styleSheetInside.href = "https://monnapse.github.io/cgjs.github.io/releases/ChartThemes/"+theme+"-inside.css";

        document.head.appendChild(styleSheetOutside);
        shadowRoot.appendChild(styleSheetInside);

        // Chart Layout
        this.side = document.createElement("div");
        this.side.classList.add("chart-cgjs-side");

        this.bottom = document.createElement("div");
        this.bottom.classList.add("chart-cgjs-bottom");

        this.chartCanvas = document.createElement("canvas");
        this.chartCanvas.classList.add("chart-cgjs-chart");
        this.chartCanvas.width = this.chartCanvas.clientWidth;
        this.chartCanvas.height = this.chartCanvas.clientHeight;

        this.chartCanvasDashed = document.createElement("canvas");
        this.chartCanvasDashed.classList.add("chart-cgjs-chart");
        this.chartCanvasDashed.width = this.chartCanvasDashed.clientWidth;
        this.chartCanvasDashed.height = this.chartCanvasDashed.clientHeight;

        this.chartCanvasPoints = document.createElement("canvas");
        //this.chartCanvasPoints.classList.add("chart-cgjs-chart");
        this.chartCanvasPoints.classList.add("chart-cgjs-chart-points");
        this.chartCanvasPoints.width = this.chartCanvasPoints.clientWidth;
        this.chartCanvasPoints.height = this.chartCanvasPoints.clientHeight;

        shadowRoot.appendChild(this.side);
        shadowRoot.appendChild(this.bottom);
        shadowRoot.appendChild(this.chartCanvas);
        shadowRoot.appendChild(this.chartCanvasDashed);
        shadowRoot.appendChild(this.chartCanvasPoints);

        //this.drawLine(0,0,50,50);

        return this.chartCanvas;
    }

    setVerticalValues(values) {
        // Clear the side
        this.side.innerHTML = "";

        const lowestValue = this.chartClass.getLowestNodeValue(CGJSNodeValues.actualFirstValue);
        const highestValue = this.chartClass.getHighestNodeValue(CGJSNodeValues.actualFirstValue);

        const lowestCost = document.createElement("span");
        lowestCost.textContent = "$"+lowestValue.toFixed(2);
        lowestCost.classList.add("cgjs-vertical-value");
        lowestCost.style.bottom = "0";

        const highestCost = document.createElement("span");
        highestCost.textContent = "$"+highestValue.toFixed(2);
        highestCost.classList.add("cgjs-vertical-value");
        highestCost.style.top = "0";

        var average = 0;
        values.forEach(value=>{
            average += parseFloat(value);
        })
        average = average/values.length;
        const averageCost = document.createElement("span");
        averageCost.textContent = "$"+average.toFixed(2);
        averageCost.classList.add("cgjs-vertical-value");
        //console.log(average, lowestValue, highestValue);
        averageCost.style.bottom = getPercentage(average, lowestValue, highestValue)*100+"%";

        const reversedAveragePercent = getReversedPercentage(average, lowestValue, highestValue)-0.03;
        this.chartClass.chartTypeClass.drawLine(undefined, 0, reversedAveragePercent, 1, reversedAveragePercent, true);

        this.side.appendChild(highestCost);
        this.side.appendChild(averageCost);
        this.side.appendChild(lowestCost);
    }

    setHorizontalValues(values) {
        // Clear the bottom
        this.bottom.innerHTML = "";

        var lowest = this.chartClass.getLowestNodeValue(CGJSNodeValues.actualSecondValue);
        var highest = this.chartClass.getHighestNodeValue(CGJSNodeValues.actualSecondValue);

        const lowestTimeElement = document.createElement("span");
        lowestTimeElement.textContent = lowest;
        lowestTimeElement.classList.add("cgjs-horizontal-value");
        this.bottom.appendChild(lowestTimeElement);

        var indexSplit = parseInt(this.chartClass.getAttribute("index-split"));
        //var timeNormal = (highestTime-lowestTime) / (timeSplit+1);
        //var lastValue = lowestTime;
        //console.log(timeNormal);
        //for(var i=1;i <= timeSplit;i++) {
        //    const timeElement = document.createElement("span");
        //    lastValue = lastValue + 1*timeNormal;
        //    timeElement.textContent = lastValue;
        //    
        //    timeElement.classList.add("cgjs-horizontal-value");
        //    this.bottom.appendChild(timeElement);
        //}

        //console.log(this.splitRange(0, 5, 2));
        //if (highest - lowest > 3) {
        var indexRange = this.splitRange(lowest, highest, indexSplit);
        //console.log(indexRange);
        indexRange.forEach(i=>{
            i=i.toString();
            if (i != lowest || i != highest) {
                const indexElement = document.createElement("span");
                indexElement.textContent = i;
                indexElement.classList.add("cgjs-horizontal-value");
                this.bottom.appendChild(indexElement);
            }
        })
        //}

        const highestTimeElement = document.createElement("span");
        highestTimeElement.textContent = highest;
        highestTimeElement.classList.add("cgjs-horizontal-value");
        this.bottom.appendChild(highestTimeElement);
    }

    formatFirstValueToReadable(value) {
        return "$"+value.toFixed(2);
    }

    firstValueToValidNumber(value) {
        return parseFloat(value);
    }

    clearChart() {
        this.chartCanvas.getContext("2d").clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
        this.chartCanvasDashed.getContext("2d").clearRect(0, 0, this.chartCanvasDashed.width, this.chartCanvasDashed.height);
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height);
        this.nodePointArray = []
    }

    drawLine(nodeId, x, y, x2, y2, dashed, isFirst) {
        //console.log(nodeId, x,y, x2, y2);
        // Fix values
        if (x == undefined || y == undefined || x2 == undefined || y2 == undefined) {return;}

        // Fix Canvas size
        if (!this.chartCanvas.width) {
            this.chartCanvas.width = this.chartCanvas.clientWidth;
            this.chartCanvasDashed.width = this.chartCanvas.clientWidth;
        }
        if (!this.chartCanvas.height) {
            this.chartCanvas.height = this.chartCanvas.clientHeight;
            this.chartCanvasDashed.height = this.chartCanvas.clientHeight;
        }

        var width = this.chartCanvas.width;
        var height = this.chartCanvas.height;

        if (width == undefined || height == undefined) {return;}

        //console.log("Line", x2, y2);

        // Draw line
        var ctx;

        if (dashed) {
            ctx = this.chartCanvasDashed.getContext("2d");
            ctx.setLineDash([5, 2]);
            ctx.lineWidth = 0.9;
        } else {
            ctx = this.chartCanvas.getContext("2d");
            ctx.lineWidth = 0.7;

            // Save point
            ctx = this.chartCanvas.getContext("2d");
            ctx.lineWidth = 0.7;
            //console.log(nodeId, isFirst, x,y);
            if (nodeId != undefined || !isFirst) {
                this.nodePointArray.push({
                    id: nodeId,
                    x: x2*width,
                    y: y2*height,
                })
            } else if (nodeId != undefined || isFirst) {
                this.nodePointArray.push({
                    id: nodeId,
                    x: x*width,
                    y: y*height,
                })
                return;
            }
        }

        if (isFirst) {return;}

        ctx.beginPath();
        ctx.moveTo(x*width, y*height);
        ctx.lineTo(x2*width, y2*height);
        //0 182.40875912408757 976 182.40875912408757 true
        //console.log(x*width, y*height, x2*width, y2*height, dashed);
        ctx.strokeStyle = "black";
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let theme = this.chartClass.getAttribute("theme");
        if (dashed) {
            ctx.strokeStyle = CGJSThemes[theme].dashedLineColor;
        } else {
            ctx.strokeStyle = CGJSThemes[theme].lineColor;
        }
        
        ctx.stroke();

        //console.log(dashed);
    }

    drawNodePoint(x, y) {
        // Fix Canvas size
        if (!this.chartCanvasPoints.width) {
            this.chartCanvasPoints.width = this.chartCanvasPoints.clientWidth;
        }
        if (!this.chartCanvasPoints.height) {
            this.chartCanvasPoints.height = this.chartCanvasPoints.clientHeight;
        }

        var ctx = this.chartCanvasPoints.getContext("2d");
        ctx.beginPath();

        var width = this.chartCanvasPoints.width;
        var height = this.chartCanvasPoints.height;

        //console.log(x,y);
        var offset = 7;
        ctx.arc(x+offset, y+offset, 4, 0, 2 * Math.PI);

        let theme = this.chartClass.getAttribute("theme");
        ctx.fillStyle = CGJSThemes[theme].lineColor;

        ctx.fill()
    }

    searchNearestNode(x1, y1) {
        //console.log(x, y);
        //console.log(this.nodePointArray);
        var closestMagnitude;
        var closestNodeId;
        this.nodePointArray.forEach(point=>{
            var x2 = point.x;
            var y2 = point.y;
            var magnitude = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            //console.log(point);
            if (!closestMagnitude) {closestMagnitude = magnitude; closestNodeId = point.id}
            //if (point.id) {console.log(point.id, magnitude, closestMagnitude)}
            if (magnitude < closestMagnitude) {
                closestMagnitude = magnitude;
                closestNodeId = point.id;
            }
        })
        //console.log("Closest:", closestNodeId);
        return closestNodeId;
    }

    showNodeLabel(values, node) {
        //console.log(values, node)
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height); // Clear all other points
        if (!this.label) {
            this.label = document.createElement("div");
            this.label.classList.add("cgjs-chart-label");
            this.chartClass.shadowRoot.appendChild(this.label);        
            //this.labelValueElements = {};
        } else {
            this.label.innerHTML = "";
        }

        values.forEach((valueName)=>{
            const valueDiv = document.createElement("div");
            valueDiv.classList.add("cgjs-chart-label-value");

            const valueNameElement = document.createElement("span");
            valueNameElement.textContent = valueName;

            const valueElement = document.createElement("span");

            if (this.chartClass.getAttribute(CGJSNodeValues.firstValue) == valueName) {
                valueElement.textContent = this.formatFirstValueToReadable(parseFloat(node[CGJSNodeValues.actualFirstValue]));
            }
            if (this.chartClass.getAttribute(CGJSNodeValues.secondValue) == valueName) {
                valueElement.textContent = this.formatSecondValueToReadable(parseInt(node[CGJSNodeValues.actualSecondValue]));
            }

            valueDiv.appendChild(valueNameElement);
            valueDiv.appendChild(valueElement);
            this.label.appendChild(valueDiv);

            //this.labelValueElements[valueName] = valueElement;
        })

        var nodePoint = this.getNodePointById(node.id);
        //console.log(nodePoint);
        var offsetLeft = this.label.clientWidth/1.6;
        var offsetTop = this.label.clientHeight/4;
        var totalLeft = nodePoint.x-offsetLeft;
        var totalTop = nodePoint.y-offsetTop;

        if (totalLeft < this.label.clientWidth) {
            //console.log("Too left");
            totalLeft = nodePoint.x+offsetLeft/1.6;
        }
        if (totalTop < this.label.clientHeight) {
            //console.log("Too left");
            totalTop = nodePoint.y+offsetTop*4;
        }

        this.label.style.left = totalLeft+"px";
        this.label.style.top = totalTop+"px";
        this.label.style.visibility = "visible";

        this.drawNodePoint(nodePoint.x, nodePoint.y);
    }

    hideNodeLabel() {
        //console.log(this.label);
        if (this.label) {this.label.style.visibility = "hidden";}
        this.chartCanvasPoints.getContext("2d").clearRect(0, 0, this.chartCanvasPoints.width, this.chartCanvasPoints.height); // Clear all points
    }

    // FUNCTIONS
    getNodePointById(nodeId) {
        var node;
        this.nodePointArray.forEach(nodePoint=>{
            if (nodePoint.id == nodeId) {node = nodePoint;}
        })
        return node;
    }
    splitRange(start, end, splitSize) {
        start = parseInt(start);
        end = parseInt(end);
        const result = [];
        for (let i = start; i <= end; i++) {
            if ((i - start) % splitSize === 0) {
                //console.log(i,start)
                if (i!=start && i!=end) {result.push(i);}
            }
        }
        //result.splice(0, 1);
        return result;
    }
}

// Definitions
customElements.define(CGJSElementNames.chart, CGJSChart);
customElements.define(CGJSElementNames.value, CGJSValue);

// Functions
function getPercentage(value, low, high) {
    /**
     * Gets the percentage of value in between low and high
     */
    return (value-low)/(high-low);
}
function getReversedPercentage(value, low, high) {
    /**
     * Gets the percentage of value in between low and high
     */
    return (high-value)/(high-low);
}
function getPointOnLine(startX, startY, endX, endY, percentage) {
    const x = startX + (endX - startX) * percentage;
    const y = startY + (endY - startY) * percentage;
    return { x, y };
}
function getMousePosInCanvas(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

// Themes
class CGJSThemes {
    // GOLD ACCENT DARK
    static "gold-accent-dark" = {
        lineColor: "#BC9548",
        dashedLineColor: "#35373C"
    }
}