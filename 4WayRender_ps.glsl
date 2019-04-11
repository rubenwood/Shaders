//Delete this?
#ifdef ANDROID
#extension GL_OES_EGL_image_external : require
#endif

precision mediump float;

varying vec4 oUv0;

//https://github.com/spite/Wagner/blob/master/fragment-shaders/sobel-fs.glsl

uniform vec3 diffuseColour;
uniform sampler2D diffuseTexture;
uniform vec3 color;
uniform vec3 alphaColor;
uniform float glow;
uniform float m1;
uniform float m2;

void main()
{
	//original texture color
	vec3 tc = texture2D(diffuseTexture, oUv0.xy).rgb;
	// texture colors for horizontal and vertical edges
	vec3 tch = vec3(0.); 
	vec3 tcv = vec3(0.);
	tch += texture2D(diffuseTexture, vec2(oUv0.x+m1, oUv0.y)).rgb; // right
	tch += texture2D(diffuseTexture, vec2(oUv0.x-m1, oUv0.y)).rgb; // left
	tch += texture2D(diffuseTexture, vec2(oUv0.x+m1, oUv0.y+m2)).rgb; // up right
	tch += texture2D(diffuseTexture, vec2(oUv0.x-m1, oUv0.y+m2)).rgb; // up left

	tcv += texture2D(diffuseTexture, vec2(oUv0.x, oUv0.y+m2)).rgb; // up
	tcv += texture2D(diffuseTexture, vec2(oUv0.x, oUv0.y-m2)).rgb; // down
	tcv += texture2D(diffuseTexture, vec2(oUv0.x+m1, oUv0.y-m2)).rgb; // down right
	tcv += texture2D(diffuseTexture, vec2(oUv0.x-m1, oUv0.y-m2)).rgb; // down left
	//tc /= 4;

	//subtract the center from the new repeated pattern
	tch -= texture2D(diffuseTexture, oUv0.xy).rgb * 4;
	tcv -= texture2D(diffuseTexture, oUv0.xy).rgb * 4;

	// Sobel calc, not sure how this works
	vec3 edge = sqrt((tch*tch) + (tcv*tcv));
	// final color is the original + the edge pass + the shaders color mod
	vec3 finalCol = tc + (edge * glow) * color;

	
	gl_FragColor = vec4(finalCol, 1.0);
}

/*	tc = vec3((tc.r-alphaColor.r),(tc.g-alphaColor.g),(tc.b-alphaColor.b));
	float alpha = (tc.r + tc.b + tc.g)/3;*/
