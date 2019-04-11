uniform sampler2D tInput;
uniform vec2 resolution;
uniform vec3 color;
varying vec4 oUv0;

void main() {

	float x = 1.0 / resolution.x;
	float y = 1.0 / resolution.y;
	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= texture2D( tInput, vec2( oUv0.x - x, oUv0.y - y ) ) * 1.0;
	horizEdge -= texture2D( tInput, vec2( oUv0.x - x, oUv0.y     ) ) * 2.0;
	horizEdge -= texture2D( tInput, vec2( oUv0.x - x, oUv0.y + y ) ) * 1.0;
	horizEdge += texture2D( tInput, vec2( oUv0.x + x, oUv0.y - y ) ) * 1.0;
	horizEdge += texture2D( tInput, vec2( oUv0.x + x, oUv0.y     ) ) * 2.0;
	horizEdge += texture2D( tInput, vec2( oUv0.x + x, oUv0.y + y ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= texture2D( tInput, vec2( oUv0.x - x, oUv0.y - y ) ) * 1.0;
	vertEdge -= texture2D( tInput, vec2( oUv0.x    , oUv0.y - y ) ) * 2.0;
	vertEdge -= texture2D( tInput, vec2( oUv0.x + x, oUv0.y - y ) ) * 1.0;
	vertEdge += texture2D( tInput, vec2( oUv0.x - x, oUv0.y + y ) ) * 1.0;
	vertEdge += texture2D( tInput, vec2( oUv0.x    , oUv0.y + y ) ) * 2.0;
	vertEdge += texture2D( tInput, vec2( oUv0.x + x, oUv0.y + y ) ) * 1.0;
	vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));
	
	gl_FragColor = vec4( edge*color, texture2D( tInput, oUv0.xy ).a );

}