import { getOrCreateControlLayer } from "./createControlLayer.js";
import { addControlEffects } from "./addControlEffects.js";

function escName(n) { return n.replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }

function buildWaveExpression(layerAName, layerBName, controlLayerName, lineId) {
  return (
    "try {\n" +
    "var A = thisComp.layer('" + escName(layerAName) + "');\n" +
    "var B = thisComp.layer('" + escName(layerBName) + "');\n" +
    "var ctl = thisComp.layer('" + escName(controlLayerName) + "');\n" +
    "function safeGetEffect(layer, effectName, propertyName, def) {\n" +
    "  try { var effect = layer.effect(effectName); if (effect) {\n" +
    "    var prop; if (propertyName==='Checkbox') prop=effect('Checkbox');\n" +
    "    else if (propertyName==='Angle') prop=effect('Angle');\n" +
    "    else if (propertyName==='Color') prop=effect('Color');\n" +
    "    else if (propertyName==='Popup' || propertyName==='Menu') {\n" +
    "      try { return effect(1).value; } catch(e1) { try { return effect.property(1).value; } catch(e2) { try { return effect.property('Menu').value; } catch(e3) { try { return effect.property('Popup').value; } catch(e4) {} } } }\n" +
    "    } else prop=effect('Slider');\n" +
    "    if (prop && prop.value!==undefined) return prop.value;\n" +
    "  }} catch(e) {} return def;}\n" +
    "var threshold = safeGetEffect(ctl,'Threshold','Slider',300);\n" +
    "var enableWave = safeGetEffect(ctl,'Enable Wave','Checkbox',0);\n" +
    "var p1 = thisLayer.fromComp(A.toComp(A.anchorPoint));\n" +
    "var p2 = thisLayer.fromComp(B.toComp(B.anchorPoint));\n" +
    "var d = length(p1,p2);\n" +
    "if (d <= threshold) {\n" +
    "  if (enableWave==1) {\n" +
    "    var waveType=1; try { waveType = ctl.effect('Wave Type').property(1).value; } catch(e) {}\n" +
    "    var waveAmp = safeGetEffect(ctl,'Wave Amplitude','Slider',25)*2;\n" +
    "    var waveFreq = safeGetEffect(ctl,'Wave Frequency','Slider',50)/25;\n" +
    "    var waveSpeed = safeGetEffect(ctl,'Wave Speed','Slider',25)/25;\n" +
    "    var waveDir = safeGetEffect(ctl,'Wave Direction','Angle',0)*Math.PI/180;\n" +
    "    var numDiv = Math.max(3, Math.min(20, Math.round(safeGetEffect(ctl,'Wave Divisions','Slider',20))));\n" +
    "    var phaseSmooth = 0.6;\n" +
    "    var randomSeed = safeGetEffect(ctl,'Random Seed','Slider',1);\n" +
    "    var intensity = safeGetEffect(ctl,'Intensity','Slider',50)/100;\n" +
    "    var pts=[], inT=[], outT=[]; var t=time*waveSpeed; var dir=normalize(p2-p1);\n" +
    "    var basePerp=[-dir[1],dir[0]]; var perp=[basePerp[0]*Math.cos(waveDir)-basePerp[1]*Math.sin(waveDir), basePerp[0]*Math.sin(waveDir)+basePerp[1]*Math.cos(waveDir)];\n" +
    "    var segLength=d/numDiv; var lineId=" + lineId + ";\n" +
    "    for (var k=0;k<=numDiv;k++){ var ratio=k/numDiv; var base=p1+(p2-p1)*ratio; var offset=0; var envelope=Math.sin(ratio*Math.PI); envelope=Math.pow(envelope, 2 - intensity*1.5); if (k!==0&&k!==numDiv){ var phase=(t+ratio*waveFreq+lineId*0.1)*Math.PI*2; var wave=0; if (waveType==1){ var phaseOffset=phaseSmooth*Math.PI*2; wave=Math.sin(phase+phaseOffset);} else { var noise=0, amplitude=1, maxV=0, freq=waveFreq*0.5; var oct=Math.floor(1+intensity*4); var persist=0.5+phaseSmooth*0.3; for (var o=0;o<oct;o++){ var sample=(ratio+t*waveSpeed)*freq+randomSeed*100+lineId; var x0=Math.floor(sample), x1=x0+1; var frac=sample-x0; var ease=frac*frac*frac*(frac*(frac*6-15)+10); var h0=Math.sin(x0*12.9898+o*78.233+randomSeed*54.321)*43758.5453; var h1=Math.sin(x1*12.9898+o*78.233+randomSeed*54.321)*43758.5453; var v0=(h0-Math.floor(h0))*2-1; var v1=(h1-Math.floor(h1))*2-1; var val=v0*(1-ease)+v1*ease; noise+=val*amplitude; maxV+=amplitude; amplitude*=persist; freq*=2;} wave=noise/maxV; } offset=wave*waveAmp*envelope;} var pt=base+perp*offset; pts.push(pt); if (k===0||k===numDiv){ inT.push([0,0]); outT.push([0,0]); } else { var hl=segLength*0.33; var smooth = (ctl.effect('Smooth Curves') ? safeGetEffect(ctl,'Smooth Curves','Checkbox',1) : 1); var baseH = dir*hl; if (waveType==1){ var deriv=Math.cos(phase+phaseSmooth*Math.PI*2)*waveFreq*waveAmp*envelope; var bend = perp * (deriv * hl / segLength); var handle = (baseH + bend) * (0.5 + phaseSmooth*0.5) * (smooth?1:0.6); inT.push(handle * -1); outT.push(handle); } else { var handle = baseH * 0.3; inT.push(handle * -1); outT.push(handle); } } } createPath(pts,inT,outT,false); } else { createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false);} } else { createPath([p1],[[0,0]],[[0,0]],false);} } catch(e){ var A=thisComp.layer('" + escName(layerAName) + "'); var B=thisComp.layer('" + escName(layerBName) + "'); var p1=thisLayer.fromComp(A.toComp(A.anchorPoint)); var p2=thisLayer.fromComp(B.toComp(B.anchorPoint)); createPath([p1,p2],[[0,0],[0,0]],[[0,0],[0,0]],false);}"
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
