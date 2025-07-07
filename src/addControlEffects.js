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
}
