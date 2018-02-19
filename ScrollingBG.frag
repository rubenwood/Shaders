#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

//MODS BY 27

#define PI 3.14159265359

void main( void ) {

	vec2 position = 2. * (( gl_FragCoord.xy / resolution.xy ) - 0.5);
	position.x *= resolution.x / resolution.y;
	
	vec2 pos = vec2(position.x / abs(position.y), tan(mix(PI/2.0, PI/4.0, abs(position.y))) );

	pos.x += 0.025 * (time * 3. * PI);
	pos.y += time * 3.;
	
	float tile = mod(floor(pos.x*0.333) + floor(pos.y*0.333), 2.);
	
	vec3 finalColor;
	finalColor += (0.7 + 0.3 * tile) * vec3(0.5, 1.0, 0.1) * step(position.y, 0.);
	
	float top = 0.27;
	
	for (float i = 0.; i < 8.; i++) {
		top += sin(position.x * 1.25 * pow(2., i)) / pow(2., i);
	}
	
	top = pow(abs(top-0.25)+0.25, 3.333);
	top += pow(0.175*abs(top-1.), 8.);
	top *= 0.05;
	
	float hillZone = step(position.y - top, 0.1) * step(0., position.y);
	
	vec3 hill = vec3(0.5, 1.0, 0.1);
	
	vec3 sky = (1.5- position.y) * vec3(0.25, 0.75, 1.0);
	sky += vec3(2., 1.25, 0.5) * (0.025 / distance(position, vec2(1.0, 0.75)));
	finalColor += sky * step(0., position.y);
	
	finalColor -= hillZone * hill*0.125;
	
	gl_FragColor = vec4( finalColor, 1.0 );

}