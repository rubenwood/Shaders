#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float PI = 3.141592653589793238;

float random( in vec2 _st )
{
	return fract( sin( dot( _st.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.543123 );
}

float noise( in vec2 _st )
{
	vec2 i = floor( _st );
	vec2 f = fract( _st );
	
	float a = random( i );
	float b = random( i + vec2( 1.0, 0.0 ) );
	float c = random( i + vec2( 0.0, 1.0 ) );
	float d = random( i + vec2( 1.0, 1.0 ) );
	
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	u = smoothstep( 0.0, 1.0, f );
	
	return mix( a, b, u.x ) + ( c - a ) * u.y * ( 1.0 - u.x ) + ( d - b ) * u.x * u.y;
}

void main()
{
	vec2 st       = gl_FragCoord.xy / resolution.xy;
	vec2 toCenter = vec2( 0.5, 1.25 ) - st;
	float angle   = atan( toCenter.y, toCenter.x );
	float bri     =  pow( noise( vec2( angle + noise( vec2(time)*0.05 ) ) * 7.0  + time * 0.4  ), 0.8 );
	vec4 color = vec4( 0.0, st.y * 0.4,  st.y * 0.8, 1.0 );
	
	color    += vec4( vec3( bri ) * ( 1.2 - length(toCenter) ) * smoothstep( PI  * 0.25, PI * 0.4, angle ) * smoothstep( PI -PI * 0.25, PI - PI * 0.4, angle ), 1.0 );
	
	vec3 fc = color.xyz;
	float alpha = (fc.x+fc.y+fc.z)/3; //Create alpha

	gl_FragColor = vec4(fc, alpha);
}