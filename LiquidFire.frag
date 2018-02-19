#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// *** My Controls ***
uniform vec4 bgc; // background colour
uniform float threshold;
uniform float vibrance;
uniform vec2 scale;
uniform vec2 uvScale;
uniform vec3 map;
uniform vec4 topFlameCol; //Colour at top of flame
uniform vec4 botFlameCol; //Colour at bottom of flame
uniform vec3 flameDimensions; //Dimensions of the flame

uniform float glowMult;
uniform float glowPow; 

uniform float colDist;
uniform float inheritance; // how much of Top or bottom colour is inhereted
uniform float speed; //ripple speed
uniform float rippleFreq;
uniform float scatter;
uniform float circularity; //How circular the flame is

uniform float m1; // Experimental Modifier


varying vec4 oUv0;

float noise(vec3 p){
	vec3 i = floor(p);
	vec4 a = dot(i, vec3(1., 57., .21)) + vec4(0., 57., 21., 78.);
	vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
	a = mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)), f.x);
	a.xy = mix(a.xz, a.yw, f.y);
	return mix(a.x, a.y, f.z);
}

float sphere(vec3 p, vec4 spr){
	return length(spr.xyz-p) - spr.w;
}

float flame(vec3 p){
	float d = sphere(p*flameDimensions, vec4(.0,-1.,.0,1.));
	return d + (noise(p+vec3(.0,time*speed,.0)) + noise(p*rippleFreq)*scatter)*circularity*(p.y) ;
}

float scene(vec3 p){
	return min(vibrance-length(p) , abs(flame(p)) );
}

vec4 raymarch(vec3 org, vec3 dir){
	float d = 0.0, glow = 0.0, eps = 0.02;
	vec3  p = org;
	bool glowed = false;
	
	for(int i=0; i<64; i++)
	{
		d = scene(p) + eps;
		p += d * dir;
		if( d>eps )
		{
			if(flame(p) < .0)
				glowed=true;
			if(glowed)
       			glow = float(i)/64.;
		}
	}
	return vec4(p,glow);
}

void main() {
	vec2 v = -uvScale.x + uvScale.y * gl_FragCoord.xy / resolution.xy;
	v.x *= resolution.x/resolution.y*scale.x;
	v.y *= resolution.x/resolution.y*scale.y;
	
	vec3 org = map;
	vec3 dir = normalize(vec3(v.x*1.6, -v.y, -1.5));
	
	vec4 p = raymarch(org, dir);
	float glow = p.w;
	
	vec4 col = mix(topFlameCol, botFlameCol, p.y*colDist+inheritance);

	
	vec4 fc = mix(bgc, col, pow(glow*glowMult,-glowPow));

/*	if(fc.x > threshold || fc.y > threshold || fc.z > threshold){
		discard;
	}*/

	gl_FragColor = fc;
	//gl_FragColor = mix(vec4(1.), mix(vec4(1.,.5,.1,1.),vec4(0.1,.5,1.,1.),p.y*.02+.4), pow(glow*2.,4.));
}