import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill } from 'ol/style';
import { bbox } from 'ol/loadingstrategy';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';



// Register the EPSG:32638 projection
proj4.defs('EPSG:32638', '+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs');
register(proj4);

const projection = getProjection('EPSG:32638');

// Initialize the map
export function initializeMap() {
  return new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      projection: projection,
      center: [500000, 4649776],
      zoom: 10,
    }),
  });
}

// Function to add a WFS layer to the map
export function addWfsLayer(layerName, map) {
  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
      return `http://localhost:8080/geoserver/EditableDataGroup/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EditableDataGroup:${layerName}&outputFormat=application/json&srsname=EPSG:32638`;
    },
    strategy: bbox, // Use bbox strategy for WFS loading
  });

  const layerStyle = new Style({
    stroke: new Stroke({
      color: 'blue', // Customize the color and width based on layer or attributes
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)', // Fill color with some transparency
    }),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: layerStyle,
  });

  vectorLayer.set('name', layerName); // Set the layer name as a property

  map.addLayer(vectorLayer);
}




const wfsHandler = new wfsHandler.WFSService();

export async function createLayerControls(layersConfig, map) {
  const layerControls = document.getElementById('layers-list');

  // Loop through each layer and create a control
  layersConfig.forEach((layer, index) => {
    const layerControl = document.createElement('div');
    layerControl.className = 'layerControl';
    layerControl.innerHTML = `
      <input type="checkbox" id="layer-${index}" name="${layer.name}" checked>
      <label for="layer-${index}">${layer.name}</label>
      <button id="zoom-${index}">Zoom</button>
      <button id="style-${index}">Style</button>
      <button id="draw-${index}">Draw</button>
    `;

    // Append the control to the layerControls container
    layerControls.appendChild(layerControl);

    // Add event listeners for zoom and style buttons
    document.getElementById(`zoom-${index}`).addEventListener('click', () => {
      zoomToLayer(layer.name, map);
    });

    document.getElementById(`style-${index}`).addEventListener('click', () => {
      showStyleModal(layer.name);
    });

    document.getElementById(`draw-${index}`).addEventListener('click', () => {
      drawFeature(layer.name, map);
    });
  });
}

export function zoomToLayer(layerName, map) {
  const layer = map.getLayers().getArray().find(l => {
    return l.get('name') === layerName;
  });

  if (layer) {
    const source = layer.getSource();
    const extent = source.getExtent();
    map.getView().fit(extent, { size: map.getSize(), maxZoom: 18 });
  } else {
    console.error(`Layer ${layerName} not found.`);
  }
}


export function showStyleModal(layerName) {
  const modal = document.getElementById('styleModal');
  const layer = map.getLayers().getArray().find(l => {
    return l.get('name') === layerName;
  });

  if (layer) {
    const style = layer.getStyle();
    const strokeColor = style.getStroke().getColor();
    const fillColor = style.getFill().getColor();

    document.getElementById('strokeColor').value = strokeColor;
    document.getElementById('fillColor').value = fillColor;

    modal.style.display = 'block';

    document.getElementById('saveStyle').addEventListener('click', () => {
      const strokeColor = document.getElementById('strokeColor').value;
      const fillColor = document.getElementById('fillColor').value;
      updateLayerStyle(layerName, strokeColor, fillColor);
      modal.style.display = 'none';
    });

    document.getElementById('cancelStyle').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  } else {
    console.error(`Layer ${layerName} not found.`);
  }
}



