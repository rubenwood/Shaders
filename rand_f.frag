uniform vec3 diffuseColor;
uniform sampler2D diffTexture;

/*uniform vec3 ambient;
uniform vec3 specular;
uniform vec3 emissive;*/
uniform float alpha;
//uniform float switchVal;

varying vec4 color;

varying vec3 N;
varying vec3 v;

varying vec4 oUv0;

void main(){
	//gl_FragColor = vec4(color.rgb,alpha);
	//gl_FragColor = vec4(diffuseColor,alpha);

	vec3 L = normalize(gl_LightSource[0].position - v); // v = gl_ModelViewMatrix * gl_Vertex
	vec4 Idiff = gl_FrontLightProduct[0].diffuse * max(dot(N,L), 0.0); // diffuse * dot product of normal and light position, 0.0f means direction
	Idiff = clamp(Idiff, 0.0, 1.0);

	vec3 texcolor = texture2D(diffTexture, oUv0.xy).rgb;

	gl_FragColor = vec4(diffuseColor * Idiff, alpha);
}