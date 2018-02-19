uniform vec2 uResolution;

// Constants
const vec3 cLight = normalize(vec3(.5, .5, 1.));

void main(){
	// 1
	vec2 center = vec2(uResolution.x/2., uResolution.y/2.);
	
	// 2
	float radius = uResolution.x/2.;
	  
	// 3
	vec2 position = gl_FragCoord.xy - center;
	  
	// 4
	if (length(position) > radius) {
  		discard;
	}
	float z = sqrt(radius*radius - position.x*position.x - position.y*position.y);
	//z /= radius;
	//gl_FragColor = vec4(vec3(z), 1.);
	
	vec3 normal = normalize(vec3(position.x, position.y, z));
  	//gl_FragColor = vec4((normal+1.)/2., 1.);

	//Requires constants
  	float diffuse = max(0., dot(normal, cLight));
	gl_FragColor = vec4(vec3(diffuse), 1.);
	
}