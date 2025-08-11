export function addControlEffects(layer) {
  function addEffectIfMissing(effectName, matchName, setupFn) {
    if (!layer.effect(effectName)) {
      var fx = layer.Effects.addProperty(matchName);
      fx.name = effectName;
      if (setupFn && typeof setupFn === "function") setupFn(fx);
    }
  }

  // ---- 既存のまま ----
  addEffectIfMissing("Threshold", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(300);
  });
  addEffectIfMissing("Line Width", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(2);
  });
  addEffectIfMissing("Line Color", "ADBE Color Control", function (fx) {
    fx.property("Color").setValue([1, 1, 1]);
  });
  addEffectIfMissing("Enable Wave", "ADBE Checkbox Control", function (fx) {
    fx.property("Checkbox").setValue(0);
  });

  // Wave Type Dropdown - test_001.js と同じ手法で確実に改名
  (function ensureWaveTypeRobust(layer){
    var parade = layer.property("ADBE Effect Parade");
    if (!parade) return;

    // 既存 "Wave Type" があるなら何もしない
    for (var i = 1; i <= parade.numProperties; i++) {
      var fx = parade.property(i);
      if (fx && fx.name === "Wave Type") return;
    }

    // 1) 既存の Dropdown を流用、なければ新規作成
    var dd = null;
    for (var i = 1; i <= parade.numProperties; i++) {
      var fx = parade.property(i);
      if (fx && fx.matchName === "ADBE Dropdown Control") { dd = fx; break; }
    }
    if (!dd) dd = parade.addProperty("ADBE Dropdown Control");

    // 2) 項目設定
    var menu = dd && dd.property(1);
    if (menu && typeof menu.setPropertyParameters === "function") {
      try { menu.setPropertyParameters(["Sin","Random"]); } catch(e){}
      try { menu.setValue(1); } catch(e){}
    }

    // 3) test_001.js と同じ6段階改名
    var renamed = false;
    
    // 段階1: 親へ直付け
    try { dd.name = "Wave Type"; renamed = (dd.name === "Wave Type"); } catch (e) {}
    
    // 段階2: 子から親へ辿って改名
    if (!renamed) {
      try {
        menu.propertyGroup(1).name = "Wave Type";
        renamed = (dd.name === "Wave Type" || menu.propertyGroup(1).name === "Wave Type");
      } catch (e) {}
    }
    
    // 段階3: 末尾再取得で改名
    if (!renamed) {
      try {
        var tail = parade.property(parade.numProperties);
        if (tail) {
          tail.name = "Wave Type";
          renamed = (tail.name === "Wave Type");
        }
      } catch (e) {}
    }
    
    // 段階4: 複製→元削除→改名
    if (!renamed) {
      try {
        var dup = dd.duplicate();
        dd.remove();
        dd = dup;
        menu = dd.property(1);
        try { dd.name = "Wave Type"; } catch (e) {}
        try { if (menu && menu.propertyGroup) menu.propertyGroup(1).name = "Wave Type"; } catch (e) {}
        renamed = (dd.name === "Wave Type");
      } catch (e) {}
    }

  })(layer);

  // ---- 既存のまま ----
  addEffectIfMissing("Wave Amplitude", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(25);
  });
  addEffectIfMissing("Wave Frequency", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(50);
  });
  addEffectIfMissing("Wave Speed", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(25);
  });
  addEffectIfMissing("Wave Divisions", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(20);
  });
  addEffectIfMissing("Wave Direction", "ADBE Angle Control", function (fx) {
    fx.property("Angle").setValue(0);
  });
  addEffectIfMissing("Intensity", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(50);
  });
  addEffectIfMissing("Smooth Curves", "ADBE Checkbox Control", function (fx) {
    fx.property("Checkbox").setValue(1);
  });
  addEffectIfMissing("Random Seed", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(1);
  });
}
