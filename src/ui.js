// import 呼び出し先
import { connectPlexus } from "./connectPlexus.js";
import { connectOrigin } from "./connectOrigin.js";

export function createUI() {
  var win = (this instanceof Panel)
    ? this
    : new Window("palette", "Plexus Connector", undefined, { resizeable: true });

  win.alignChildren = "fill";

  // ラベル
  win.add("statictext", undefined, "モードを選択：");

  // プレクサスモードボタン
  var plexusBtn = win.add("button", undefined, "Plexus Mode");

  // 原点接続モードボタン
  var originBtn = win.add("button", undefined, "Connect from Origin");

  // ボタンのイベント
  plexusBtn.onClick = function () {
    connectPlexus();
  };

  originBtn.onClick = function () {
    connectOrigin();
  };

  win.center();
  win.show();
}
