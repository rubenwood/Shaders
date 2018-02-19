attribute vec4 position;
attribute vec4 uv0;

//uniform mat4 worldViewProjection;

varying vec4 v_colour;
//varying vec3 normal;
varying vec4 oUv0;

void main(){
	//normal = gl_NormalMatrix * gl_Normal;

	//gl_Position = position;
	//gl_Position = gl_Vertex;
	//gl_Position = gl_ModelViewMatrix * gl_Vertex;
	//gl_Position = gl_ProjectionMatrix * gl_Vertex;
	//gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	
	//gl_Position = worldViewProjection * position;
	
	v_colour = gl_Color; // Vertex Colour

	//ftransform
	gl_Position = ftransform();
	oUv0 = uv0;
	//gl_Position = gl_ModelViewMatrix * ftransform();
	//gl_Position = gl_ProjectionMatrix * ftransform();
	//gl_Position = gl_ModelViewProjectionMatrix * ftransform();
}