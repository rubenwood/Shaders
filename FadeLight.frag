#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;

#define PI atan(1.) * 4.

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

//My Controls
uniform float m1;
uniform vec3 v1;

uniform float verbosity;
uniform float beams;

void main() {

	vec2 p = (( gl_FragCoord.xy / resolution.xy ) - .5) * 2.;
	p.x *= resolution.x / resolution.y;
	p.y += 1.;
	p *= 1.;

	float boundA = PI / 3.;
	float boundB = 2. * PI / 3.;
	float smoothBound = .2;
	
	float t = atan(p.y, p.x);
	float c = smoothstep(boundA - smoothBound, boundA, t) - smoothstep(boundB, boundB + smoothBound, t);
	float r = (t - boundA) / (boundB - boundA);
	r = sin(PI * r) * .2;
	
	r += abs(sin(r * beams + time * .1)) * .2;
	//r += abs(sin(r * beams + time * .01)) * .1;
	
	r += .1;
	r *= smoothstep(.4, .6, length(p)) - smoothstep(.8, abs(sin(r * 10. + time)) * .2 + 2., length(p));
	r *= abs(noise(p + time * .5));
	r *= verbosity;

	//Create final color and then create alpha from that
	vec3 fc = vec3(v1 * r * c);
	float alpha = fc.b-1; //(fc.x+fc.y+fc.z)/3;

	gl_FragColor = vec4(fc, alpha);
}