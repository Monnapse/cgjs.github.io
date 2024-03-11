# CGJS - Chart Graphing JavaScript
 Create Charts/Graphs with this JavaScript Library Package

![screenshot](https://github.com/Monnapse/cgjs.github.io/blob/main/preview.png?raw=true)

# Examples
https://monnapse.github.io/cgjs.github.io/chart-types/time-money/

# Installing
Paste this to the header  ``` <script src="https://monnapse.github.io/cgjs.github.io/releases/CGJS.js"></script> ```

# Elements
chart-cgjs - The main chart element

value-cgjs - The point inside chart, put this inside chart-cgjs

# chart-cgjs
Basic Attributes:
- theme
- type
- value1
- value2

# Example Code
```
 <chart-cgjs id="chart" class="chart center-horizontally-relative" theme="gold-accent-dark" type="time-money" value1="price" value2="time", time-split="5">
    <value-cgjs value1="5.35" value2="06:00:00"></value-cgjs>
    <value-cgjs value1="3.41" value2="14:36:00"></value-cgjs>
    <value-cgjs value1="3.01" value2="18:00:00"></value-cgjs>
 </chart-cgjs>
```