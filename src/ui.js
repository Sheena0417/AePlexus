// src/ui.js
export function createUI() {
  var win = (this instanceof Panel) ? this : new Window("palette", "Ae Plexus Tool", undefined, { resizeable: true });
  win.add("statictext", undefined, "Hello, AE Script!");
  win.center();
  win.show();
}
