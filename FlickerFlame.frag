/*[SH17A]VFX Flame,by 834144373
   Licence: https://creativecommons.org/licenses/by-nc-sa/3.0/
   https://www.shadertoy.com/view/4djfDR
*/
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform float scale;

uniform float flickerFreq; //How often flickering occurs, clamped between -1 and 1
uniform float flameStrength;

uniform float m1;

#define C gl_FragColor
void main() {	
  C -= C;
  vec2 U = gl_FragCoord.xy/resolution.xy*2.-1.;
	U*=scale;
	U.y -= 0.5;
	C.rg += smoothstep(1.,0.,0.3+length(U.y+vec2(0.,pow(abs(U.x),2.4)*1e2+clamp(flickerFreq, -1., 1.)*fract(sin(time*3e4))))*flameStrength);
	C.g /=2.4;

	C += C.r*1.12;
	 //Describe
    	//C.rg += pow(a,1.1);
	//for VFX
    	//C.b += pow(a,0.8);
	//Non-Visual Effects
    	//	C.b += a*1.1;
}

