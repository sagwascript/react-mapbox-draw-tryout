import React, { Component } from "react";
import { render } from "react-dom";
import MapGL, { Marker, Source, Layer } from "react-map-gl";
import { Editor, EditorModes } from "react-map-gl-draw";

import ControlPanel from "./control-panel";
import { getFeatureStyle, getEditHandleStyle } from "./style";

const TOKEN =
  "pk.eyJ1Ijoic2Fnd2FzY3JpcHQiLCJhIjoiY2syZGVpeHNoMGY2MTNkbHFiMTZiejZyOCJ9.6EuAUuNNqWnaIINOwkLwBw"; // Set your mapbox token here

const featureData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "e46hfj734-0b3e-11ea-91e7-add2eb32a9b7",
        renderType: "Point"
      },
      geometry: {
        type: "Point",
        coordinates: [-91.94764273071169, 42.788351267148045]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "e4695e50-0b3e-11ea-91e7-add2eb32a9b7",
        renderType: "Polygon"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-91.94764273071169, 42.788351267148045],
            [-91.91949026489651, 42.77083801669561],
            [-91.93425314330935, 42.75218536987872],
            [-91.95553915405665, 42.75836153017169],
            [-91.9543375244127, 42.774618274110665],
            [-91.94764273071169, 42.788351267148045]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "dc885150-0b4d-11ea-89d9-7968ec03c73c",
        renderType: "Polygon"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-91.88017980956911, 42.78192611748266],
            [-91.85528890991105, 42.765419245359325],
            [-91.87811987304326, 42.75911775239344],
            [-91.89082281494035, 42.7694518644936],
            [-91.8887628784169, 42.77701231778156],
            [-91.88017980956911, 42.78192611748266]
          ]
        ]
      }
    }
  ]
};

const polygonLayer = {
  id: "polygon",
  type: "fill",
  paint: {
    "fill-color": "rgba(122,15,14,0.8)"
  },
  filter: ["==", "$type", "Polygon"]
};

const pointLayer = {
  id: "point",
  type: "circle",
  paint: {
    "circle-color": "rgb(24,15,112)"
  },
  filter: ["==", "$type", "Point"]
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this._editorRef = null;
    this.state = {
      viewport: {
        longitude: -91.874,
        latitude: 42.76,
        zoom: 12
      },
      mode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null,
      geometryType: null,
      area: null
    };
  }

  _updateViewport = viewport => {
    console.log("viewport change");
    this.setState({ viewport });
  };

  _onSelect = options => {
    this.setState({
      selectedFeatureIndex: options && options.selectedFeatureIndex
    });
  };

  _onDelete = () => {
    this._editorRef.deleteFeatures(0);
    this.setState({ area: null });
  };

  _onUpdate = options => {
    console.log("yooo: ", options);
    console.log("Geometry type: ", options.data[0].geometry.type);
    this.setState({ geometryType: options.data[0].geometry.type });
    this.setState({ area: options.data[0] });
    if (options.editType === "addFeature") {
      this.setState({
        mode: EditorModes.EDITING
      });
    }
  };

  _renderDrawTools = () => {
    // copy from mapbox
    return (
      <div className="mapboxgl-ctrl-top-left">
        <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
          {this.state.area === null && (
            <React.Fragment>
              <button
                className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
                title="Polygon tool (p)"
                onClick={() =>
                  this.setState({ mode: EditorModes.DRAW_POLYGON })
                }
              />
              <button
                className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_point"
                title="Polygon tool (p)"
                onClick={() => this.setState({ mode: EditorModes.DRAW_POINT })}
              />
            </React.Fragment>
          )}
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            title="Delete"
            onClick={this._onDelete}
          />
        </div>
      </div>
    );
  };

  _renderControlPanel = () => {
    const features = this._editorRef && this._editorRef.getFeatures();
    let featureIndex = this.state.selectedFeatureIndex;
    if (features && featureIndex === null) {
      featureIndex = features.length - 1;
    }
    const polygon = features && features.length ? features[featureIndex] : null;
    return (
      <ControlPanel
        containerComponent={this.props.containerComponent}
        polygon={polygon}
      />
    );
  };

  render() {
    const { viewport, mode } = this.state;
    console.log(this.state.area);
    return (
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxApiAccessToken={TOKEN}
        onViewportChange={this._updateViewport}
      >
        {this.state.geometryType === "Point" && this.state.area !== null && (
          <Marker
            latitude={this.state.area.geometry.coordinates[0][1]}
            longitude={this.state.area.geometry.coordinates[0][0]}
            offsetLeft={-20}
            offsetTop={-10}
            onDragEnd={({ lngLat }) =>
              this.setState({
                area: {
                  ...this.state.area,
                  geometry: {
                    ...this.state.area.geometry,
                    coordinates: [lngLat]
                  }
                }
              })
            }
            draggable
          >
            <div style={{ height: 20, width: 20, background: "red" }}></div>
          </Marker>
        )}

        {/*<Source id="my-data" type="geojson" data={featureData}>
          <Layer {...polygonLayer} />
          <Layer {...pointLayer} />
          </Source>*/}

        <Editor
          ref={_ => (this._editorRef = _)}
          style={{ width: "100%", height: "100%" }}
          clickRadius={0}
          mode={mode}
          onSelect={this._onSelect}
          onUpdate={this._onUpdate}
          editHandleShape={"circle"}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />

        {this._renderDrawTools()}
        {this._renderControlPanel()}
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
