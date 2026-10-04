export const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const portalFragment = `uniform float time; varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float waves=sin(r*28.-time*1.6+sin(atan(p.y,p.x)*6.+time)*.6);float ring=exp(-abs(r-.78)*18.);vec3 c=mix(vec3(.04,.1,.22),vec3(.1,.85,1.),ring);c+=vec3(.45,.08,.8)*pow(max(0.,waves),5.)*(1.-smoothstep(.55,1.,r))*.6;gl_FragColor=vec4(c,1.);}`;
export const floorFragment = `varying vec2 vUv; uniform float time; void main(){vec2 grid=abs(fract(vUv*vec2(20.,46.))-.5);float line=1.-smoothstep(.475,.49,max(grid.x,grid.y));vec3 c=vec3(.018,.027,.045)+vec3(.03,.17,.21)*line;float path=exp(-abs(vUv.x-.5)*45.);c+=vec3(.03,.12,.17)*path;gl_FragColor=vec4(c,1.);}`;
export const hologramFragment = `uniform float time; varying vec2 vUv;
void main(){float scan=pow(max(0.,sin(vUv.y*170.-time*2.)),18.);float sweep=exp(-abs(vUv.y-fract(time*.12))*70.);float edge=pow(abs(vUv.x-.5)*2.,18.);gl_FragColor=vec4(.2,.85,1.,scan*.035+sweep*.09+edge*.12);}`;
