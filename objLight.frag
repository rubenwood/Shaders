uniform vec2 res;

// Constants
const vec3 cLight = normalize(vec3(.5, .5, 1.));

void main(){
	// // 1
	// vec2 center = vec2(uResolution.x/2., uResolution.y/2.);
	
	// // 2
	 float radius = res.x/2.;
	  
	// 3
	vec2 pos = gl_FragCoord.xy;
	  
	// 4
/*	if (length(pos) > radius) {
  		discard;
	}*/
	float z = sqrt(radius*radius - pos.x*pos.x - pos.y*pos.y);
	//z /= radius;
	//gl_FragColor = vec4(vec3(z), 1.);
	
	vec3 normal = normalize(vec3(pos.x, pos.y, z));
  	//gl_FragColor = vec4((normal+1.)/2., 1.);

	//Requires constants
  	float diffuse = max(0., dot(normal, cLight));
	gl_FragColor = vec4(vec3(diffuse), 1.);
	
}