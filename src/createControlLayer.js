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
    // 有効のままにして、描画には影響しないようにガイドレイヤー化
    controlLayer.enabled = true;
    try { controlLayer.guideLayer = true; } catch (e) {}
    controlLayer.label = 11; // セットアップ用: ラベル色
  } else {
    // 既存レイヤーも安全側へ
    try { controlLayer.enabled = true; } catch (e) {}
    try { controlLayer.guideLayer = true; } catch (e) {}
  }

  return controlLayer;
}
