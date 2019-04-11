//Delete this?
#ifdef ANDROID
#extension GL_OES_EGL_image_external : require
#endif

precision mediump float;

uniform sampler2D DiffuseTexture;

varying vec4 oUv0;

uniform vec2 uvPos;
uniform float uvScale;

uniform float cos_factor;
uniform float sin_factor;

uniform float alpha;

void main()
{
	vec2 uv = (oUv0.xy + uvPos) / uvScale;
	mat2 uvRot = mat2(clamp(cos_factor,-1,1), clamp(sin_factor,-1,1), clamp(-sin_factor,-1,1), clamp(cos_factor,-1,1));
	uv *= uvRot;

	vec3 inputColor = texture2D(DiffuseTexture, uv).rgb;
	gl_FragColor = vec4(inputColor, alpha);
}
