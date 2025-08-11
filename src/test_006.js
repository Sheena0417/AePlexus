// test_006.js - オブジェクト参照問題の修正版テスト
(function () {
  app.beginUndoGroup("Test Fixed Layer Assignment");

  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please activate a composition.");
    app.endUndoGroup();
    return;
  }

  var selectedLayers = comp.selectedLayers;
  alert("Selected layers: " + selectedLayers.length);

  if (selectedLayers.length < 2) {
    alert("Please select at least 2 layers");
    app.endUndoGroup();
    return;
  }

  // シェイプレイヤー作成
  var line = comp.layers.addShape();
  line.name = "Test Fixed Assignment";
  line.moveToBeginning();

  // エフェクト追加（シンプル版）
  alert("Adding Start Layer Control...");
  var startFx = line.Effects.addProperty("ADBE Layer Control");
  startFx.name = "Start";
  alert("Start added: " + startFx.name);

  alert("Adding End Layer Control...");
  var endFx = line.Effects.addProperty("ADBE Layer Control");
  endFx.name = "End";
  alert("End added: " + endFx.name);

  // 名前変更後に再取得（重要！）
  alert("Re-getting effects by name...");
  try {
    var startFxByName = line.effect("Start");
    var endFxByName = line.effect("End");
    
    alert("Start re-gotten: " + (startFxByName ? "SUCCESS" : "FAILED"));
    alert("End re-gotten: " + (endFxByName ? "SUCCESS" : "FAILED"));

    // 選択レイヤー設定（再取得したオブジェクトを使用）
    if (startFxByName && endFxByName) {
      alert("Setting layers using re-gotten objects...");
      
      try {
        var targetIndex1 = selectedLayers[0].index;
        var targetIndex2 = selectedLayers[1].index;
        
        alert("Setting Start to layer " + targetIndex1 + " (" + selectedLayers[0].name + ")");
        startFxByName.property(1).setValue(targetIndex1);
        alert("Start set successfully!");
        
        alert("Setting End to layer " + targetIndex2 + " (" + selectedLayers[1].name + ")");
        endFxByName.property(1).setValue(targetIndex2);
        alert("End set successfully!");
        
        // 設定結果を確認
        try {
          var startValue = startFxByName.property(1).value;
          var endValue = endFxByName.property(1).value;
          alert("Final values - Start: " + startValue + ", End: " + endValue);
        } catch(e) {
          alert("Error reading final values: " + e.toString());
        }
        
      } catch(e) {
        alert("Error setting layers: " + e.toString());
      }
    }
    
  } catch(e) {
    alert("Error re-getting effects: " + e.toString());
  }

  app.endUndoGroup();
})();
