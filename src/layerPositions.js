export function getLayerPosition(layer) {
  var pos = layer.property("ADBE Transform Group").property("ADBE Position");
  if (pos) {
    var value = pos.value;
    // 3Dの場合 [x, y, z] で返ってくるが、Shapeでは [x, y] のみ使用
    return [value[0], value[1]];
  }
  throw new Error("Position not found on layer: " + layer.name);
}
