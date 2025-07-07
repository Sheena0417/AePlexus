import { getLayerPosition } from "./layerPositions.js";

export function connectPlexusByPosition() {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) return;

  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length < 2) {
    alert("Select at least 2 layers.");
    return;
  }

  app.beginUndoGroup("Connect Plexus");

  for (var i = 0; i < selectedLayers.length - 1; i++) {
    for (var j = i + 1; j < selectedLayers.length; j++) {
      var layerA = selectedLayers[i];
      var layerB = selectedLayers[j];

      var posA, posB;
      try {
        posA = getLayerPosition(layerA);
        posB = getLayerPosition(layerB);
      } catch (e) {
        alert("Position error: " + e.toString());
        continue;
      }

      var shapeLayer = comp.layers.addShape();
      shapeLayer.name = layerA.name + "_to_" + layerB.name;

      var contents = shapeLayer.property("ADBE Root Vectors Group");
      if (!contents) continue;

      var shapeGroup = contents.addProperty("ADBE Vector Group");
      if (!shapeGroup) continue;

      var vectorsGroup = shapeGroup.property("ADBE Vectors Group");
      if (!vectorsGroup) continue;

      var pathGroup = vectorsGroup.addProperty("ADBE Vector Shape - Group");
      if (!pathGroup) continue;

      var stroke = vectorsGroup.addProperty("ADBE Vector Graphic - Stroke");
      stroke.property("Color").setValue([1, 1, 1]);
      stroke.property("Stroke Width").setValue(2);

      var pathProp = pathGroup.property("ADBE Vector Shape");
      if (!pathProp) continue;

      try {
        var shape = new Shape();
        shape.vertices = [
          [posA[0], posA[1]],
          [posB[0], posB[1]]
        ];
        shape.closed = false;

        pathProp.setValue(shape);
      } catch (e) {
        alert("❌ Failed to set shape: " + e.toString());
        continue;
      }

      shapeLayer.threeDLayer = false;
    }
  }

  app.endUndoGroup();
}
