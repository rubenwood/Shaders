#ifdef GL_ES
precision mediump float;
#endif
 
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
   
//afl_ext 2017 


#define CLOUDS_STEPS 147
#define ENABLE_SSS 1



#define EULER 2.7182818284590452353602874
float wave(vec2 uv, vec2 emitter, float speed, float phase, float timeshift){
	float dst = distance(uv, emitter);
	return pow(EULER, sin(dst * phase - (time + timeshift) * speed)) / EULER;
}
vec2 wavedrag(vec2 uv, vec2 emitter){
	return normalize(uv - emitter);
}

#define DRAG_MULT 3.0

float getwaves(vec2 position){
    position *= 0.1;
	float iter = 0.0;
    float phase = 6.0;
    float speed = 2.0;
    float weight = 1.0;
    float w = 0.0;
    float ws = 0.0;
    for(int i=0;i<9;i++){
        vec2 p = vec2(sin(iter), cos(iter)) * 30.0;
        float res = wave(position, p, speed, phase, 0.0);
        float res2 = wave(position, p, speed, phase, 0.006);
        position -= wavedrag(position, p) * (res - res2) * weight * DRAG_MULT;
        w += res * weight;
        iter += 12.0;
        ws += weight;
        weight = mix(weight, 0.0, 0.2);
        phase *= 1.18;
        speed *= 1.07;
    }
    return w / ws;
}
float getwavesHI(vec2 position){
    position *= 0.1;
	float iter = 0.0;
    float phase = 6.0;
    float speed = 2.0;
    float weight = 1.0;
    float w = 0.0;
    float ws = 0.0;
    for(int i=0;i<32;i++){
        vec2 p = vec2(sin(iter), cos(iter)) * 30.0;
        float res = wave(position, p, speed, phase, 0.0);
        float res2 = wave(position, p,  speed, phase, 0.006);
        position -= wavedrag(position, p) * (res - res2) * weight * DRAG_MULT;
        w += res * weight;
        iter += 12.0;
        ws += weight;
        weight = mix(weight, 0.0, 0.2);
        phase *= 1.18;
        speed *= 1.07;
    }
    return w / ws;
}

float H = 0.0;
vec3 normal(vec2 pos, float e, float depth){
    vec2 ex = vec2(e, 0);
    H = getwavesHI(pos.xy) * depth;
    vec3 a = vec3(pos.x, H, pos.y);
    return normalize(cross(normalize(a-vec3(pos.x - e, getwavesHI(pos.xy - ex.xy) * depth, pos.y)), 
                           normalize(a-vec3(pos.x, getwavesHI(pos.xy + ex.yx) * depth, pos.y + e))));
}
mat3 rotmat(vec3 axis, float angle)
{
	axis = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s, 
	oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s, 
	oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}
varying vec2 surfacePosition;
vec3 getRay(vec2 uv){
   uv = (surfacePosition) ;
	vec3 proj = rotmat(vec3(0.0, -1.0, 0.0),  uv.x * 0.77) * rotmat(vec3(1.0, 0.0, 0.0), uv.y * 0.77) * vec3(0.0, 0.0, 1.0);	
    if(resolution.y < 400.0) return proj;
	vec3 ray = rotmat(vec3(0.0, -1.0, 0.0), 3.0 * (mouse.x * 2.0 - 1.0)) * rotmat(vec3(1.0, 0.0, 0.0), 1.5 * (mouse.y * 2.0 - 1.0)) * proj;
    return ray;
}

float rand2sTime(vec2 co){
    co *= time;
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}
float raymarchwater(vec3 camera, vec3 start, vec3 end, float depth){
    vec3 pos = start;
    float h = 0.0;
    float hupper = depth;
    float hlower = 0.0;
    vec2 zer = vec2(0.0);
    vec3 dir = normalize(end - start);
    for(int i=0;i<318;i++){
        h = getwaves(pos.xz) * depth - depth;
        if(h + 0.01 > pos.y) {
            return distance(pos, camera);
        }
        pos += dir * (pos.y - h);
    }
    return -1.0;
}

