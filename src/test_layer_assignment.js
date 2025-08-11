// test_layer_assignment.js - レイヤー自動設定をデバッグ
(function () {
  app.beginUndoGroup("Test Layer Assignment Debug");

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

  alert("Layer 1: " + selectedLayers[0].name + " (index: " + selectedLayers[0].index + ")");
  alert("Layer 2: " + selectedLayers[1].name + " (index: " + selectedLayers[1].index + ")");

  // シェイプレイヤー作成
  var line = comp.layers.addShape();
  line.name = "Test Layer Assignment";
  line.moveToBeginning();

  // Start/End Layer Control追加（connectTwoPoints.jsと同じ方法）
  alert("Adding Start Layer Control...");
  if (!line.effect("Start")) {
    var startFx = line.Effects.addProperty("ADBE Layer Control");
    startFx.name = "Start";
    alert("Start Layer Control added");
  }

  alert("Adding End Layer Control...");
  if (!line.effect("End")) {
    var endFx = line.Effects.addProperty("ADBE Layer Control");
    endFx.name = "End";
    alert("End Layer Control added");
  }

  // connectTwoPoints.jsと同じ方法で設定
  alert("=== Testing connectTwoPoints method ===");
  try {
    // エフェクト追加後に名前で再取得（connectTwoPoints.jsと同じ）
    var startFxByName = line.effect("Start");
    var endFxByName = line.effect("End");
    
    alert("Start effect re-gotten: " + (startFxByName ? "SUCCESS" : "FAILED"));
    alert("End effect re-gotten: " + (endFxByName ? "SUCCESS" : "FAILED"));
    
    if (startFxByName && startFxByName.property(1)) {
      alert("Setting Start to index: " + selectedLayers[0].index);
      startFxByName.property(1).setValue(selectedLayers[0].index);
      alert("Start setValue completed");
      
      // 設定後すぐに確認
      try {
        var startValue = startFxByName.property(1).value;
        alert("Start value after setting: " + startValue);
      } catch(e) {
        alert("Error reading Start value: " + e.toString());
      }
    }
    
    if (endFxByName && endFxByName.property(1)) {
      alert("Setting End to index: " + selectedLayers[1].index);
      endFxByName.property(1).setValue(selectedLayers[1].index);
      alert("End setValue completed");
      
      // 設定後すぐに確認
      try {
        var endValue = endFxByName.property(1).value;
        alert("End value after setting: " + endValue);
      } catch(e) {
        alert("Error reading End value: " + e.toString());
      }
    }
    
  } catch(e) {
    alert("Error in connectTwoPoints method: " + e.toString());
  }

  // 少し時間を置いてから再確認
  alert("=== Final Check ===");
  try {
    var finalStartFx = line.effect("Start");
    var finalEndFx = line.effect("End");
    
    if (finalStartFx && finalStartFx.property(1)) {
      var finalStartValue = finalStartFx.property(1).value;
      alert("Final Start value: " + finalStartValue);
    }
    
    if (finalEndFx && finalEndFx.property(1)) {
      var finalEndValue = finalEndFx.property(1).value;
      alert("Final End value: " + finalEndValue);
    }
    
  } catch(e) {
    alert("Error in final check: " + e.toString());
  }

  alert("Test completed. Please check the Layer Controls in the Effects panel to see if the layers are actually set.");
  app.endUndoGroup();
})();
