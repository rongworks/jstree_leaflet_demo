# jsTree + Leaflet Demo

Just a quick demo using jsTree and Leaflet, to show some places in a tree view and on a map.

## What it does

* Consists of ~~3~~ 2 areas
  * A tree view listing the places/locations
  * A map with markers
  * ~~A Card showing details~~ (details are now inline)
* Read places from a CSV file
* Show markers for each place on the map
* List the places in a tree view (no nesting, should be possible with minor changes)
  * Selecting a place marks (jump to marker) it on the map  
* Show a marker for each place (generated after csv-reading)
  * Selecting a marker selects the location in the tree
* Show details for the location ~~on a card~~ beneath the tree node    

## How to use

1. Rename `data/csv_data_sample.txt` to `data/csv_data.txt` (or change the url in `components/app/app.js`)
2. Add your locations (you need lat&lng for markers, geocode it)
3. You can customize the data structure in `components/tree/TreeComponent.js` (function: parse_places), i.e. for nesting

## Comments

* The CSV headers and some HTML-texts are hardcoded in german, sorry
* When editing the csv structure, you have to edit parsing in `components/tree/TreeComponent.js` to reflect changes
  * Some headers are mandatory, i.e. id, name, lat, lng (you should search for the attributes in the code, some are used _without care_)
* There is a function `add_details` in the TreeComponent that renders the node details, you can customize the visible node-data there  
