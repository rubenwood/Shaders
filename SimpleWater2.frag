// Forked (with flow and other knobs) (nvd)

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 surfacePosition;

#define MAX_ITER 9 // water depth

void main( void ) {
	vec2 sp = surfacePosition;//vec2(.4, .7);
	vec2 p = sp * 15.0 - vec2(20.0);
	vec2 i = p;
//	float c = 0.0; // brightness; larger -> darker
	float c = 1.0; // brightness; larger -> darker
	float inten = 0.025; // brightness; larger -> brighter
	float speed = 1.5; // larger -> slower
	float speed2 = 3.0; // larger -> slower
	float freq = 0.8; // ripples
	float xflow = 1.5; // flow speed in x direction
	float yflow = 0.0; // flow speed in y direction

	for (int n = 0; n < MAX_ITER; n++) {
		float t = time * (1.0 - (3.0 / (float(n) + speed)));
		i = p + vec2(cos(t - i.x * freq) + sin(t + i.y * freq) + (time * xflow), sin(t - i.y * freq) + cos(t + i.x * freq) + (time * yflow));
		c += 1.0 / length(vec2(p.x / (sin(i.x + t * speed2) / inten), p.y / (cos(i.y + t * speed2) / inten)));
	}
	
	c /= float(MAX_ITER);
	c = 1.5 - sqrt(c);
	gl_FragColor = vec4(vec3(c * c * c * c), 0.0) + vec4(0.0, 0.4, 0.55, 1.0);

}