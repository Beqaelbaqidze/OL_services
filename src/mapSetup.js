import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";
import { WFSRequestHandler } from "./wfsHandler";
import { showFeatureSidebar } from './gridHandler';  // Import functions from gridHandler.js

let selectedFeature = null;

const baseUrl = `http://localhost:8080/geoserver/sketchup/ows`;
const version = "2.0.0";
const workspace = "sketchup";
const wfsRequestHandler = new WFSRequestHandler(version, workspace, baseUrl);

// Register the EPSG:32638 projection
proj4.defs("EPSG:32638", "+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs");
register(proj4);

const projection = getProjection("EPSG:32638");

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
      name: "OpenStreetMap",
    }),
  ],
  view: new View({
    projection: projection,
    center: [500000, 4649776],
    zoom: 10,
  }),
});

export function initializeMap() {
  return map;
}

function createStyleFunction() {
  return function (feature) {
    const geometryType = feature.getGeometry().getType();

    if (geometryType === "Point" || geometryType === "MultiPoint") {
      return new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "yellow",
          }),
          stroke: new Stroke({
            color: "black",
            width: 2,
          }),
        }),
      });
    }

    if (geometryType === "LineString" || geometryType === "MultiLineString") {
      return new Style({
        stroke: new Stroke({
          color: "red",
          width: 2,
        }),
      });
    }

    if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
      return new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 255, 0)", // The last value '0.5' controls the opacity
        }),
      });
    }
  };
}

export async function addWfsLayer(layerName) {
  try {
    const data = await wfsRequestHandler.getFeature(layerName);
    console.log("Received GeoJSON Data:", data);

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: projection,
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: createStyleFunction(),
    });

    vectorLayer.set("name", layerName);
    map.addLayer(vectorLayer);

    generateLayersList(map.getLayers().getArray());
  } catch (error) {
    console.error("Error fetching WFS data:", error);
  }
}

export function generateLayersList(layers) {
  const layersListElement = document.getElementById("layers-list");

  // Clear any existing content
  layersListElement.innerHTML = "";

  layers.forEach((layer, index) => {
    // Create a container for each layer item
    const layerItem = document.createElement("div");
    layerItem.classList.add("layer-item");

    // Create a checkbox for the layer
    const layerCheckbox = document.createElement("input");
    layerCheckbox.type = "checkbox";
    layerCheckbox.id = `layer-checkbox-${index}`;
    layerCheckbox.checked = layer.getVisible(); // Set initial state based on layer visibility
    layerCheckbox.addEventListener("change", (event) => {
      layer.setVisible(event.target.checked); // Toggle layer visibility
    });

    // Create a label for the checkbox
    const layerLabel = document.createElement("label");
    layerLabel.htmlFor = `layer-checkbox-${index}`;
    layerLabel.innerText = layer.get("name") || `Layer ${index + 1}`;

    // Append the checkbox and label to the layer item container
    layerItem.appendChild(layerCheckbox);
    layerItem.appendChild(layerLabel);

    // Check if the layer is a vector layer (add buttons for vector layers only)
    if (layer instanceof VectorLayer) {
      // Create a button for zooming to the layer's extent
      const zoomButton = document.createElement("button");
      zoomButton.innerText = "Zoom";
      zoomButton.addEventListener("click", () => {
        const extent = layer.getSource().getExtent();
        map.getView().fit(extent, { duration: 1000 });
      });

      // Append the buttons to the layer item container
      layerItem.appendChild(zoomButton);
    }

    // Append the layer item to the layers list container
    layersListElement.appendChild(layerItem);
  });
}

function selectFeature(feature) {
  if (selectedFeature) {
    selectedFeature.setStyle(null);
    selectedFeature = null;
  }

  if (feature) {
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({
            color: "aqua",
            opocity: 0.5,
          }),
          stroke: new Stroke({
            color: "aqua",
            width: 4,
          }),
        }),
        stroke: new Stroke({
          color: "aqua",
          width: 5,
        }),
        fill: new Fill({
          color: "aqua",
          opocity: 0.5,
        }),
      })
    );

    selectedFeature = feature;
    const properties = feature.getProperties();
    showFeatureModal(properties); // Use the imported showFeatureModal function
  }
}

function getTopPriorityFeature(clickedPixel, map) {
  const layers = map.getLayers().getArray();
  const featuresAtPixel = [];

  layers.forEach((layer) => {
    const features = map.getFeaturesAtPixel(clickedPixel, {
      layerFilter: (layerToFilter) => layerToFilter === layer,
    });

    if (features && features.length > 0) {
      featuresAtPixel.push({
        layer,
        features,
      });
    }
  });

  if (featuresAtPixel.length > 0) {
    const layersListElement = document.getElementById("layers-list");
    const layersInHtmlOrder = Array.from(
      layersListElement.getElementsByClassName("layer-item")
    ).map((element) => element.dataset.layerName);

    featuresAtPixel.sort((a, b) => {
      const layerAName = a.layer.get("name");
      const layerBName = b.layer.get("name");
      return (
        layersInHtmlOrder.indexOf(layerAName) -
        layersInHtmlOrder.indexOf(layerBName)
      );
    });

    return {
      feature: featuresAtPixel[0].features[0],
      layer: featuresAtPixel[0].layer,
    };
  }

  return null;
}

async function fieldType(layerName) {
  try {
    const data = await wfsRequestHandler.describeFeatureType(layerName);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    const elements = xmlDoc.getElementsByTagName("xsd:element");
    const fieldTypes = [];

    for (let i = 0; i < elements.length; i++) {
      const name = elements[i].getAttribute("name");
      const type = elements[i].getAttribute("type");
      fieldTypes.push({ name, type });
    }

    console.log("Field Types:", fieldTypes);
    return fieldTypes; // Return field types
  } catch (error) {
    console.error("Error fetching DescribeFeatureType data:", error);
  }
}

export function layerHandler() {
  map.on('click', async (event) => {
    const clickedPixel = event.pixel;

    // Get both top feature and its corresponding layer
    const topPriorityResult = getTopPriorityFeature(clickedPixel, map);

    if (topPriorityResult && topPriorityResult.feature) {
      
      const { feature: topPriorityFeature, layer } = topPriorityResult;
      const properties = topPriorityFeature.getProperties();
      const featureName = topPriorityFeature.getGeometry().getType();

      // Get the name of the clicked layer
      const selectedLayerName = layer.get("name");
      console.log(`Feature found in layer: ${selectedLayerName}`);

      // Fetch field types using the layer name
      const fieldTypes = await fieldType(selectedLayerName); // Use the layer name here

      // Call showFeatureModal, passing properties and fieldTypes
      await showFeatureSidebar(properties, fieldTypes);
      selectFeature(topPriorityResult.feature);
    } else {
      selectFeature(null);
      console.log('No feature found at this location.');
    }
  });
}

