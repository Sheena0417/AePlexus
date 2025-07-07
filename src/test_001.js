(function () {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please select a composition.");
    return;
  }

  var selectedLayer = comp.selectedLayers[0];
  if (!selectedLayer) {
    alert("Please select one layer.");
    return;
  }

  app.beginUndoGroup("Correct Line from Layer Position");

  // コンポジション座標でレイヤー位置を取得
  var compPos = selectedLayer.toComp([0, 0, 0]);
  var compEndPos = [compPos[0] + 100, compPos[1] + 100, compPos[2]];

  // シェイプレイヤーを作成
  var shapeLayer = comp.layers.addShape();
  shapeLayer.name = "Correct Line";

  var contents = shapeLayer.property("ADBE Root Vectors Group");
  var shapeGroup = contents.addProperty("ADBE Vector Group");
  shapeGroup.name = "Line";

  var groupContents = shapeGroup.property("ADBE Vectors Group");
  if (!groupContents) {
    alert("❌ Failed to get groupContents");
    app.endUndoGroup();
    return;
  }

  var pathGroup = groupContents.addProperty("ADBE Vector Shape - Group");
  var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
  stroke.property("Color").setValue([1, 1, 1]);
  stroke.property("Stroke Width").setValue(2);

  var pathProp = pathGroup.property("ADBE Vector Shape");
  if (!pathProp) {
    alert("❌ Failed to get pathProp");
    app.endUndoGroup();
    return;
  }

  // コンポジション座標→シェイプレイヤー内のローカル座標へ変換
  var localStart = shapeLayer.fromComp(compPos);
  var localEnd = shapeLayer.fromComp(compEndPos);

  // Shapeをセットする（正しいローカル座標系）
  var shape = new Shape();
  shape.vertices = [[localStart[0], localStart[1]], [localEnd[0], localEnd[1]]];
  shape.inTangents = [[0, 0], [0, 0]];
  shape.outTangents = [[0, 0], [0, 0]];
  shape.closed = false;

  try {
    pathProp.setValue(shape);
  } catch (e) {
    alert("❌ shape.setValue() failed: " + e.toString());
  }

  shapeLayer.threeDLayer = false;

  app.endUndoGroup();
})();
