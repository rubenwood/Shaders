#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution; //ekrāna izmērs

void main( void ) {

	vec2 position = (gl_FragCoord.xy/resolution.xy) -0.5;
	float y = 0.2 * position.y* sin(300.0*position.y-20.0*time*0.35);
	y = 1.0 / (600. * abs(position.x - y));
	y += 1./(665.*length(position - vec2(0., position.y))); //izveido vertikalu liniju
	float saule = 1./(65.*length(position - vec2(0, 0)));
	//gl_FragColor = vec4(position.y*0.5 - y*saule, y*saule, y*5.0*saule, 1.0); //iekrāso pelēcīgu
	vec4 vsaule = vec4(saule, saule, saule*5., 1.0);
	vec4 vstari = vec4(position.y*0.5 - y, y, y*5., 1.0);
	gl_FragColor = mix(vsaule, vstari, 0.7);
}