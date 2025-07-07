export function getOrCreateControlLayer(comp) {
  var controlName = "Control Layer";
  var controlLayer = comp.layer(controlName);

  if (!controlLayer) {
    controlLayer = comp.layers.addSolid([0, 0, 0], controlName, comp.width, comp.height, comp.pixelAspect, comp.duration);
    controlLayer.adjustmentLayer = true;
    controlLayer.moveToBeginning();
  }

  return controlLayer;
}
