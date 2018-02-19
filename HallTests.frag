uniform vec3 colour;
uniform float glow;
uniform float alpha;

varying vec4 v_colour;

uniform float m1;


void main(){

	vec3 fc = v_colour*colour*glow; // calculate final colour
	//fc *= vec3(sin(m1)/cos(m1));
	gl_FragColor = vec4(fc,alpha);
}