export function connectPlexusByPosition() {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please select a composition.");
    return;
  }

  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length < 2) {
    alert("Please select at least 2 layers.");
    return;
  }

  app.beginUndoGroup("Connect Plexus by Position");

  for (var i = 0; i < selectedLayers.length - 1; i++) {
    for (var j = i + 1; j < selectedLayers.length; j++) {
      var layerA = selectedLayers[i];
      var layerB = selectedLayers[j];

      // 位置を取得（3D対応）
      var posA = layerA.property("ADBE Transform Group").property("ADBE Position").value;
      var posB = layerB.property("ADBE Transform Group").property("ADBE Position").value;

      // シェイプレイヤー作成
      var shapeLayer = comp.layers.addShape();
      shapeLayer.name = layerA.name + "_to_" + layerB.name;

      var contents = shapeLayer.property("ADBE Root Vectors Group");
      var shapeGroup = contents.addProperty("ADBE Vector Group");
      shapeGroup.name = "Line";

      var pathGroup = shapeGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Group");
      var stroke = shapeGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");

      stroke.property("Color").setValue([1, 1, 1]); // 白
      stroke.property("Stroke Width").setValue(3);

      var pathProp = pathGroup.property("ADBE Vector Shape");

      // 仮のシェイプ（これが無いとsetExpression失敗することがある）
      var tempShape = new Shape();
      tempShape.vertices = [[0, 0], [100, 100]];
      tempShape.closed = false;
      pathProp.setValue(tempShape);

      // エクスプレッションを使わず固定位置で接続（まずはこれで動作確認）
      var shape = new Shape();
      shape.vertices = [[posA[0], posA[1]], [posB[0], posB[1]]];
      shape.closed = false;

      pathProp.setValue(shape);

      shapeLayer.threeDLayer = false;
    }
  }

  app.endUndoGroup();
}
