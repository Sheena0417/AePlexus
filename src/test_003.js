// test_003.js - Two Points動作デバッグ用
(function () {
  app.beginUndoGroup("Debug Two Points Mode");

  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please activate a composition.");
    app.endUndoGroup();
    return;
  }

  // 選択されたレイヤーを取得・表示
  var selectedLayers = comp.selectedLayers;
  alert("Selected layers: " + selectedLayers.length);
  
  if (selectedLayers.length >= 2) {
    alert("Layer 1: " + selectedLayers[0].name + " (index: " + selectedLayers[0].index + ")");
    alert("Layer 2: " + selectedLayers[1].name + " (index: " + selectedLayers[1].index + ")");
  }

  // シェイプレイヤー作成（Two Pointsと同じ手順）
  var line = comp.layers.addShape();
  line.name = "Debug TwoPoints";
  line.moveToBeginning();

  // Layer Control追加（簡略版）
  var startFx = line.Effects.addProperty("ADBE Layer Control");
  startFx.name = "Start";
  
  var endFx = line.Effects.addProperty("ADBE Layer Control");
  endFx.name = "End";

  alert("Layer Controls added");

  // エフェクト構造調査
  alert("Start effect properties: " + startFx.numProperties);
  for (var i = 1; i <= startFx.numProperties; i++) {
    var prop = startFx.property(i);
    if (prop) {
      alert("Start Property " + i + ": " + prop.name + " (matchName: " + prop.matchName + ")");
    }
  }

  // 選択レイヤー設定テスト
  if (selectedLayers.length >= 2) {
    try {
      // test_002で成功した方法
      startFx.property(1).setValue(selectedLayers[0].index);
      alert("Start layer set successfully");
      
      endFx.property(1).setValue(selectedLayers[1].index);
      alert("End layer set successfully");
      
      alert("Both layers set! Check the Layer Controls in the Effect panel.");
      
    } catch(e) {
      alert("Error setting layers: " + e.toString());
    }
  }

  app.endUndoGroup();
})();
