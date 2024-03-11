# CGJS - Chart Graphing JavaScript
 Create Charts/Graphs with this JavaScript Library Package

![screenshot](https://github.com/Monnapse/cgjs.github.io/blob/main/preview.png?raw=true)

# Examples
https://monnapse.github.io/cgjs.github.io/chart-types/time-money/

https://monnapse.github.io/cgjs.github.io/chart-types/time-money/?nodes=1.32,10:00:30,5.34,08:03:03,3.6543,12:53:05,0.3,03:03:03

http://127.0.0.1:5500/chart-types/index-money/index.html

http://127.0.0.1:5500/chart-types/index-money/index.html?nodes=1.0,1,3.23,2,2.94,3,6.84,4

# Installing
Paste this to the header  ``` <script src="https://monnapse.github.io/cgjs.github.io/releases/CGJS.js"></script> ```

# Elements
chart-cgjs - The main chart element

value-cgjs - The point inside chart, put this inside chart-cgjs

# chart-cgjs
Basic Attributes:
- ```theme``` The theme of chart.
- ```type``` The type of chart.
- ```value1``` The name of the vertical Value.
- ```value2``` The name of the horizontal Value.


# value-cgjs
Basic Attributes:
- ```value1``` The value.
- ```value2``` The value.

# Example Code
```
 <chart-cgjs id="chart" class="chart center-horizontally-relative" theme="gold-accent-dark" type="time-money" value1="price" value2="time", time-split="5">
    <value-cgjs value1="5.35" value2="06:00:00"></value-cgjs>
    <value-cgjs value1="3.41" value2="14:36:00"></value-cgjs>
    <value-cgjs value1="3.01" value2="18:00:00"></value-cgjs>
 </chart-cgjs>
```