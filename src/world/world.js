import * as THREE from 'three';
import { selectSlots, stepPosition } from './navigation.js';
import { vertex, portalFragment, floorFragment } from './shaders.js';

export function createWorld(host, initial) {
  let props=initial, disposed=false, lost=false, frame=0, last=0, yaw=0, pitch=0, drag=null, target=null, sequence, pulse, intentionalUnlock=false, movementBlocked=false;
  const keys=new Set(), stations=new Map(), resources=new Set(), listeners=[];
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#050912'); scene.fog=new THREE.Fog('#050912',20,65);
  const camera=new THREE.PerspectiveCamera(65,1,.1,90); camera.rotation.order='YXZ';
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)); renderer.outputColorSpace=THREE.SRGBColorSpace;
  const canvas=renderer.domElement; canvas.dataset.world='courtyard'; canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none'; host.append(canvas);
  const own=o=>(resources.add(o),o);
  const box=own(new THREE.BoxGeometry(1,1,1)), cylinder=own(new THREE.CylinderGeometry(1,1,1,12)), plane=own(new THREE.PlaneGeometry(1,1));
  const dark=own(new THREE.MeshStandardMaterial({color:'#111e2e',metalness:.75,roughness:.4}));
  const trim=own(new THREE.MeshBasicMaterial({color:'#42dfef'}));
  const violet=own(new THREE.MeshBasicMaterial({color:'#ad72ff'}));
  const shader=fragment=>own(new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{time:{value:0}}}));
  const floorMat=shader(floorFragment), portalMat=shader(portalFragment);
  function mesh(geometry,material,position,scale,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.scale.set(...scale);parent.add(m);return m;}
  scene.add(new THREE.HemisphereLight('#a6dfff','#09101e',2)); const light=new THREE.PointLight('#9176ff',80,35);light.position.set(0,6,-20);scene.add(light);
  const floor=mesh(plane,floorMat,[0,0,-9],[20,46,1]);floor.rotation.x=-Math.PI/2;
  mesh(box,dark,[0,-.35,-9],[20,.7,46]);
  const architectureObstacles=[];
  for(const x of [-8,8]){
    mesh(box,dark,[x,5,-9],[.65,.6,43]);mesh(box,trim,[x,4.65,-9],[.08,.08,43]);
    for(let z=10;z>=-30;z-=5){mesh(box,dark,[x,2.4,z],[.65,4.8,.65]);mesh(box,trim,[x-.34*Math.sign(x),2.5,z],[.04,4,.12]);architectureObstacles.push({x,z,radius:.48});}
    mesh(box,dark,[x*1.22,.6,-9],[.45,1.2,46]);
  }
  mesh(box,dark,[0,1,-32],[20,2,.5]);mesh(box,dark,[0,.6,14],[20,1.2,.5]);
  mesh(box,dark,[0,4.2,-29],[8.2,8.4,.7]);
  mesh(plane,portalMat,[0,4.2,-28.6],[6.6,6.6,1]);
  for(const x of [-3.8,3.8])mesh(box,violet,[x,4.2,-28.4],[.1,7.5,.12]);
  mesh(box,violet,[0,7.95,-28.4],[7.7,.1,.12]);
  for(let z=8;z>-28;z-=3)mesh(box,trim,[0,.014,z],[.035,.015,1.2]);

  function titleTexture(text,completed,create=false){
    const c=document.createElement('canvas');c.width=768;c.height=384;const ctx=c.getContext('2d');
    ctx.fillStyle='#091b29';ctx.fillRect(0,0,768,384);ctx.strokeStyle=completed?'#9fe3ad':create?'#b399ff':'#59e9f3';ctx.lineWidth=6;ctx.strokeRect(4,4,760,376);
    ctx.fillStyle=ctx.strokeStyle;ctx.font='22px monospace';ctx.fillText(create?'FOCUS / TERMINAL':completed?'ABGESCHLOSSEN':'AKTIVE AUFGABE',32,48);
    ctx.font='bold 36px sans-serif';ctx.fillStyle='#ecf6ff';
    const words=text.split(/\s+/);let line='',y=112,lines=0;
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>695&&line){ctx.fillText(line,32,y);y+=47;lines++;line=word;if(lines===4)break;}else line=next;}
    ctx.fillText(line.slice(0,40)+(lines===4?'…':''),32,y);
    ctx.fillStyle='#8ab9c7';ctx.font='20px monospace';ctx.fillText(create?'NEUE AUFGABE ERSTELLEN  +':'NÄHERN · E ZUM ÖFFNEN',32,348);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  function station(id,index,task,create=false){
    const group=new THREE.Group();scene.add(group);
    const x=create?0:index%2===0?-4:4,z=create?5:1-Math.floor(index/2)*4.6;group.position.set(x,0,z);
    mesh(cylinder,dark,[0,.45,0],[.8,.9,.8],group);mesh(cylinder,create?violet:trim,[0,.92,0],[.83,.035,.83],group);
    const material=new THREE.MeshBasicMaterial({map:titleTexture(task.text,task.completed,create),side:THREE.DoubleSide});
    const card=mesh(plane,material,[0,1.9,0],[2.25,1.125,1],group);
    const result={id,group,card,material,text:task.text,completed:task.completed,x,z,radius:.83,kind:create?'create':'task'};return result;
  }
  const terminal=station(null,0,{text:'Dein nächster Schritt',completed:false},true);
  function syncTasks(){const visible=selectSlots(props.tasks||[],props.selectedId),ids=new Set(visible.map(t=>t.id));
    for(const [id,s] of stations)if(!ids.has(id)){scene.remove(s.group);s.material.map.dispose();s.material.dispose();stations.delete(id);}
    visible.forEach((task,index)=>{let s=stations.get(task.id);if(!s){s=station(task.id,index,task);stations.set(task.id,s);}else{
      s.x=index%2===0?-4:4;s.z=1-Math.floor(index/2)*4.6;s.group.position.set(s.x,0,s.z);
      if(s.text!==task.text||s.completed!==task.completed){s.material.map.dispose();s.material.map=titleTexture(task.text,task.completed);s.material.needsUpdate=true;s.text=task.text;s.completed=task.completed;}
    }});
  }
  const active=()=>props.entered&&!props.paused&&!document.hidden&&!lost;
  const resetInput=()=>{keys.clear();drag=null;};
  function releasePointer(){resetInput();if(document.pointerLockElement===canvas){intentionalUnlock=true;document.exitPointerLock();}}
  function capturePointer(){if(active())try{const promise=canvas.requestPointerLock?.();promise?.catch?.(()=>{});}catch{/* drag remains available */}}
  function resetView(){yaw=0;pitch=0;camera.position.set(0,1.65,10);wake();}
  function interact(){if(!active()||!target)return;resetInput();target.kind==='create'?props.onCreate?.():props.onInteract?.(target.id);}
  function on(element,event,handler,options){element.addEventListener(event,handler,options);listeners.push(()=>element.removeEventListener(event,handler,options));}
  const editable=event=>event.target?.closest?.('input,textarea,select,[contenteditable="true"]');
  on(window,'keydown',event=>{if(!active()||editable(event))return;if(event.code==='Escape'){resetInput();releasePointer();props.onPause?.();return;}if(event.code==='KeyE'){if(!event.repeat)interact();return;}
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)){event.preventDefault();keys.add(event.code);wake();}});
  on(window,'keyup',event=>{keys.delete(event.code);});
  on(window,'blur',()=>{movementBlocked=true;resetInput();if(active())props.onPause?.();});
  on(document,'visibilitychange',()=>{resetInput();if(document.hidden){movementBlocked=true;if(props.entered&&!props.paused)props.onPause?.();if(frame)cancelAnimationFrame(frame);frame=0;}else wake();});
  on(document,'pointerlockchange',()=>{if(document.pointerLockElement!==canvas){resetInput();if(intentionalUnlock){intentionalUnlock=false;return;}if(active())props.onPause?.();}});
  on(canvas,'pointerdown',event=>{if(!active())return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture?.(event.pointerId);});
  on(canvas,'pointermove',event=>{if(!active())return;const locked=document.pointerLockElement===canvas;if(!locked&&drag?.id!==event.pointerId)return;
    const dx=locked?event.movementX:event.clientX-drag.x,dy=locked?event.movementY:event.clientY-drag.y;
    yaw-=dx*.003;pitch=Math.max(-1.15,Math.min(1.15,pitch-dy*.003));if(drag){drag.x=event.clientX;drag.y=event.clientY;}wake();});
  on(canvas,'pointerup',()=>{drag=null;});on(canvas,'pointercancel',resetInput);on(canvas,'lostpointercapture',()=>{drag=null;});
  on(canvas,'webglcontextlost',event=>{event.preventDefault();lost=true;resetInput();if(frame)cancelAnimationFrame(frame);frame=0;props.onReady?.(false);});
  on(canvas,'webglcontextrestored',()=>{lost=false;props.onReady?.(true);wake();});
  function updateTarget(){let next=null,best=3.4;const forward=new THREE.Vector3();camera.getWorldDirection(forward);
    for(const s of [terminal,...stations.values()]){const delta=new THREE.Vector3(s.x-camera.position.x,1.7-camera.position.y,s.z-camera.position.z);const distance=delta.length();if(distance<best&&delta.normalize().dot(forward)>.52){next=s.kind==='create'?{kind:'create'}:{kind:'task',id:s.id};best=distance;}}
    if(next?.kind!==target?.kind||next?.id!==target?.id){target=next;props.onTarget?.(target);}
  }
  function draw(now){frame=0;if(disposed||lost||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    let moving=false;
    if(active()){
      const input={x:(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+(movementBlocked?0:props.movement?.x||0),y:(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+(movementBlocked?0:props.movement?.y||0)};
      moving=!!(input.x||input.y);if(moving){const p=stepPosition(camera.position,input,yaw,dt,[terminal,...stations.values(),...architectureObstacles]);camera.position.x=p.x;camera.position.z=p.z;}
      camera.rotation.set(pitch,yaw,0);updateTarget();
    }else if(!props.entered){camera.position.set(13,11,18);camera.lookAt(0,1,-10);}
    if(props.effectsEnabled){portalMat.uniforms.time.value=now/1000;floorMat.uniforms.time.value=now/1000;}
    let pulsing=false;
    for(const s of stations.values()){
      const remaining=Math.max(0,(s.pulseUntil||0)-now);pulsing ||= remaining>0;
      const scale=(s.id===props.selectedId?1.06:1)+Math.sin(remaining/650*Math.PI)*.12;
      s.card.scale.set(2.25*scale,1.125*scale,1);
    }
    canvas.dataset.cameraPosition=[camera.position.x,camera.position.y,camera.position.z].map(n=>n.toFixed(3)).join(',');
    canvas.dataset.stationCount=String(stations.size);renderer.render(scene,camera);
    if(props.effectsEnabled||moving||pulsing)frame=requestAnimationFrame(draw);
  }
  function wake(){if(!frame&&!disposed&&!lost&&!document.hidden){last=0;frame=requestAnimationFrame(draw);}}
  function update(next){const wasEntered=props.entered,wasPaused=props.paused;props=next;
    if(!props.movement?.x&&!props.movement?.y)movementBlocked=false;
    if(!active()){movementBlocked=true;resetInput();releasePointer();if(target){target=null;props.onTarget?.(null);}}
    if(!wasEntered&&props.entered)resetView();
    if(!wasPaused&&props.paused)resetInput();
    syncTasks();
    if(props.travelRequest&&props.travelRequest.sequence!==sequence){sequence=props.travelRequest.sequence;const s=stations.get(props.travelRequest.id);if(s){camera.position.set(s.x,1.65,s.z+2.2);yaw=0;pitch=0;resetInput();}}
    if(props.pulse!==pulse){pulse=props.pulse;const s=stations.get(props.pulse?.id||props.selectedId);if(s&&props.pulse)s.pulseUntil=performance.now()+650;}
    // Prop updates (including joystick release) require one render, never a persistent idle loop.
    wake();
  }
  const resize=()=>{const width=host.clientWidth||1,height=host.clientHeight||1;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);wake();};
  const observer=new ResizeObserver(resize);observer.observe(host);resetView();syncTasks();resize();props.onReady?.(true);
  return {update,capturePointer,releasePointer,resetView,getState:()=>({position:camera.position.toArray(),yaw,pitch,stations:[...stations.keys()],target,frame,paused:props.paused,memory:{...renderer.info.memory}}),dispose(){disposed=true;resetInput();releasePointer();if(frame)cancelAnimationFrame(frame);observer.disconnect();listeners.forEach(remove=>remove());for(const s of [terminal,...stations.values()]){s.material.map.dispose();s.material.dispose();}resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
