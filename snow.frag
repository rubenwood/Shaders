#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float aoinParam1;

//Controls
uniform float falloff;
uniform float waviness;
uniform float speed;
uniform float fade;
uniform float pVis;
uniform float regFade;
uniform float regularity;
uniform float glow;
uniform float bg;
uniform float ground;

uniform float uvScale; 
uniform float threshold; // for transparency

uniform float m1;

uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float e;
uniform float f;
uniform float g;

float snow(vec2 uv,float scale)
{
	float w = smoothstep(falloff,0.,-uv.y*(scale/fade));
	if(w<.1)return 0.;
	uv += (time*aoinParam1)/scale;
	uv.y+=time*speed/scale;uv.x+=sin(uv.y+time*waviness)/scale;
	uv *= scale;
	vec2 s=floor(uv),f=fract(uv),p;
	float k=3.,d;
	p = pVis+regFade*sin(regularity*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;
	d=length(p);k=min(d,k);
	
	k = smoothstep(0.,k,sin(f.x+f.y)*0.01);
	return k*w*glow;
}

void main(){
	vec2 uv=(gl_FragCoord.xy*uvScale-resolution.xy)/min(resolution.x,resolution.y); 
	vec3 finalColor=vec3(0);

	float c=smoothstep(clamp(bg, 0., 1.),0.0,clamp(uv.y*ground+.8,0.,.75));

	c+=snow(uv,a)*.3; //330
	c+=snow(uv,b)*.5; //230
	c+=snow(uv,c)*.8; //135
	c+=snow(uv,d); //130
	c+=snow(uv,e);//83
	c+=snow(uv,g);//63
	c+=snow(uv,g);//53

	finalColor=(vec3(c));
/*	if(finalColor.x < threshold && finalColor.y < threshold && finalColor.z < threshold){
		discard;
	}*/
	float alpha = (finalColor.x+finalColor.y+finalColor.z)/3; 
	gl_FragColor = vec4(finalColor,alpha);
}
