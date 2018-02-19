// From Shadertoy Mr Elias
// for glslsandbox by Gigatron
// variant by I.G.P.


// MODS BY NRLABS 2016 ( COULDNT RESIST )

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// SNABEL
const float pi=3.141592653589793;float sdPlane(in vec3 p){return p.y+0.4;}float sdSphere(in vec3 p,in float r){return length(p)-r;}float sdCapsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba) / dot(ba ,ba),0.0,1.0);return length(pa-ba*h)-r;}float motor(float _min,float _max,float time){float t=0.5+0.5*sin(time);return mix(_min,_max,t);}vec3 rotate_from_origin(vec3 origin,vec3 target,float r,float angle){return vec3(origin.x+r*cos(angle),origin.y+r*sin(angle),target.z);}vec3 preserve(vec3 p0,vec3 p1,float len){vec3 v=p1-p0;vec3 u=normalize(v);return p0+len*u;}float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}float map(in vec3 p){float t=time*6.0;float cx=0.2;float cz=0.1;vec3 p0=vec3(-cx,0.0,0.0);vec3 p1=vec3(-cx,-0.2,-cz);vec3 p2=vec3(-cx,-0.4,-cz);vec3 p3=vec3(-cx,0.2,cz);vec3 p4=vec3(-cx,-0.4,cz);vec3 p5=vec3(cx,0.0,0.0);vec3 p6=vec3(cx,-0.2,-cz);vec3 p7=vec3(cx,-0.4,-cz);vec3 p8=vec3(cx,0.2,cz);vec3 p9=vec3(cx,-0.4,cz);vec3 p10=vec3(0.0,0.0,0.0);vec3 p11=vec3(cx,-0.2,0.0);vec3 p12=vec3(cx*2.2,0.2,0.0);vec3 p13=vec3(cx*2.4,0.1,0.0);float angle0=0.0;float angle1=0.0;p0.y=-motor(-0.05,0.05,t*4.0);angle0=-motor(pi*0.15,pi*0.65,t*2.0-pi*0.5);angle1=-motor(pi*0.15,pi*0.65,t*2.0+pi*0.5);p1=rotate_from_origin(p0,p1,0.2,angle0);p3=rotate_from_origin(p0,p3,0.2,angle1);angle0+=-motor(0.0,pi*0.5,t*2.0+pi);angle1+=-motor(0.0,pi*0.5,t*2.0+pi+pi);p2=rotate_from_origin(p1,p2,0.2,angle0);p4=rotate_from_origin(p3,p4,0.2,angle1);p5.y=-motor(-0.05,0.05,t*4.0);angle0=-motor(pi*0.15,pi*0.65,t*2.0-pi*0.5);angle1=-motor(pi*0.15,pi*0.65,t*2.0+pi*0.5);p6=rotate_from_origin(p5,p6,0.2,angle0);p8=rotate_from_origin(p5,p8,0.2,angle1);angle0+=-motor(0.0,pi*0.5,t*2.0+pi);angle1+=-motor(0.0,pi*0.5,t*2.0+pi+pi);p7=rotate_from_origin(p6,p7,0.2,angle0);p9=rotate_from_origin(p8,p9,0.2,angle1);p10.y=-motor(-0.02,0.02,t*4.0-pi*0.5);p11=preserve(p5,p11,-0.25);p12.y-=motor(-0.02,0.02,t*4.0-pi*2.0);p13.y-=motor(-0.02,0.02,t*4.0-pi*0.1);float w=0.05;float d=sdPlane(p);d=min(d,sdCapsule(p,p0,p1,w));d=min(d,sdCapsule(p,p1,p2,w));d=min(d,sdCapsule(p,p0,p3,w));d=min(d,sdCapsule(p,p3,p4,w));d=min(d,sdCapsule(p,p5,p6,w));d=min(d,sdCapsule(p,p6,p7,w));d=min(d,sdCapsule(p,p5,p8,w));d=min(d,sdCapsule(p,p8,p9,w));d=min(d,sdCapsule(p,p0,p10,w));d=min(d,sdCapsule(p,p10,p5,w));d=min(d,sdCapsule(p,p12,p11,w));d=min(d,sdCapsule(p,p13,p12,w));d=smin(d,sdCapsule(p,p5,p11,w),0.1);return d;}vec3 calcNormal(in vec3 p){vec3 e=vec3(0.001,0.0,0.0);vec3 nor=vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx));return normalize(nor);}float castRay(in vec3 ro,in vec3 rd,in float maxt){float precis=0.001;float h=precis*2.0;float t=0.0;for(int i=0;i < 60;i++){if(abs(h) < precis || t > maxt) continue;h=map(ro+rd*t);t+=h;}return t;}

