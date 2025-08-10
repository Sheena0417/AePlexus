export function findIconFile(fileName) {
  try {
    var scriptFile = File($.fileName);
    var here = scriptFile.parent;

    var candidates = [];

    // 同階層にアイコンフォルダがある場合（例: Script.jsx と同じ階層に Plexus Linker_icon/）
    candidates.push(File(here.fsName + "/Plexus Linker_icon/" + fileName));
    // dist/ 下で実行し、1つ上にアイコンフォルダがある場合（例: dist/final.jsx → ../Plexus Linker_icon/）
    if (here.parent) {
      candidates.push(File(here.parent.fsName + "/Plexus Linker_icon/" + fileName));
    }
    // 念のため、同階層直下（フォルダなし）
    candidates.push(File(here.fsName + "/" + fileName));

    for (var i = 0; i < candidates.length; i++) {
      var f = candidates[i];
      if (f && f.exists) return f;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function loadIcon(fileName) {
  try {
    var f = findIconFile(fileName);
    if (f) {
      return ScriptUI.newImage(f);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

