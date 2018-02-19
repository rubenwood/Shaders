uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;
uniform vec4 color4;
varying vec4 v_normal;
varying vec4 v_lightdir;
varying vec4 v_eye;

void main(){
	vec4 color;
  	vec3 L = normalize(v_lightdir.xyz);
  	vec3 N = normalize(v_normal.xyz);
	float intensity = dot(L, N);
	
	if (intensity > 0.95)
		color = color1;
	else if (intensity > 0.5)
		color = color2;
	else if (intensity > 0.25)
		color = color3;
	else
		color = color4;
	gl_FragColor = color;
}