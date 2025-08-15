import { getOrCreateControlLayer } from "./createControlLayer.js";
import { addControlEffects } from "./addControlEffects.js";

// ユーティリティ関数を追加
function finalizeRename(ctrl){
  var parade = ctrl && ctrl.property("ADBE Effect Parade");
  if (!parade) return;
  // 最初に見つかった Dropdown だけ "Wave Type" に改名
  for (var i = parade.numProperties; i >= 1; i--) {
    var fx = parade.property(i);
    if (fx && fx.matchName === "ADBE Dropdown Control") {
      var menu = fx.property(1);
      try { fx.name = "Wave Type"; } catch(e){}
      try { if (menu && menu.propertyGroup) menu.propertyGroup(1).name = "Wave Type"; } catch(e){}
      break;
    }
  }
}

function finalizeRenameNextTick(ctrlName){
  try {
    app.scheduleTask(
      "var c=app.project.activeItem&&app.project.activeItem.layer('"+escName(ctrlName)+"');"+
      "if(c){("+finalizeRename.toString()+")(c);}",
      10, false
    );
  } catch(e){}
}

function escName(n) { return n.replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }

function ensureWaveTypeDropdown(controlLayer) {
  var parade = controlLayer && controlLayer.property("ADBE Effect Parade");
  var result = { index: 1, renamed: false };
  if (!parade) return result;

  // 既存 "Wave Type" を最優先
  var dd = null;
  try { dd = parade.property("Wave Type"); } catch (_) {}

  // 既存 Dropdown を流用（名前に依存しない）
  if (!dd) {
    for (var i = 1; i <= parade.numProperties; i++) {
      var fx = parade.property(i);
      if (fx && fx.matchName === "ADBE Dropdown Control") { dd = fx; break; }
    }
  }

  // 無ければ作成（※ここでは項目は触らない）
  if (!dd) {
    try { dd = parade.addProperty("ADBE Dropdown Control"); } catch (_) {}
  }
  if (!dd) return result;

  // 改名だけを多段で試みる（項目は触らない）
  var menu = dd.property(1);
  var renamed = false;
  try { dd.name = "Wave Type"; renamed = (dd.name === "Wave Type"); } catch (_) {}
  if (!renamed) {
    try { if (menu && menu.propertyGroup) menu.propertyGroup(1).name = "Wave Type"; } catch (_) {}
    try { renamed = (dd.name === "Wave Type"); } catch (_) {}
  }
  if (!renamed) {
    try {
      var tail = parade.property(parade.numProperties);
      if (tail) { tail.name = "Wave Type"; renamed = (tail.name === "Wave Type"); }
    } catch (_) {}
  }
  if (!renamed) {
    // 最終手段：複製→元削除→改名（項目は触らない）
    try {
      var dup = dd.duplicate();
      dd.remove();
      dd = dup;
      menu = dd.property(1);
      try { dd.name = "Wave Type"; } catch (_) {}
      try { if (menu && menu.propertyGroup) menu.propertyGroup(1).name = "Wave Type"; } catch (_) {}
      renamed = (dd.name === "Wave Type");
    } catch (_) {}
  }

  // index を返す
  try { result.index = dd.propertyIndex || 1; } catch (_) { result.index = 1; }
  result.renamed = renamed;
  return result;
}


