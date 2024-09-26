import { initializeMap, addWfsLayer } from './src/mapSetup.js';
import { createLayerControls } from './src/layerControls.js';



let map;
let layers = [
  { name: 'nakveti', visible: true },
  { name: 'shenoba', visible: true }
];

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map
  map = initializeMap();
  layers.forEach(layer => addWfsLayer(layer.name, map));
  createLayerControls(layers, map);
});
