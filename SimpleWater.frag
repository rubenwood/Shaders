
// A simple, if a little square, water caustic effect.
// David Hoskins.
// htthttps://www.shadertoy.com/view/MdKXDmps://www.shadertoy.com/view/MdKXDm
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// Inspired by akohdr's "Fluid Fields"
// https://www.shadertoy.com/view/XsVSDm

#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
uniform float m1;
//uniform vec3 v1;

//My Controls
uniform float strength;
uniform float rippleScale;
uniform float alpha;
uniform vec3 waterColor;

#define f length(fract(q*=m*=.6+.1*d++)-.5)

void main()
{
    float d = 0.;
    vec3 q = vec3(gl_FragCoord.xy / resolution.xy-13., time*.2);
    
    mat3 m = mat3(-2,-1,2, 3,-2,1, -1,1,3);
    vec3 col = vec3(pow(min(min(f,f),f), rippleScale)*strength);
    gl_FragColor = vec4(clamp(col + waterColor, 0.0, 1.0), alpha);
}