function buildWaveExpression(layerAName, layerBName, controlLayerName, lineId, waveFxIndex) {
  return (
"try {\n"+
"var A = thisComp.layer('"+escName(layerAName)+"');\n"+
"var B = thisComp.layer('"+escName(layerBName)+"');\n"+
"var ctl = thisComp.layer('"+escName(controlLayerName)+"');\n"+
"var WAVE_FX_INDEX = "+(waveFxIndex||1)+";\n"+

// --- 安全取得 ---
"function getSlider(L,n,d){try{return L.effect(n)('Slider').value;}catch(e){return d;}}\n"+
"function getCheckbox(L,n,d){try{return L.effect(n)('Checkbox').value;}catch(e){return d;}}\n"+
"function getAngle(L,n,d){try{return L.effect(n)('Angle').value;}catch(e){return d;}}\n"+
"function getDropdownByName(L,n){try{return L.effect(n)(1).value;}catch(e){return null;}}\n"+
"function getDropdownByIndex(L,i){try{return L.effect(i)(1).value;}catch(e){return null;}}\n"+
"function getFirstDropdownAny(L){\n"+
"  // 名前やインデックスが揺れても、最初の Dropdown の値を拾う\n"+
"  var v=null; try{ v = getDropdownByName(L,'Wave Type'); }catch(e){}\n"+
"  if (v===null) { try{ v = getDropdownByIndex(L, WAVE_FX_INDEX); }catch(e){} }\n"+
"  if (v===null) {\n"+
"    try { var parade=L.effect; var n=parade.numProperties; for (var ii=1; ii<=n; ii++){ var e=parade(ii); if (e && e.matchName==='ADBE Dropdown Control') { try { v = e(1).value; break; } catch(_){ } } } } catch(_){ }\n"+
"  }\n"+
"  if (v===null) v=1; return Math.round(v);\n"+
"}\n"+

"var threshold=getSlider(ctl,'Threshold',300);\n"+
"var enableWave=getCheckbox(ctl,'Enable Wave',0);\n"+
"var p1=thisLayer.fromComp(A.toComp(A.anchorPoint));\n"+
"var p2=thisLayer.fromComp(B.toComp(B.anchorPoint));\n"+
"var d=length(p1,p2);\n"+

"if(d<=threshold){\n"+
" if(enableWave==1){\n"+
"  // 名前・index に依存せず最初の Dropdown を読む\n"+
"  var waveType = getFirstDropdownAny(ctl); // 1=sin, 2=random\n"+

"  var waveAmp=getSlider(ctl,'Wave Amplitude',25)*2;\n"+
"  var waveFreq=getSlider(ctl,'Wave Frequency',50)/25;\n"+
"  var waveSpeed=getSlider(ctl,'Wave Speed',25)/25;\n"+
"  var waveDir=getAngle(ctl,'Wave Direction',0)*Math.PI/180;\n"+
"  var numDiv=Math.max(0,Math.min(100,Math.round(getSlider(ctl,'Wave Divisions',20))));\n"+
"  var phaseSmooth=0.6;\n"+
"  var randomSeed=getSlider(ctl,'Random Seed',1);\n"+
"  var intensity=getSlider(ctl,'Intensity',50)/100;\n"+
"  var smoothOn=getCheckbox(ctl,'Smooth Curves',1);\n"+

"  var pts=[],inT=[],outT=[]; var t=time*waveSpeed; var dir=normalize(p2-p1);\n"+
"  var basePerp=[-dir[1],dir[0]]; var perp=[basePerp[0]*Math.cos(waveDir)-basePerp[1]*Math.sin(waveDir), basePerp[0]*Math.sin(waveDir)+basePerp[1]*Math.cos(waveDir)];\n"+
"  var segLength=d/numDiv; var lineId="+lineId+";\n"+

"  function smoothStep(u){return u*u*u*(u*(u*6-15)+10);} \n"+
"  function hash(i,o){var h=Math.sin(i*12.9898+o*78.233+randomSeed*54.321)*43758.5453; return (h-Math.floor(h))*2-1;} \n"+
"  function noise1D(x,oct){var x0=Math.floor(x),x1=x0+1; var f=x-x0; var v0=hash(x0+lineId*17,oct),v1=hash(x1+lineId*17,oct); var u=smoothStep(f); return v0*(1-u)+v1*u;} \n"+
"  function fbm(x,oct,p){var sum=0,amp=1,n=0,f=1; for(var o=0;o<oct;o++){sum+=noise1D(x*f,o)*amp; n+=amp; amp*=p; f*=2;} return sum/Math.max(1e-6,n);} \n"+

"  for(var k=0;k<=numDiv;k++){\n"+
"    var ratio=k/numDiv; var base=p1+(p2-p1)*ratio; var env=Math.sin(ratio*Math.PI); env=Math.pow(env,2-intensity*1.5);\n"+
"    var offset=0;\n"+
"    if(k!==0 && k!==numDiv){\n"+
"      if(waveType==1){ var ph=(t+ratio*waveFreq+lineId*0.1)*Math.PI*2+phaseSmooth*Math.PI*2; offset=Math.sin(ph)*waveAmp*env; }\n"+
"      else { var oct=Math.floor(1+intensity*4); var pers=0.5+phaseSmooth*0.3; var fq=waveFreq*0.5; var s=(ratio+t*waveSpeed)*fq+lineId; offset=fbm(s,oct,pers)*waveAmp*env; }\n"+
"    }\n"+
"    var pt=base+perp*offset; pts.push(pt);\n"+
"    if(k===0||k===numDiv){ inT.push([0,0]); outT.push([0,0]); }\n"+
"    else { var hl=segLength*0.33; var baseH=dir*hl; var handle;\n"+
"      if(waveType==1){ var dr=1/numDiv; var r0=Math.max(0,ratio-dr), r1=Math.min(1,ratio+dr); function sinVal(r){var p=(t+r*waveFreq+lineId*0.1)*Math.PI*2+phaseSmooth*Math.PI*2; var e=Math.sin(r*Math.PI); return Math.sin(p)*waveAmp*e;} var y0=sinVal(r0), y1=sinVal(r1); var dx=(r1-r0)*d; var slope=(y1-y0)/Math.max(1e-6,dx); var bend=perp*(slope*hl); handle=(baseH+bend)*(0.5+phaseSmooth*0.5); }\n"+
"      else { handle=baseH*0.3; }\n"+
"      handle*=(smoothOn?1:0.6); inT.push(handle*-1); outT.push(handle); }\n"+
"  }\n"+
"  createPath(pts,inT,outT,false);\n"+
" } else { createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false); }\n"+
"} else { createPath([p1],[[0,0]],[[0,0]],false); }\n"+
"} catch(e){ var A=thisComp.layer('"+escName(layerAName)+"'); var B=thisComp.layer('"+escName(layerBName)+"'); var p1=thisLayer.fromComp(A.toComp(A.anchorPoint)); var p2=thisLayer.fromComp(B.toComp(B.anchorPoint)); createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false); }\n"
  );
}