#define STEPS 16
#define PRECISION 0.01
#define DEPTH 15.0

vec3 eye = vec3(0,0.5,-1)*3.0;
vec3 light = vec3(0,1,-1);

const float lineWidth = 0.02;
const float border = 0.05;
const float scale = 0.07;

float bounding, ground, letters;
const float groundPosition = -0.5;
const vec3 boundingSize = vec3(30,12,0.8)*scale;

float t = time;
float scene(vec3);

// Utilities
float udBox(vec3 p, vec3 s) { return length(max(abs(p)-s,0.0)); }

/*
    mat4 rotX = mat4(      vec4(1,0,0,0),
                           vec4(0,c,-s,0),
                           vec4(0,s,c,0),
                           vec4(0,0,0,1) );
    
    mat4 rotY = mat4(      vec4(c,0,-s,0),
                           vec4(0,1,0,0),
                           vec4(s,0,c,0),
                           vec4(0,0,0,1) );
    
    mat4 rotZ = mat4(      vec4(c,s,0,0),
                           vec4(-s,c,0,0),
                           vec4(0,0,1,0),
                           vec4(0,0,0,1) );
    
    mat4 pos = mat4(       vec4(1,0,0,s),
                           vec4(0,1,0,0),
                           vec4(0,0,1,c),
                           vec4(0,0,0,1) );
*/
mat3 rotX(float a) {float s=sin(a); float c=cos(a); return mat3(1,0,0,0,c,-s,0,s,c);}
mat3 rotY(float a) {float s=sin(a); float c=cos(a); return mat3(c,0,-s,0,1,0,s,0,c);}

// Letter code (https://dl.dropboxusercontent.com/u/14645664/files/glsl-text.txt)
float line(vec2 p, vec2 s, vec2 e) {s*=scale;e*=scale;float l=length(s-e);vec2 d=vec2(e-s)/l;p-=vec2(s.x,-s.y);p=vec2(p.x*d.x+p.y*-d.y,p.x*d.y+p.y*d.x);return length(max(abs(p-vec2(l/2.0,0))-vec2(l/2.0,lineWidth/2.0),0.0))-border;}

// Marching
vec3 getNormal(vec3 p){vec2 e=vec2(PRECISION,0);return(normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx))));}
vec3 march(vec3 ro,vec3 rd){float t=0.0,d;for(int i=0;i<STEPS;i++){d=scene(ro+rd*t);if(d<PRECISION||t>DEPTH){break;}t+=d;}return(ro+rd*t);}
vec3 lookAt(vec3 o,vec3 t){vec2 uv=(2.0*gl_FragCoord.xy-resolution.xy)/resolution.xx;vec3 d=normalize(t-o),u=vec3(0,1,0),r=cross(u,d);return(normalize(r*uv.x+cross(d,r)*uv.y+d));}

vec3 processColor(vec3 p)
{
    float d = 1e10;
    
    vec3 n = getNormal(p);
    vec3 l = normalize(light-p);
    vec3 col;
    
    float dist = length(light-p);
    float diff = max(dot(n, normalize(light-p)),0.0);
    float spec = pow(diff, 100.0);
    
    if (ground<d) { col = vec3(diff+spec*0.3)*vec3(0.8,0.3,0.6); d = ground; }
    if (letters<d) { col = vec3(0,p.y*0.5+0.5,.1)+diff+spec; }
        
    col *= min(1.0, 1.0/dist);
    
    return col;
}

