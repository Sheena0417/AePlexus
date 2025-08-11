import { getOrCreateControlLayer } from "./createControlLayer.js";
import { addControlEffects } from "./addControlEffects.js";

function escName(n) { return n.replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }

// ▼ 追加：コントロールレイヤーに Wave Type を強制整備
function ensureWaveTypeDropdown(controlLayer) {
  var parade = controlLayer.property("ADBE Effect Parade");
  if (!parade) return;

  // 1) 既に "Wave Type" があればそれを使う
  var dd = parade.property("Wave Type");

  // 2) なければ matchName でドロップダウンを探す
  if (!dd) {
    for (var i = 1; i <= parade.numProperties; i++) {
      var fx = parade.property(i);
      if (fx && fx.matchName === "ADBE Dropdown Control") {
        dd = fx;
        break;
      }
    }
  }

  // 3) それでも無ければ新規作成
  if (!dd) {
    dd = parade.addProperty("ADBE Dropdown Control");
  }

  // 4) 項目を設定（戻りは Menu 子プロパティ）
  //    setPropertyParameters は Dropdown の子(=property(1))に対して行う
  var menu = dd.property(1);
  if (menu && menu.setPropertyParameters) {
    menu.setPropertyParameters(["sin", "random"]);
  }

  // 5) 親エフェクト名を "Wave Type" に強制（ロケールに依存しない）
  //    一部環境で dd.name = ... が効かないケースに備えて、親を辿って改名
  try {
    dd.name = "Wave Type";
  } catch (e) {}
  try {
    if (menu && menu.propertyGroup) {
      menu.propertyGroup(1).name = "Wave Type";
    }
  } catch (e) {}
}

