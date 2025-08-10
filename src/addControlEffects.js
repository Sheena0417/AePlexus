export function addControlEffects(layer) {
  function addEffectIfMissing(effectName, matchName, setupFn) {
    if (!layer.effect(effectName)) {
      var fx = layer.Effects.addProperty(matchName);
      fx.name = effectName;
      if (setupFn && typeof setupFn === "function") setupFn(fx);
    }
  }

  // Threshold (Slider)
  addEffectIfMissing("Threshold", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(300);
  });

  // Line Width (Slider)
  addEffectIfMissing("Line Width", "ADBE Slider Control", function (fx) {
    fx.property("Slider").setValue(2);
  });

  // Line Color (Color Control)
  addEffectIfMissing("Line Color", "ADBE Color Control", function (fx) {
    fx.property("Color").setValue([1, 1, 1]);
  });

  // Enable Wave (Checkbox)
  addEffectIfMissing("Enable Wave", "ADBE Checkbox Control", function (fx) {
    fx.property("Checkbox").setValue(0);
  });

  // Wave Type (Dropdown) - 2 items Sin/Random if available
  addEffectIfMissing("Wave Type", "ADBE Dropdown Control", function (fx) {
    try {
      var dropdownProperty = fx.property(1);
      if (dropdownProperty && typeof dropdownProperty.setPropertyParameters === "function") {
        dropdownProperty.setPropertyParameters(["Sin", "Random"]);
      }
    } catch (e) {}
    try { fx.property(1).setValue(1); } catch (e) {}
  });

  // Wave Params
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
