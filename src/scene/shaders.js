export const coreVertex = `
uniform float time; uniform float impulse;
varying vec3 vNormal; varying vec3 vWorld; varying float vNoise;
float wave(vec3 p){return sin(p.x*4.+time)*sin(p.y*3.-time*.7)*cos(p.z*5.+time*.4);}
void main(){float n=wave(position);vNoise=n;vec3 p=position+normal*(n*.19+impulse*.14);vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`;
export const coreFragment = `
uniform float time; uniform float impulse; varying vec3 vNormal;varying vec3 vWorld;varying float vNoise;
void main(){vec3 view=normalize(cameraPosition-vWorld);float f=pow(1.-abs(dot(normalize(vNormal),view)),2.);float band=sin(vWorld.y*13.+vNoise*4.-time*1.5)*.5+.5;vec3 c=mix(vec3(.22,.025,.6),vec3(.02,.8,1.),vNoise*.5+.5);c=mix(c,vec3(.65,1.,.16),pow(band,8.)*.65);c+=f*vec3(.35,.8,1.)*1.8+impulse*.35;gl_FragColor=vec4(c,1.);}`;
export const gridVertex = `varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const gridFragment = `varying vec3 vPosition;uniform float time;void main(){vec2 p=vPosition.xy;vec2 g=abs(fract(p*.65-.5)-.5)/fwidth(p*.65);float line=1.-min(min(g.x,g.y),1.);float fade=exp(-length(p)*.105);float sweep=pow(sin(length(p)*.6-time)*.5+.5,12.);gl_FragColor=vec4(mix(vec3(.12,.22,.65),vec3(.1,.8,.85),sweep),line*fade*.5);}`;