float scene(vec3 p)
{   
    p.x += 0.2;
    
    ground   = p.y-groundPosition;
    bounding = udBox(p,boundingSize);
    letters  = 1e10;
    
    float d = 1e10;
    
    
    
    letters = max(bounding, letters);
    
    d = min(d, ground);
    d = min(d, letters);
    
    return d; //+.01*sin(time*6.);
}
void glow(float d) {
    float br = 0.005 * resolution.y;
    gl_FragColor.rgb += vec3(0.3, 0.15, 0.45) * br / d;
}

void line( vec2 a, vec2 l ) {
    l.x *= resolution.y/resolution.x;
    l += 0.5;
    l *= resolution;
    
    vec2 P = gl_FragCoord.xy;
    a.x *= resolution.y/resolution.x;
    a += 0.5;
    a *= resolution;
    
    vec2 aP = P-a;
    vec2 al = l-a;
    vec3 al3 = vec3(al, 0.0);
    vec3 aP3 = vec3(aP, 0.0);
    //float q = length(dot(aP,al))/length(al);
    float q = length(cross(aP3,al3))/length(al3);
    
    float d = q;
    if ( dot(al, aP) <= 0.0 ) { // before start
               d = distance(P, a);
    }
        else if ( dot(al, al) <= dot(al, aP) ) { // after end
               d = distance(P, l);
    }
    glow(d);
}

void point(vec2 a) {
    a.x *= resolution.y/resolution.x;
    a += 0.5;
    a *= resolution;

    vec2 P = gl_FragCoord.xy;
    float d = distance(P, a);
    glow(d);
}

float rand(int seed) {
    return fract(sin(float(seed)*15.234234) + sin(float(seed)*4.3456342) * 372.4532);
}

float render(in vec3 ro, in vec3 rd) {
    float t = castRay(ro, rd, 20.0);
    vec3 pos = ro + rd * t;
    vec3 nor = calcNormal(pos);
    vec3 lig = normalize(vec3(-0.4, 0.7, 0.5));
    float dif = clamp(dot(lig, nor), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(rd, nor), lig), 0.0, 1.0), 16.0);
    float col = (dif + spec);
    if (col > 0.7365 && col < 0.739) {
        return -1.0;
    }
    return col;
}

float snabel() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= resolution.x / resolution.y;
    vec3 ro = vec3(0., 0.5, 5.0);
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(0.0, 1.0, 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = normalize(cross(cu, cw));
    vec3 rd = normalize(-p.x * cu + p.y * cv + 2.5 * cw);
    float col = render(ro, rd);
    
    return col;
}
    
void main()
{   
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

    eye *= rotY(mouse.x - 0.5 + 0.5*sin(t));
    eye *= rotX(mouse.y - 0.45);
    light.x = sin(t);

    vec3 p = march(eye,lookAt(eye,vec3(0)));
    vec3 col = processColor(p);
    // Horizontal grid lines
    float y = 0.0;
    for (int l=1; l<13; l++) {
        y = -1.0/(0.6 * sin(time * 0.73) + float(l)*1.2) + 0.25;
        line(vec2(-2.0, y), vec2(2.0, y));
    }
    
    // Perpendicular grid lines
    for (int l=-30; l<31; l++) {
        float x = float(l) + fract(time * 3.25);
        line(vec2(x * 0.025, y), vec2(x, -1.0));
    }
    
    // Starfield
    for (int l=1; l<70; l++) {
        float sx = (fract(rand(l+342) + time * (0.002 + 0.01*rand(l)))-0.5) * 3.0;
        float sy = y + 0.4 * rand(l+8324);
        point(vec2(sx,sy));
    }
    
    //
    float snabelIntensity = snabel();
    if (snabelIntensity >= .0) {
        vec3 snabelCol = vec3(0.5, 0.5, 0.5) * snabelIntensity;
        gl_FragColor = vec4(snabelCol, 1.0);
    } else {
        gl_FragColor += vec4(col.yyx,1.0);
    }
}