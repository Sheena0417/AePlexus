// import 呼び出し先
import { connectPlexus } from "./connectPlexus.js";
import { connectOrigin } from "./connectOrigin.js";
import { connectTwoPoints } from "./connectTwoPoints.js";
import { loadIcon } from "./utils.js";

export function createUI() {
  var win = (this instanceof Panel)
    ? this
    : new Window("palette", "Plexus Connector", undefined, { resizeable: true });

  win.orientation = "column";
  win.alignChildren = ["center", "top"]; // 配列形式で明示的に指定
  win.margins = 10;

  // ラベル
  win.add("statictext", undefined, "Select Mode:");

  // 行グループ
  var row = win.add("group");
  row.orientation = "row";
  row.alignment = ["center", "top"]; // グループ自体の配置
  row.alignChildren = ["center", "center"]; // 子要素の配置
  row.spacing = 8;

  // アイコン読み込み（存在しなければ null になり、テキストボタンにフォールバック）
  var plexusImg = loadIcon("icon_plexus.png");
  var originImg = loadIcon("icon_origin.png");
  var twoPointsImg = loadIcon("icon_TwoPoints.png");

  var plexusBtn = plexusImg
    ? row.add("iconbutton", undefined, plexusImg, { style: "toolbutton" })
    : row.add("button", undefined, "Plexus Mode");

  var originBtn = originImg
    ? row.add("iconbutton", undefined, originImg, { style: "toolbutton" })
    : row.add("button", undefined, "Connect from Origin");

  var twoPointsBtn = twoPointsImg
    ? row.add("iconbutton", undefined, twoPointsImg, { style: "toolbutton" })
    : row.add("button", undefined, "Two Points");

  if (plexusImg) {
    plexusBtn.size = [28, 28];
    plexusBtn.helpTip = "Plexus Mode";
  }
  if (originImg) {
    originBtn.size = [28, 28];
    originBtn.helpTip = "Connect from Origin";
  }
  if (twoPointsImg) {
    twoPointsBtn.size = [28, 28];
    twoPointsBtn.helpTip = "Connect Two Points";
  }

  // ボタンのイベント
  plexusBtn.onClick = function () { connectPlexus(); };

  originBtn.onClick = function () {
    connectOrigin();
  };

  twoPointsBtn.onClick = function () {
    connectTwoPoints();
  };

  // レイアウトを確定
  win.layout.layout(true);
  
  // ウィンドウリサイズ時のレイアウト更新
  win.onResizing = win.onResize = function () {
    this.layout.resize();
  };

  win.center();
  win.show();
}
