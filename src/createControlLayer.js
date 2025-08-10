export function getOrCreateControlLayer(comp, name) {
  var controlName = name || "Control Layer";
  var controlLayer = comp.layer(controlName);

  if (!controlLayer) {
    controlLayer = comp.layers.addSolid(
      [0, 0, 0],
      controlName,
      comp.width,
      comp.height,
      comp.pixelAspect,
      comp.duration
    );
    controlLayer.adjustmentLayer = true;
    controlLayer.moveToBeginning();
    controlLayer.enabled = false;
    controlLayer.label = 11; // セットアップ用: ラベル色
  }

  return controlLayer;
}
