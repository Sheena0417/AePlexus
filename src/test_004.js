// test_004.js - Layer Control詳細デバッグ用
(function () {
  app.beginUndoGroup("Debug Layer Control Details");

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

  // シェイプレイヤー作成
  var line = comp.layers.addShape();
  line.name = "Debug Layer Control";
  line.moveToBeginning();

  // Layer Control追加
  try {
    var startFx = line.Effects.addProperty("ADBE Layer Control");
    alert("Start Layer Control added successfully");
    
    try {
      startFx.name = "Start";
      alert("Start Layer Control renamed successfully");
    } catch(e) {
      alert("Error renaming Start: " + e.toString());
    }

    // エフェクトの基本情報
    alert("Start effect matchName: " + startFx.matchName);
    alert("Start effect name: " + startFx.name);
    
    // プロパティの数を安全に取得
    try {
      var numProps = startFx.numProperties;
      alert("Start effect numProperties: " + numProps);
      
      // 各プロパティを調査
      for (var i = 1; i <= numProps; i++) {
        try {
          var prop = startFx.property(i);
          if (prop) {
            alert("Property " + i + ": name='" + prop.name + "', matchName='" + prop.matchName + "', propertyValueType=" + prop.propertyValueType);
          }
        } catch(e) {
          alert("Error accessing property " + i + ": " + e.toString());
        }
      }
    } catch(e) {
      alert("Error getting numProperties: " + e.toString());
      
      // 代替方法: property(1)に直接アクセス
      try {
        var prop1 = startFx.property(1);
        if (prop1) {
          alert("Direct property(1): name='" + prop1.name + "', matchName='" + prop1.matchName + "'");
        }
      } catch(e2) {
        alert("Error accessing property(1): " + e2.toString());
      }
    }

    // 実際にレイヤー設定を試行
    if (selectedLayers.length >= 2) {
      alert("Attempting to set layer...");
      try {
        var targetIndex = selectedLayers[0].index;
        alert("Target layer index: " + targetIndex);
        
        // property(1)でレイヤーを設定
        startFx.property(1).setValue(targetIndex);
        alert("Layer set successfully using property(1)!");
        
        // 設定後の値を確認
        try {
          var currentValue = startFx.property(1).value;
          alert("Current value after setting: " + currentValue);
        } catch(e) {
          alert("Error reading current value: " + e.toString());
        }
        
      } catch(e) {
        alert("Error setting layer: " + e.toString());
        
        // 他の方法も試してみる
        try {
          startFx.property("Layer").setValue(targetIndex);
          alert("Successfully set using property('Layer')");
        } catch(e2) {
          alert("Error with property('Layer'): " + e2.toString());
        }
      }
    }
    
    // End Layer Controlも追加してテスト
    alert("Adding End Layer Control...");
    try {
      var endFx = line.Effects.addProperty("ADBE Layer Control");
      alert("End Layer Control added successfully");
      
      try {
        endFx.name = "End";
        alert("End Layer Control renamed successfully");
      } catch(e) {
        alert("Error renaming End: " + e.toString());
      }

      // Endにも2番目のレイヤーを設定
      if (selectedLayers.length >= 2) {
        try {
          var targetIndex2 = selectedLayers[1].index;
          alert("Setting End to layer index: " + targetIndex2);
          
          endFx.property(1).setValue(targetIndex2);
          alert("End layer set successfully!");
          
          // 設定後の値を確認
          try {
            var currentValue2 = endFx.property(1).value;
            alert("End current value after setting: " + currentValue2);
          } catch(e) {
            alert("Error reading End current value: " + e.toString());
          }
          
        } catch(e) {
          alert("Error setting End layer: " + e.toString());
        }
      }
      
    } catch(e) {
      alert("Error adding End Layer Control: " + e.toString());
    }
    
  } catch(e) {
    alert("Error adding Start Layer Control: " + e.toString());
  }

  alert("Test completed. Check the Effects panel for both Start and End Layer Controls.");
  app.endUndoGroup();
})();
