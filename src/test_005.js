// test_005.js - connectTwoPoints.jsの関数をテストする
(function () {
  app.beginUndoGroup("Test connectTwoPoints Functions");

  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please activate a composition.");
    app.endUndoGroup();
    return;
  }

  var selectedLayers = comp.selectedLayers;
  alert("Selected layers: " + selectedLayers.length);

  // シェイプレイヤー作成
  var line = comp.layers.addShape();
  line.name = "Test TwoPoints Functions";
  line.moveToBeginning();

  // connectTwoPoints.jsと同じaddEffectIfMissing関数を定義
  function addEffectIfMissing(layer, effectName, matchName, setupFn) {
    alert("Checking for existing effect: " + effectName);
    
    var existing = null;
    try {
      existing = layer.effect(effectName);
      alert("Effect check result: " + (existing ? "EXISTS" : "NOT FOUND"));
    } catch(e) {
      alert("Error checking effect: " + e.toString());
    }
    
    if (!existing) {
      alert("Adding new effect: " + effectName);
      try {
        var fx = layer.Effects.addProperty(matchName);
        alert("Effect added successfully");
        
        try {
          fx.name = effectName;
          alert("Effect renamed to: " + fx.name);
        } catch(e) {
          alert("Error renaming effect: " + e.toString());
        }
        
        if (setupFn && typeof setupFn === "function") {
          try {
            setupFn(fx);
            alert("Setup function executed");
          } catch(e) {
            alert("Error in setup function: " + e.toString());
          }
        }
        
        return fx;
      } catch(e) {
        alert("Error adding effect: " + e.toString());
        return null;
      }
    } else {
      alert("Effect already exists, skipping");
      return existing;
    }
  }

  // Start Layer Control追加
  alert("=== Adding Start Layer Control ===");
  var startFx = addEffectIfMissing(line, "Start", "ADBE Layer Control", function (fx) {
    alert("Start setup function called");
  });

  // End Layer Control追加  
  alert("=== Adding End Layer Control ===");
  var endFx = addEffectIfMissing(line, "End", "ADBE Layer Control", function (fx) {
    alert("End setup function called");
  });

  // 結果確認
  alert("=== Final Results ===");
  alert("Start effect: " + (startFx ? "SUCCESS" : "FAILED"));
  alert("End effect: " + (endFx ? "SUCCESS" : "FAILED"));

  // 実際のエフェクト数を確認
  try {
    var numEffects = line.Effects.numProperties;
    alert("Total effects added: " + numEffects);
    
    for (var i = 1; i <= numEffects; i++) {
      var fx = line.Effects.property(i);
      if (fx) {
        alert("Effect " + i + ": " + fx.name + " (" + fx.matchName + ")");
      }
    }
  } catch(e) {
    alert("Error counting effects: " + e.toString());
  }

  // 選択レイヤー設定テスト
  if (selectedLayers.length >= 2 && startFx && endFx) {
    alert("=== Testing Layer Assignment ===");
    try {
      startFx.property(1).setValue(selectedLayers[0].index);
      alert("Start layer set to: " + selectedLayers[0].name);
      
      endFx.property(1).setValue(selectedLayers[1].index);
      alert("End layer set to: " + selectedLayers[1].name);
    } catch(e) {
      alert("Error setting layers: " + e.toString());
    }
  }

  app.endUndoGroup();
})();
