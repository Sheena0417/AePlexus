// import 呼び出し先
import { connectPlexus } from "./connectPlexus.js";
import { connectOrigin } from "./connectOrigin.js";
import { loadIcon } from "./utils.js";

export function createUI() {
  var win = (this instanceof Panel)
    ? this
    : new Window("palette", "Plexus Connector", undefined, { resizeable: true });

  win.orientation = "column";
  win.alignChildren = "left";
  win.margins = 10;

  // ラベル
  win.add("statictext", undefined, "モードを選択：");

  // 行グループ
  var row = win.add("group");
  row.orientation = "row";
  row.spacing = 8;

  // アイコン読み込み（存在しなければ null になり、テキストボタンにフォールバック）
  var plexusImg = loadIcon("icon_plexus.png");
  var originImg = loadIcon("icon_origin.png");

  var plexusBtn = plexusImg
    ? row.add("iconbutton", undefined, plexusImg, { style: "toolbutton" })
    : row.add("button", undefined, "Plexus Mode");

  var originBtn = originImg
    ? row.add("iconbutton", undefined, originImg, { style: "toolbutton" })
    : row.add("button", undefined, "Connect from Origin");

  if (plexusImg) {
    plexusBtn.size = [28, 28];
    plexusBtn.helpTip = "Plexus Mode";
  }
  if (originImg) {
    originBtn.size = [28, 28];
    originBtn.helpTip = "Connect from Origin";
  }

  // ボタンのイベント
  plexusBtn.onClick = function () { connectPlexus(); };

  originBtn.onClick = function () {
    connectOrigin();
  };

  win.center();
  win.show();
}
