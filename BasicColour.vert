attribute vec4 position;

varying vec3 colour;

void main(){
	//colour = position.xyz;
	//colour = gl_ModelViewMatrix * position; //
	colour = gl_ProjectionMatrix * position; // Static
	//colour = gl_ModelViewProjectionMatrix * position; //
	
	//gl_Position = position;
	//gl_Position = gl_Vertex;
	//gl_Position = gl_ModelViewMatrix * gl_Vertex;
	//gl_Position = gl_ProjectionMatrix * gl_Vertex;
	//gl_Position = gl_ModelViewProjectionMatrix * position;
	
	//ftransform
	//gl_Position = ftransform();
	//gl_Position = gl_ModelViewMatrix * ftransform();
	//gl_Position = gl_ProjectionMatrix * ftransform();
	//gl_Position = gl_ModelViewProjectionMatrix * ftransform();
}