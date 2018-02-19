#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;
uniform float time;

void main()
{
	
	vec4 f = vec4(.8,.2,.5,1);
    vec2 s = resolution.xy;
	vec2 g = gl_FragCoord.xy;
	vec4 h = texture2D(backbuffer, g / s);
	g = (gl_FragCoord.xy * 2.-s)/s.y*1.3;
    vec2 
        k = vec2(1.6,0) + mod(time,6.28), 
        a = g - sin(k),
    	b = g - sin(2.09 + k),
    	c = g - sin(4.18 + k);
    gl_FragColor = (0.02/dot(a,a) + 0.02/dot(b,b) + 0.02/dot(c,c)) * 0.04 + h * 0.96 + step(h, f) * 0.01;
}