function buildWaveExpression(layerAName, layerBName, controlLayerName, lineId) {
  return (
"try {\n"+
"var A = thisComp.layer('"+escName(layerAName)+"');\n"+
"var B = thisComp.layer('"+escName(layerBName)+"');\n"+
"var ctl = thisComp.layer('"+escName(controlLayerName)+"');\n"+

// --- 安全取得ユーティリティ（ロケール非依存） ---
"function getSlider(layer, name, def){ try{ return layer.effect(name)('Slider').value; }catch(e){ return def; } }\n"+
"function getCheckbox(layer, name, def){ try{ return layer.effect(name)('Checkbox').value; }catch(e){ return def; } }\n"+
"function getAngle(layer, name, def){ try{ return layer.effect(name)('Angle').value; }catch(e){ return def; } }\n"+
"function getDropdown(layer, name, def){ try{ return layer.effect(name)(1).value; }catch(e){ return def; } }\n"+

"var threshold   = getSlider(ctl,'Threshold',300);\n"+
"var enableWave  = getCheckbox(ctl,'Enable Wave',0);\n"+
"var p1 = thisLayer.fromComp(A.toComp(A.anchorPoint));\n"+
"var p2 = thisLayer.fromComp(B.toComp(B.anchorPoint));\n"+
"var d  = length(p1,p2);\n"+

"if (d <= threshold) {\n"+
"  if (enableWave==1) {\n"+
"    var waveType   = Math.round(getDropdown(ctl,'Wave Type',1)); // 1=sin, 2=random\n"+
"    var waveAmp    = getSlider(ctl,'Wave Amplitude',25)*2;\n"+
"    var waveFreq   = getSlider(ctl,'Wave Frequency',50)/25;\n"+
"    var waveSpeed  = getSlider(ctl,'Wave Speed',25)/25;\n"+
"    var waveDir    = getAngle(ctl,'Wave Direction',0)*Math.PI/180;\n"+
"    var numDiv     = Math.max(3, Math.min(20, Math.round(getSlider(ctl,'Wave Divisions',20))));\n"+
"    var phaseSmooth= 0.6;\n"+
"    var randomSeed = getSlider(ctl,'Random Seed',1);\n"+
"    var intensity  = getSlider(ctl,'Intensity',50)/100;\n"+
"    var smoothOn   = getCheckbox(ctl,'Smooth Curves',1);\n"+

"    var pts=[], inT=[], outT=[]; var t=time*waveSpeed; var dir=normalize(p2-p1);\n"+
"    var basePerp=[-dir[1],dir[0]]; var perp=[basePerp[0]*Math.cos(waveDir)-basePerp[1]*Math.sin(waveDir), basePerp[0]*Math.sin(waveDir)+basePerp[1]*Math.cos(waveDir)];\n"+
"    var segLength=d/numDiv; var lineId="+lineId+";\n"+

// --- ノイズユーティリティ ---
"    function smoothStep(u){ return u*u*u*(u*(u*6-15)+10); }\n"+
"    function hash(i,o){ var h=Math.sin(i*12.9898+o*78.233+randomSeed*54.321)*43758.5453; return (h-Math.floor(h))*2-1; }\n"+
"    function noise1D(x,oct){ var x0=Math.floor(x), x1=x0+1; var f=x-x0; var v0=hash(x0+lineId*17,oct), v1=hash(x1+lineId*17,oct); var u=smoothStep(f); return v0*(1-u)+v1*u; }\n"+
"    function fbm(x,oct,persist){ var sum=0,amp=1,n=0,freq=1; for (var o=0;o<oct;o++){ sum+=noise1D(x*freq,o)*amp; n+=amp; amp*=persist; freq*=2; } return sum/Math.max(1e-6,n); }\n"+

"    for (var k=0;k<=numDiv;k++){\n"+
"      var ratio=k/numDiv; var base=p1+(p2-p1)*ratio; var envelope=Math.sin(ratio*Math.PI); envelope=Math.pow(envelope, 2 - intensity*1.5);\n"+
"      var offset=0;\n"+
"      if (k!==0 && k!==numDiv){\n"+
"        if (waveType==1){\n"+
// --- sin 波（本体） ---
"          var phase=(t+ratio*waveFreq+lineId*0.1)*Math.PI*2 + phaseSmooth*Math.PI*2;\n"+
"          offset = Math.sin(phase) * waveAmp * envelope;\n"+
"        } else {\n"+
// --- Perlin風 fBm 波 ---
"          var oct = Math.floor(1 + intensity*4);\n"+
"          var persist = 0.5 + phaseSmooth*0.3;\n"+
"          var freq = waveFreq*0.5;\n"+
"          var sample=(ratio + t*waveSpeed)*freq + lineId;\n"+
"          offset = fbm(sample, oct, persist) * waveAmp * envelope;\n"+
"        }\n"+
"      }\n"+

"      var pt=base+perp*offset; pts.push(pt);\n"+

"      if (k===0 || k===numDiv){ inT.push([0,0]); outT.push([0,0]); }\n"+
"      else {\n"+
"        var hl=segLength*0.33; var baseH=dir*hl; var handle;\n"+
"        if (waveType==1){\n"+
// --- sin の傾き：数値微分（エンベロープ込み） ---
"          var dr=1/numDiv; var r0=Math.max(0, ratio-dr), r1=Math.min(1, ratio+dr);\n"+
"          function sinVal(r){ var ph=(t+r*waveFreq+lineId*0.1)*Math.PI*2 + phaseSmooth*Math.PI*2; var env=Math.sin(r*Math.PI); return Math.sin(ph)*waveAmp*env; }\n"+
"          var y0=sinVal(r0), y1=sinVal(r1); var dx=(r1-r0)*d; var slope=(y1-y0)/Math.max(1e-6,dx);\n"+
"          var bend=perp*(slope*hl); handle=(baseH + bend) * (0.5 + phaseSmooth*0.5);\n"+
"        } else {\n"+
"          handle = baseH * 0.3;\n"+
"        }\n"+
"        handle *= (smoothOn?1:0.6);\n"+
"        inT.push(handle * -1); outT.push(handle);\n"+
"      }\n"+
"    }\n"+
"    createPath(pts,inT,outT,false);\n"+
"  } else {\n"+
"    createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false);\n"+
"  }\n"+
"} else {\n"+
"  createPath([p1],[[0,0]],[[0,0]],false);\n"+
"}\n"+
"} catch(e){\n"+
"  var A=thisComp.layer('"+escName(layerAName)+"'); var B=thisComp.layer('"+escName(layerBName)+"');\n"+
"  var p1=thisLayer.fromComp(A.toComp(A.anchorPoint)); var p2=thisLayer.fromComp(B.toComp(B.anchorPoint));\n"+
"  createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false);\n"+
"}"
  );
}

export function connectPlexus() {
  var comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) return;

  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length < 2) {
    alert("Select at least 2 layers.");
    return;
  }

  app.beginUndoGroup("Connect Plexus with Wave");

  var controlLayer = getOrCreateControlLayer(comp, "Control_Plexus");
  addControlEffects(controlLayer);

  // ▼ 追加：ドロップダウンの項目と名称を強制整備（ここが肝）
  ensureWaveTypeDropdown(controlLayer);

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
  stroke.property("Stroke Width").setValue(2);
  stroke.property("Color").setValue([1, 1, 1]);

  for (var i = 0; i < selectedLayers.length - 1; i++) {
    for (var j = i + 1; j < selectedLayers.length; j++) {
      var A = selectedLayers[i];
      var B = selectedLayers[j];
      var line = template.duplicate();
      line.name = "Line: " + A.name + " ↔ " + B.name;

      var lineId = i * 1000 + j;
      var expr = buildWaveExpression(A.name, B.name, controlLayer.name, lineId);
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("Path 1")("ADBE Vector Shape").expression = expr;

      // Stroke width/color bind to control layer
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Width").expression =
        "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Width')(1)";
      line.property("ADBE Root Vectors Group")("Shape 1")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Color").expression =
        "thisComp.layer('" + escName(controlLayer.name) + "').effect('Line Color')('Color')";
    }
  }

  template.remove();
  app.endUndoGroup();
}
