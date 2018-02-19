// 00f404afdd835ac3af3602c8943738ea - please mark changes (and/or add docs), and retain this line.

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float _MinStep = 0.125;

//////////////////////////////////////////////////////////////
// http://www.gamedev.net/topic/502913-fast-computed-noise/
// replaced costly cos with z^2. fullreset
vec4 random4 (const vec4 x) {
    vec4 z = mod(mod(x, vec4(5612.0)), vec4(3.1415927 * 2.0));
    return fract ((z*z) * vec4(56812.5453));
}
const float A = 1.0;
const float B = 57.0;
const float C = 113.0;
const vec3 ABC = vec3(A, B, C);
const vec4 A3 = vec4(0, B, C, C+B);
const vec4 A4 = vec4(A, A+B, C+A, C+A+B);
float cnoise4 (const in vec3 xx) {
    vec3 x = xx; // mod(xx + 32768.0, 65536.0); // ignore edge issue
    vec3 fx = fract(x);
    vec3 ix = x-fx;
    vec3 wx = fx*fx*(3.0-2.0*fx);
    float nn = dot(ix, ABC);

    vec4 N1 = nn + A3;
    vec4 N2 = nn + A4;
    vec4 R1 = random4(N1);
    vec4 R2 = random4(N2);
    vec4 R = mix(R1, R2, wx.x);
    float re = mix(mix(R.x, R.y, wx.y), mix(R.z, R.w, wx.y), wx.z);

    return 1.0 - 2.0 * re;
}

//////////////////////////////////////////////////////////////
// distance functions
// http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdSphere( vec3 p, float s ) { return length(p)-s; }
float udBox( vec3 p, vec3 b ) {  return length(max(abs(p)-b,0.0)); }
float udRoundBox( vec3 p, vec3 b, float r ) { return length(max(abs(p)-b,0.0))-r; }
float sdTorus( vec3 p, vec2 t ) { vec2 q = vec2(length(p.xz)-t.x,p.y);  return length(q)-t.y; }
vec3  opRep(vec3 p, vec3 r) { return mod(p,r)-0.5*r; }
vec3  opTx(vec3 p, mat4 m ) { return (m*vec4(p,1.0)).xyz; }
/////////////////////////////////////////////////////
// the rest

float fbm(vec3 p) {
 float N = 0.0;
  float D = 0.0;
  int i=0;
  float R = 0.0;
  D += (R = 1.0/pow(2.0,float(i+1))); N = cnoise4(p*pow(2.0,float(i)))*R + N; i+=1;
  D += (R = 1.0/pow(2.0,float(i+1))); N = cnoise4(p*pow(2.0,float(i)))*R + N; i+=1;
  D += (R = 1.0/pow(2.0,float(i+1))); N = cnoise4(p*pow(2.0,float(i)))*R + N; i+=1;
//  D += (R = 1.0/pow(2.0,float(i+1))); N = cnoise4(p*pow(2.0,float(i)))*R + N; i+=1;
  return N/D;
}
float scene(vec3 p) { 
  vec3 pw = vec3(0.,0.,10.);
  float pa = udRoundBox(p+pw,vec3(100.,5,5.),0.22);
  float pb = udRoundBox(p-pw,vec3(100.,5,5.),0.22);
  float d = min(pa,pb);
	
  d = min(d,udRoundBox(p-pw*2.,vec3(100.,80.,.2),0.22));

  vec3 c = opRep(p,vec3(20.,4.5,14.))-vec3(0.,0.,7.);
  d = min(d,udRoundBox(c+pw+vec3(0.,0.0,-3.),vec3(1.75,2.,0.75),0.22));

  float e = udRoundBox(p-vec3(0.,30.,4.),vec3(100.,0.1,0.1),0.1);
  e = min(e,udRoundBox(p-vec3(0.,31.,4.),vec3(100.,0.06,0.06),0.1));
  e = min(e,udRoundBox(p-vec3(0.,5.,1.),vec3(100.,0.1,0.1),0.25));
  e = min(e,udRoundBox(p-vec3(0.,4.,1.),vec3(100.,0.1,0.1),0.25)); 
  e = min(e,udRoundBox(p-vec3(7.45,0.,-7.5),vec3(0.1,100.,0.1),0.1)); 

  float n = fbm(p);  	
  return min(e,n*0.32+d); // 'texture'
}

vec4 color(float d) { 
  return mix(vec4(1.,1.,1.,0.25),vec4(0.2,0.2,0.,0.01),smoothstep(0.,0.1,d)); 
}

vec4 ray(vec3 pos, vec3 step) {
    vec4 sum = vec4(0.);
    vec4 col;
    float d = 9999.0;
#define RAY1  { d = scene(pos); col = color(d); col.rgb *= col.a; sum += col*(1.0 - sum.a); pos += step*max(d,_MinStep); }
#define RAY4  RAY1 RAY1 RAY1 RAY1
    RAY4 RAY4 RAY4 RAY4
    return sum;
}

void main( void ) {
  vec3 e = vec3(sin(time*0.2)*20.,14.,-50.); 
  vec3 p = vec3((gl_FragCoord.xy / resolution.xy) * 2. -1., 1.);
  p.x *= resolution.x/resolution.y;
   p.z = 1.0 -sin(time * 0.012);	
  p += e;
  gl_FragColor = ray(p, normalize(p-e));
}