varying vec3 normal;
varying vec4 pos;

void main(){
	normal = gl_NormalMatrix * gl_Normal;

	pos = ftransform();
	
	gl_Position = ftransform();

}