export function connectPlexus() {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) return;

  var selectedLayers = comp.selectedLayers;
  if (!selectedLayers || selectedLayers.length < 2) {
    alert("Select at least 2 layers.");
    return;
  }

  app.beginUndoGroup("Connect Plexus with Wave");

  var controlLayer = getOrCreateControlLayer(comp, "Control_Plexus");
  addControlEffects(controlLayer);

  // ▼ ドロップダウンの項目＆改名を最大限試み、index を取得
  var waved = ensureWaveTypeDropdown(controlLayer);
  var waveFxIndex = waved && waved.index ? waved.index : 1;

  // テンプレ生成
  var template = comp.layers.addShape();
  template.name = "PlexusTemplate";
  var contents = template.property("ADBE Root Vectors Group");
  var shapeGroup = contents.addProperty("ADBE Vector Group");
  shapeGroup.name = "Shape 1";
  var groupContents = shapeGroup.property("ADBE Vectors Group");
  var pathGroup = groupContents.addProperty("ADBE Vector Shape - Group");
  pathGroup.name = "Path 1";
  var path = pathGroup.property("ADBE Vector Shape");

  // dummy path so expression attaches
  var dummy = new Shape();
  dummy.vertices = [[0, 0], [100, 0]];
  dummy.inTangents = [[0, 0], [0, 0]];
  dummy.outTangents = [[0, 0], [0, 0]];
  dummy.closed = false;
  path.setValue(dummy);

  var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
  stroke.property("ADBE Vector Stroke Width").setValue(2);
  stroke.property("ADBE Vector Stroke Color").setValue([1, 1, 1]);

  for (var i = 0; i < selectedLayers.length - 1; i++) {
    for (var j = i + 1; j < selectedLayers.length; j++) {
      var A = selectedLayers[i];
      var B = selectedLayers[j];
      var line = template.duplicate();
      line.name = "Line: " + A.name + " ↔ " + B.name;

      var lineId = i * 1000 + j;
      var expr = buildWaveExpression(A.name, B.name, controlLayer.name, lineId, waveFxIndex);
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("Path 1")("ADBE Vector Shape").expression = expr;

      // Stroke width/color bind
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")
        ("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Width").expression =
        "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Width')(1)";
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")
        ("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Color").expression =
        "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Color')('Color')";
    }
  }

  template.remove();
  // ここで"今フレーム & 次ティック"で確定リネーム
  finalizeRename(controlLayer);
  finalizeRenameNextTick(controlLayer.name);

  app.endUndoGroup();

}
