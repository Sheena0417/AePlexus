// Create an Adjustment Layer, add Dropdown, set items, and try HARD to rename it to "Wave Type"
(function () {
  app.beginUndoGroup("Create CTRL with Dropdown named Wave Type");

  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) {
    alert("Please activate a composition.");
    app.endUndoGroup();
    return;
  }

  // === 1) 調整レイヤー作成（既存が良ければ検索して流用でもOK） ===
  var ctrl = comp.layers.addSolid([0,0,0], "Wave CTRL", comp.width, comp.height, comp.pixelAspect, comp.duration);
  ctrl.adjustmentLayer = true;
  ctrl.moveToBeginning();

  var parade = ctrl.property("ADBE Effect Parade");
  if (!parade) { app.endUndoGroup(); return; }

  // すでに "Wave Type" があるなら何もしないで終了（重複回避）
  for (var i = 1; i <= parade.numProperties; i++) {
    var fx = parade.property(i);
    if (fx && fx.name === "Wave Type") {
      app.endUndoGroup();
      return;
    }
  }

  // === 2) 追加 → 項目設定 ===
  var dd = parade.addProperty("ADBE Dropdown Control"); // 親エフェクト
  var menu = dd && dd.property(1); // "Menu" 子
  if (menu && menu.setPropertyParameters) {
    try { menu.setPropertyParameters(["sin","random"]); } catch(e) {}
    try { menu.setValue(1); } catch(e) {}
  }

  // === 3) 改名（親へ直付け） ===
  var renamed = false;
  try { dd.name = "Wave Type"; renamed = (dd.name === "Wave Type"); } catch (e) {}

  // === 4) 子から親へ辿って改名（locale回避） ===
  if (!renamed) {
    try {
      menu.propertyGroup(1).name = "Wave Type";
      renamed = (dd.name === "Wave Type" || menu.propertyGroup(1).name === "Wave Type");
    } catch (e) {}
  }

  // === 5) 末尾再取得で改名（追加直後の親参照が不安定な環境向け） ===
  if (!renamed) {
    try {
      var tail = parade.property(parade.numProperties);
      if (tail) {
        tail.name = "Wave Type";
        renamed = (tail.name === "Wave Type");
      }
    } catch (e) {}
  }

  // === 6) 最終手段：複製→元削除→改名（これで通る環境報告あり） ===
  if (!renamed) {
    try {
      var dup = dd.duplicate();
      dd.remove(); // 元を消す
      dd = dup;
      menu = dd.property(1);
      // 再改名トライ（両方）
      try { dd.name = "Wave Type"; } catch (e) {}
      try { if (menu && menu.propertyGroup) menu.propertyGroup(1).name = "Wave Type"; } catch (e) {}
      renamed = (dd.name === "Wave Type");
    } catch (e) {}
  }

  // デバッグ用：結果をコメントに残す（レイヤーコメント）
  try {
    ctrl.comment = "Dropdown renamed: " + (renamed ? "YES" : "NO") +
                   " | Final name: " + (dd ? dd.name : "N/A");
  } catch (e) {}

  app.endUndoGroup();
})();
