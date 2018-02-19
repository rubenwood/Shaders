// @eddbiddulph
#define ITERS 64

uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

uniform float m1;
uniform vec3 v1;

//My controls, Cylinder UVMap position = -1.4686,0,0 scale: 0.5,0.5
//Dont turn on TrateAsSemitransparent if this is being rendered to a texture, instead just lower opacity of ShaderMaterial (to 0.999)
//https://www.shadertoy.com/results?query=holo
uniform float uvScale;
uniform vec3 uvPos;
uniform vec3 color;
uniform vec3 beamScale;  	 // Good values: 1.1, -0.9, -0.02 
uniform float beamSpeed; 	 // Controls speed at which bems travel upwards, negative makes them travel downward
uniform float beamStretch; 	 // 80 deafult
uniform float beamVerbosity; // 0.5 default
uniform float beamThickness; // thickness of each individual beam, default 3.5, less is thicker
uniform float baseScale;	 // Overall size of bottom bar
uniform float baseGlow;		 // amount of glow and scale of glow emitter at the bottom, best at 0.25
uniform vec2 glowScale;		 // default 0.3, 1.0
uniform float glowYPos;		 // adjust y position of glow circle (lower is higher), -0.88, -0.9
uniform float light; 	 	 // range of light, default 30
uniform float alphaMod;		 // Modifier for alpha transparecy
//uniform float verbosity;	 // default 64

// Not really needed for what we are doing
vec3 rotateX(float a, vec3 v){
	return vec3(v.x, cos(a) * v.y + sin(a) * v.z, cos(a) * v.z - sin(a) * v.y);
}
vec3 rotateY(float a, vec3 v){
	return vec3(cos(a) * v.x + sin(a) * v.z, v.y, cos(a) * v.z - sin(a) * v.x);
}

// Returns the entry and exit points along the given ray with
// a cube of edge length 2 centered at the origin.
vec2 cubeInterval(vec3 ro, vec3 rd){
	vec3 slabs0 = (vec3(+1.0) - ro) / rd;
	vec3 slabs1 = (vec3(-1.0) - ro) / rd;
	
	vec3 mins = min(slabs0, slabs1);
	vec3 maxs = max(slabs0, slabs1);
	
	return vec2(max(max(mins.x, mins.y), mins.z),				
				min(min(maxs.x, maxs.y), maxs.z));
}

vec2 hologramInterval(vec3 ro, vec3 rd){ 
	vec3 scale = beamScale; // Set Beam scale (x,y and z)
	return cubeInterval(ro / scale, rd / scale);
}

vec2 powerboxInterval(vec3 ro, vec3 rd){ // Not needed?
	vec3 scale = vec3(0.1, 0.2, 0.08);
	vec3 trans = vec3(-1.1, 0.8, 0.0);
	return cubeInterval((ro - trans) / scale, rd / scale);
}

float hologramBrightness(vec2 p){
	//texture(iChannel0, p).rgb // not needed for what we are doing
	return dot(vec3(0.0,0.3,1.0), vec3(1.0 / 3.0)); // change firstvec3 to rgb from texture if you want to use texture
}

float flicker(float x){
	x = fract(x);
	return smoothstep(0.0, 0.1, x) - smoothstep(0.1, 0.2, x);// * m1;
}

float flickers(){
	//Controls pulses/flickers
	return 1.0 + flicker(iTime) + flicker(iTime * 1.2);
}

vec3 hologramImage(vec2 p){
	vec2 tc = (p * -1.0 + vec2(1.0)) * 0.5;

	float d = 1e-3;
	
	float b0 = hologramBrightness(tc);
	float b1 = (hologramBrightness(tc + vec2(d, 0.0)) - b0) / d;
	float b2 = (hologramBrightness(tc + vec2(0.0, d)) - b0) / d;
	
	float f = flickers();
	float sharp = pow(length(vec2(b1, b2)) * 0.1, 5.0) * 0.02;
	
	// MAGIC
	return (vec3(sharp + b0) * 3.0) * vec3(1.0, 1.0, 1.0) *
				mix(0.5, 0.9, pow(0.5 + beamVerbosity * cos(p.y * beamStretch + iTime * beamSpeed), beamThickness)) * // add * f here to add pulse/flickers
		(2.0 - tc.y * 2.0 + (1.0 - smoothstep(0.0, baseScale, tc.y)) * 10.0);
}

vec3 floorTex(vec3 ro, vec3 rd){
	float t = (1.0 - ro.y) / glowYPos; //rd.y
	float hit = step(t, 0.0);
	vec2 tc = ro.xz + rd.xz * t;
	
	vec3 glow = vec3(0.6, 0.8, 1.0) * 1.0 / length(tc * glowScale) * 0.2 * mix(1.0, flickers(), 0.25);
	glow *= baseGlow; // multiply glow by baseGlow to add external control
	
	float w = abs(cos(tc.x) * 0.3 * min(1.0, tc.x * 0.5) - tc.y);
	float wires = max(step(-1.0, tc.x), smoothstep(0.02, 0.03, w));
	return mix(vec3(0.0), glow * wires, hit);
}

void main(){
	vec2 uv = (gl_FragCoord.xy / iResolution.xy - vec2(0.5)) * uvScale;
	uv.x *= iResolution.x / iResolution.y;
	
	vec3 ct = uvPos;
	vec3 cp = rotateY(0.0 * 0.5 * 0.5, vec3(0.0, -0.5 + sin(0. * 0.7 * 0.5) * 0.7, 1.2)); // set iTime (X value) to 0 to stop moving
	vec3 cw = normalize(ct - cp);
	vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
	vec3 cv = normalize(cross(cu, cw));
	
	mat3 rm = mat3(cu, cv, cw);

	vec3 ro = cp, rd = rm * vec3(uv, -1.0);
	
	vec2 io = hologramInterval(ro, rd);
	vec2 io_pb = powerboxInterval(ro, rd);
	
	float cov = step(io.x, io.y);
	float cov_pb = step(io_pb.x, io_pb.y);
		
	float len = abs(io.x - io.y);
	
	vec3 accum = vec3(0.0);

	vec3 fl = floorTex(ro, rd);
	
	io.x = min(0.0, io.x);

	ro += rd * io.x;
	rd *= (io.y - io.x) / float(ITERS);

	vec3 rp = ro + rd * 64; // verbosity modify central lines
	
	for(int i = 0; i < ITERS; i += 1)
	{
		//vec3 rp = ro + rd * m1; // Dont really need this either?
		accum += hologramImage(rp.xy) * sqrt(1.0 - abs(rp.z) * 10.0);
	}
	
	vec3 fcol = mix(fl, vec3(0.0), cov_pb);
	fcol = mix(fcol, fcol + accum * cov * (len / float(ITERS)) * light,
			   	max(1.0 - cov_pb, step(io_pb.x, io.x)));
	
	float alpha = (fcol.r+fcol.g+fcol.b)/3;
	gl_FragColor = vec4(fcol.x*color.x,fcol.y*color.y,fcol.z*color.z, alpha-alphaMod);
}

