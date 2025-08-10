import { getOrCreateControlLayer } from "./createControlLayer.js";
import { addControlEffects } from "./addControlEffects.js";

function escName(n) { return n.replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
function buildSimpleExpression(originName, layerBName, controlLayerName, idx) {
  return (
    "try {\n" +
    "var A=thisComp.layer('" + escName(originName) + "');\n" +
    "var B=thisComp.layer('" + escName(layerBName) + "');\n" +
    "var ctl=thisComp.layer('" + escName(controlLayerName) + "');\n" +
    "var p1=thisLayer.fromComp(A.toComp(A.anchorPoint));\n" +
    "var p2=thisLayer.fromComp(B.toComp(B.anchorPoint));\n" +
    "createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false);\n" +
    "} catch(e) {\n" +
    "}\n"
  );
}

export function connectOrigin() {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) return;

  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length < 1) {
    alert("Select at least 1 layer.");
    return;
  }

  app.beginUndoGroup("Connect to Origin with Wave");

  var originName = "origine";
  var origin = comp.layer(originName);
  if (!origin) {
    origin = comp.layers.addNull();
    origin.name = originName;
    origin.threeDLayer = false;
    origin.transform.position.setValue([comp.width / 2, comp.height / 2]);
    origin.label = 9;
  }

  var controlLayer = getOrCreateControlLayer(comp, "Control_Origin");
  addControlEffects(controlLayer);

  var template = comp.layers.addShape();
  template.name = "OriginTemplate";
  var contents = template.property("ADBE Root Vectors Group");
  var shapeGroup = contents.addProperty("ADBE Vector Group");
  shapeGroup.name = "Shape 1";
  var groupContents = shapeGroup.property("ADBE Vectors Group");
  var pathGroup = groupContents.addProperty("ADBE Vector Shape - Group");
  pathGroup.name = "Path 1";
  var path = pathGroup.property("ADBE Vector Shape");

  var dummy = new Shape();
  dummy.vertices = [[0, 0], [100, 0]];
  dummy.inTangents = [[0, 0], [0, 0]];
  dummy.outTangents = [[0, 0], [0, 0]];
  dummy.closed = false;
  path.setValue(dummy);

  var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
  stroke.property("Stroke Width").setValue(2);
  stroke.property("Color").setValue([1, 1, 1]);

  for (var i = 0; i < selectedLayers.length; i++) {
    var B = selectedLayers[i];
    if (B.name === originName) continue;
    var line = template.duplicate();
    line.name = "Line: origine ↔ " + B.name;
    var expr = buildSimpleExpression(origin.name, B.name, controlLayer.name, i);
    line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("Path 1")("ADBE Vector Shape").expression = expr;
    line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Width").expression =
      "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Width')(1)";
    line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Color").expression =
      "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Color')('Color')";
  }

  template.remove();
  app.endUndoGroup();
}
