import React, { PureComponent } from "react";
const defaultContainer = ({ children }) => (
  <div className="control-panel">{children}</div>
);

export default class ControlPanel extends PureComponent {
  render() {
    const Container = this.props.containerComponent || defaultContainer;
    return (
      <Container>
        <h5>Choose :</h5>
        <ul>
          <li>Polygon icon to draw an area</li>
          <li>Spot icon to draw a spot</li>
          <li>Trash icon to delete marked spot/area</li>
        </ul>
      </Container>
    );
  }
}