float intersectPlane(vec3 origin, vec3 direction, vec3 point, vec3 normal)
{ 
    return clamp(dot(point - origin, normal) / dot(direction, normal), -1.0, 9991999.0); 
}
#define PI 3.141592
#define iSteps 16
#define jSteps 8

vec2 rsi(vec3 r0, vec3 rd, float sr) {
    // ray-sphere intersection that assumes
    // the sphere is centered at the origin.
    // No intersection when result.x > result.y
    float a = dot(rd, rd);
    float b = 2.0 * dot(rd, r0);
    float c = dot(r0, r0) - (sr * sr);
    float d = (b*b) - 4.0*a*c;
    if (d < 0.0) return vec2(1e5,-1e5);
    return vec2(
        (-b - sqrt(d))/(2.0*a),
        (-b + sqrt(d))/(2.0*a)
    );
}

float hash( float n ){
    return fract(sin(n)*758.5453);
    //return fract(mod(n * 2310.7566730, 21.120312534));
}

float noise3d( in vec3 x ){
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);
	float n = p.x + p.y*157.0 + 113.0*p.z;

	return mix(mix(	mix( hash(n+0.0), hash(n+1.0),f.x),
			mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
		   mix(	mix( hash(n+113.0), hash(n+114.0),f.x),
			mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

float noise2d( in vec2 x ){
    vec2 p = floor(x);
    vec2 f = smoothstep(0.0, 1.0, fract(x));
    float n = p.x + p.y*57.0;
    return mix(mix(hash(n+0.0),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y);
}
 float configurablenoise(vec3 x, float c1, float c2) {
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);

	float h2 = c1;
	 float h1 = c2;
	#define h3 (h2 + h1)

	 float n = p.x + p.y*h1+ h2*p.z;
	return mix(mix(	mix( hash(n+0.0), hash(n+1.0),f.x),
			mix( hash(n+h1), hash(n+h1+1.0),f.x),f.y),
		   mix(	mix( hash(n+h2), hash(n+h2+1.0),f.x),
			mix( hash(n+h3), hash(n+h3+1.0),f.x),f.y),f.z);

}

float supernoise3d(vec3 p){

	float a =  configurablenoise(p, 883.0, 971.0);
	float b =  configurablenoise(p + 0.5, 113.0, 157.0);
	return (a + b) * 0.5;
}
float supernoise3dX(vec3 p){

	float a =  configurablenoise(p, 883.0, 971.0);
	float b =  configurablenoise(p + 0.5, 113.0, 157.0);
	return (a * b);
}
float fbmHI(vec3 p){
   // p *= 0.1;
    p *= 0.0000169;
    p.x *= 0.489;
	p += time * 0.02;
	//p += getWind(p * 0.2) * 6.0;
	float a = 0.0;
    float w = 1.0;
    float wc = 0.0;
	for(int i=0;i<7;i++){
        //p += noise(vec3(a));
		a += clamp(2.0 * abs(0.5 - (configurablenoise(p, 883.0, 971.0))) * w, 0.0, 1.0);
		wc += w;
        w *= 0.5;
		p = p * 2.0;
	}
	return a / wc;// + noise(p * 100.0) * 11;
}
#define MieScattCoeff 2.0
vec3 wind(vec3 p){
    return vec3(
        supernoise3d(p),
        supernoise3d(p.yzx),
        supernoise3d(-p.xzy)
        ) * 2.0 - 1.0;
}
struct Ray { vec3 o; vec3 d; };
struct Sphere { vec3 pos; float rad; };

float planetradius = 6378000.1;
float minhit = 0.0;
float maxhit = 0.0;
float rsi2(in Ray ray, in Sphere sphere)
{
    vec3 oc = ray.o - sphere.pos;
    float b = 2.0 * dot(ray.d, oc);
    float c = dot(oc, oc) - sphere.rad*sphere.rad;
    float disc = b * b - 4.0 * c;
    vec2 ex = vec2(-b - sqrt(disc), -b + sqrt(disc))/2.0;
    minhit = min(ex.x, ex.y);
    maxhit = max(ex.x, ex.y);
    return mix(ex.y, ex.x, step(0.0, ex.x));
} 

#define CloudsFloor 1700.0
#define CloudsCeil 4000.0
vec3 atmosphere(vec3 r, vec3 r0, vec3 pSun, float iSun, float rPlanet, float rAtmos, vec3 kRlh, float kMie, float shRlh, float shMie, float g) {
    // Normalize the sun and view directions.
    pSun = normalize(pSun);
    r = normalize(r);

    // Calculate the step size of the primary ray.
    vec2 p = rsi(r0, r, rAtmos);
    if (p.x > p.y) return vec3(0,0,0);
    p.y = min(p.y, rsi(r0, r, rPlanet).x);
    float iStepSize = (p.y - p.x) / float(iSteps);
	float rs = rsi2(Ray(r0, r), Sphere(vec3(0), rAtmos));
	vec3 px = r0 + r * rs;
shMie *= 7.0 * ( (smoothstep(0.05, 0.4, pow(fbmHI(px +fbmHI(px )*99999.990  ) * (supernoise3dX(px* 0.00000669 + time * 0.001)*0.5 + 0.5) * 1.3, 3.0)) * 0.99 + 0.07));
    
    // Initialize the primary ray time.
    float iTime = 0.0;

    // Initialize accumulators for Rayleigh and Mie scattering.
    vec3 totalRlh = vec3(0,0,0);
    vec3 totalMie = vec3(0,0,0);

    // Initialize optical depth accumulators for the primary ray.
    float iOdRlh = 0.0;
    float iOdMie = 0.0;

    // Calculate the Rayleigh and Mie phases.
    float mu = dot(r, pSun);
    float mumu = mu * mu;
    float gg = g * g;
    float pRlh = 3.0 / (16.0 * PI) * (1.0 + mumu);
    float pMie = 3.0 / (8.0 * PI) * ((1.0 - gg) * (mumu + 1.0)) / (pow(1.0 + gg - 2.0 * mu * g, 1.5) * (2.0 + gg));

    // Sample the primary ray.
    for (int i = 0; i < iSteps; i++) {

        // Calculate the primary ray sample position.
        vec3 iPos = r0 + r * (iTime + iStepSize * 0.5);

        // Calculate the height of the sample.
        float iHeight = length(iPos) - rPlanet;

        // Calculate the optical depth of the Rayleigh and Mie scattering for this step.
        float odStepRlh = exp(-iHeight / shRlh) * iStepSize;
        float odStepMie = exp(-iHeight / shMie) * iStepSize;

        // Accumulate optical depth.
        iOdRlh += odStepRlh;
        iOdMie += odStepMie;

        // Calculate the step size of the secondary ray.
        float jStepSize = rsi(iPos, pSun, rAtmos).y / float(jSteps);

        // Initialize the secondary ray time.
        float jTime = 0.0;

        // Initialize optical depth accumulators for the secondary ray.
        float jOdRlh = 0.0;
        float jOdMie = 0.0;

        // Sample the secondary ray.
        for (int j = 0; j < jSteps; j++) {

            // Calculate the secondary ray sample position.
            vec3 jPos = iPos + pSun * (jTime + jStepSize * 0.5);

            // Calculate the height of the sample.
            float jHeight = length(jPos) - rPlanet;

            // Accumulate the optical depth.
            jOdRlh += exp(-jHeight / shRlh) * jStepSize;
            jOdMie += exp(-jHeight / shMie) * jStepSize;

            // Increment the secondary ray time.
            jTime += jStepSize;
        }

        // Calculate attenuation.
        vec3 attn = exp(-(kMie * (iOdMie + jOdMie) + kRlh * (iOdRlh + jOdRlh)));

        // Accumulate scattering.
        totalRlh += odStepRlh * attn;
        totalMie += odStepMie * attn;

        // Increment the primary ray time.
        iTime += iStepSize;

    }

    // Calculate and return the final color.
    return iSun * (pRlh * kRlh * totalRlh + pMie * kMie * totalMie);
}
vec3 getatm(vec3 ray){
	vec3 sd = rotmat(vec3(1.0, 1.0, 0.0), time * 0.25) * normalize(vec3(0.0, 1.0, 0.0)); 
    vec3 color = atmosphere(
        ray,           // normalized ray direction
        vec3(0,6372e3,0),               // ray origin
        sd,                        // position of the sun
        22.0,                           // intensity of the sun
        6371e3,                         // radius of the planet in meters
        6471e3,                         // radius of the atmosphere in meters
        vec3(3.5e-6, 10.0e-6, 22.4e-6), // Rayleigh scattering coefficient
        21e-6,                          // Mie scattering coefficient
        8e3,                            // Rayleigh scale height
        1.2e3 * MieScattCoeff,                          // Mie scale height
        0.758                           // Mie preferred scattering direction
    );		
 	return color;
    
}

float sun(vec3 ray){
 	vec3 sd = rotmat(vec3(1.0, 1.0, 0.0), time * 0.25) * normalize(vec3(0.0, 1.0, 0.0)); 

    return pow(max(0.0, dot(ray, sd)), 4228.0) * 110.0;
}
float smart_inverse_dot(float dt, float coeff){
    return 1.0 - (1.0 / (1.0 + dt * coeff));
}
#define VECTOR_UP vec3(0.0,1.0,0.0)
vec3 getSunColorDirectly(float roughness){
    vec3 sunBase = vec3(15.0);
	vec3 sd = rotmat(vec3(1.0, 1.0, 0.0), time * 0.25) * normalize(vec3(0.0, 1.0, 0.0)); 

    float dt = max(0.0, (dot(sd, VECTOR_UP)));
    float dtx = smoothstep(-0.0, 0.1, dt);
    float dt2 = 0.9 + 0.1 * (1.0 - dt);
    float st = max(0.0, 1.0 - smart_inverse_dot(dt, 11.0));
    vec3 supersundir = max(vec3(0.0),   vec3(1.0) - st * 4.0 * pow(vec3(50.0/255.0, 111.0/255.0, 153.0/255.0), vec3(2.4)));
//    supersundir /= length(supersundir) * 1.0 + 1.0;
    return supersundir * 4.0 ;
    //return mix(supersundir * 1.0, sunBase, st);
    //return  max(vec3(0.3, 0.3, 0.0), (  sunBase - vec3(5.5, 18.0, 20.4) *  pow(1.0 - dt, 8.0)));
} 
vec2 UV;
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / resolution.xy;
 	UV = uv;
 	vec3 sd = rotmat(vec3(1.0, 1.0, 0.0), time * 0.25) * normalize(vec3(0.0, 1.0, 0.0)); 
	float waterdepth = 2.1;
	vec3 wfloor = vec3(0.0, -waterdepth, 0.0);
	vec3 wceil = vec3(0.0, 0.0, 0.0);
	vec3 orig = vec3(0.0, 2.0, 0.0);
	vec3 ray = getRay(uv);
	
	float spherehit = rsi2(Ray(orig, ray), Sphere(vec3(-2.0, 3.0, 0.0), 1.0));
	float fff = 1.0;
	
	
	float hihit = intersectPlane(orig, ray, wceil, vec3(0.0, 1.0, 0.0));
    
    Sphere sphere1 = Sphere(vec3(0), planetradius + CloudsFloor);
    Sphere sphere2 = Sphere(vec3(0), planetradius + CloudsCeil);
    
    if(ray.y >= -0.01){
        vec3 atm = getatm(ray);
        vec3 C = atm  * 0.5 + sun(ray);
         
        //tonemapping
        //C = normalize(C) * sqrt(length(C));
     	fragColor = vec4( pow(C, vec3(1.0/2.4)),1.0);   
        return;
    }
    vec3 fullcolor = vec3(0.0);
    float X = 0.0;
    vec2 pixel = 1.0 / resolution.xy;
    for(int i=0;i<1;i++){
		vec3 ray = getRay(uv + vec2(rand2sTime(uv.xy + X), rand2sTime(uv.xy - 2000.0 + X)) * pixel);
        X += 100.0;

        float spherehit = rsi2(Ray(orig, ray), Sphere(vec3(-2.0, 3.0, 0.0), 1.0));
        float fff = 1.0;


        float hihit = intersectPlane(orig, ray, wceil, vec3(0.0, 1.0, 0.0));

        Sphere sphere1 = Sphere(vec3(0), planetradius + CloudsFloor);
        Sphere sphere2 = Sphere(vec3(0), planetradius + CloudsCeil);
        float lohit = intersectPlane(orig, ray, wfloor, vec3(0.0, 1.0, 0.0));
        vec3 hipos = orig + ray * hihit;
        vec3 lopos = orig + ray * lohit;
        float dist = raymarchwater(orig, hipos, lopos, waterdepth);
        vec3 pos = orig + ray * dist;

        vec3 N = normal(pos.xz, 0.01, waterdepth);
        N = mix(N, VECTOR_UP, 0.8 * min(1.0, sqrt(dist*0.01) * 1.1));
        vec2 velocity = N.xz * (1.0 - N.y);
        vec3 R = normalize(reflect(ray, N));
        vec3 RF = normalize(refract(ray, N, 0.66)); 
        float fresnel = (0.04 + (1.0-0.04)*(pow(1.0 - max(0.0, dot(-N, ray)), 5.0)));

        R.y = abs(R.y);
        vec3 reflection = getatm(R);
        vec3 atmorg = vec3(0,planetradius,0) + pos;
        Ray r = Ray(atmorg, R);
        float hitfloor = rsi2(r, sphere1);
        float hitceil = rsi2(r, sphere2);
       // vec4 clouds = internalmarchconservative(reflection, R * hitfloor, R * hitceil, 0.0);
        //vec3 C = fresnel * mix(reflection + sun(R), clouds.xyz, clouds.a * 0.3) * 2.0;

        vec3 C = fresnel * (reflection + sun(R)) * 1.0;

        float superscat = pow(max(0.0, dot(RF, sd)), 16.0) ;
    #if ENABLE_SSS
        C += vec3(0.5,0.9,0.8) * superscat * getSunColorDirectly(0.0) * 81.0* (1.0 - 1.0 / (1.0 + 5.0 * max(0.0, dot(sd, VECTOR_UP))));
        vec3 waterSSScolor =  vec3(0.01, 0.33, 0.55)*  0.171 ;
        C += waterSSScolor * getSunColorDirectly(0.0) * (0.0 + getwaves(pos.xz)) * waterdepth * 0.3 * max(0.0, dot(sd, VECTOR_UP));
        //tonemapping
        #endif
            C *= fff * 0.5;
       // C = normalize(C) * sqrt(length(C));
        fullcolor += C;
    }
    //fullcolor /= X * 0.01;
    
	fragColor = vec4(pow(fullcolor, vec3(1.0/2.4)),1.0);
}
void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;

	vec4 color = vec4(0.0);
	mainImage(color, gl_FragCoord.xy);

	gl_FragColor = vec4( color + vec4(rand2sTime(position) * (1.0 / 128.0)));

}