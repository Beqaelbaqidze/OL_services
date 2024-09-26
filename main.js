import { initializeMap, layerHandler, addWfsLayer } from './src/mapSetup.js';

let map;
let layers = [
  { name: 'nakveti', visible: true },
  { name: 'shenoba', visible: true },
  { name: 'topo_point', visible: true },
  { name: 'topo_line', visible: true },

];

document.addEventListener('DOMContentLoaded', () => {
  map = initializeMap();
  layers.forEach(layer => addWfsLayer(layer.name, map));
  layerHandler();
});
