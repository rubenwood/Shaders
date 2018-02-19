#ifdef GL_ES
precision mediump float;
#endif

//// SCENE DEFINITIONS
#define TREE
//// END SCENE DEFINITIONS



//// MATH CONSTANTS
#define PI      (4.*atan(1.))       
#define TAU     (8.*atan(1.)) 
#define PI                  (4.*atan(1.))
#define ISQRT2          (sqrt(2.)/2.)
//// END MATH CONSTANTS 



//// RAY DEFINITIONS
#define ASPECT      resolution.x/resolution.y
#define EPSILON     .01
#define FOV         1.5
#define FARPLANE        4.
#define PHI     .011
#define ITERATIONS  192
//// END RAY DEFINITIONS



////SHADING PARAMETERS
#define OCCLUSION_ITERATIONS 12
#define OCCLUSION_DISTANCE .015
#define SHADOW_ITERATIONS 16
#define SHADOW_DISTANCE 8.
#define SHADOW_PENUMBRA 4.
//// END SHADING PARAMETERS


//// UNIFORMS
uniform vec2 resolution;
uniform vec2 mouse;
#define mouse ((mouse-.5)*25.)
uniform float time;
varying vec2 surfacePosition;
//// END UNIFORMS

//// STRUCTS
struct ray
{
    vec3 origin;
    vec3 position;
    vec3 direction;
    vec2 material_range;
    float steps;
}; 
    
struct surface
{
    vec4 color;
    vec3 normal;
    float range;
};  

struct light
{
    vec3 color;
    vec3 position;
    vec3 direction;
    vec3 ambient;
};  

struct material
{
    vec3  color;
    vec3  gloss;
    float refractive_index;
    float roughness;
};  
//// END STRUCTS    


    
//// HACKS
vec3 global_color_hack = vec3(0.);
//// END HACKS
    


//// HEADER 
ray         emit(ray r);
ray         view(in vec2 uv);
vec2        map(in vec3 position);
vec3        derive(in vec3 p);

material    assign_material(in float material_index);
surface     shade(in ray r, in surface s,  in material m, in light l);
float       fresnel(in float i, in float hdl);  
float       geometry(in float i, in float ndl, in float ndv, in float hdn, in float hdv, in float hdl);
float       distribution(in float r, in float ndh);
float       ambient_occlusion(vec3 p, vec3 n);
float       shadow(vec3 p, vec3 d);
vec3        hsv(in float h, in float s, in float v);

vec3        sphericalharmonic(vec3 n, in vec4 c[7]);
void        shcdusk(out vec4 c[7]);
void        shcday(out vec4 c[7]);

float           sphere(vec3 p, float r);
float           cube(vec3 p, vec3 s);
float           cylinder(vec3 p, float l, float r);
float       cylinder(vec3 p, vec3 c, float h, float r);
float           cone(vec3 p, float l, float r);
float           cone(vec3 p, float l, vec2 r);
float       capsule( vec3 p, vec3 a, vec3 b, float r );
float           torus( vec3 p, vec2 t );
vec4        noise(in vec4 f);
vec3        foldY4(vec3 p);
vec3        rotateZ(vec3 p, float a);
float       fbm( float a, float f, vec2 uv, const int it );
float       value_noise( vec2 uv ); 
    
float       smooth(float x);
float       smoothmin(float a, float b, float k);
float       smoothmax(float a, float b, float k);

mat2        rmat(in float r);
mat3        rmat(in vec3 r);
float           vector_to_angle( vec2 v );
//// END HEADER


//// SCENES
#ifdef TREE
#define VIEWPOSITION    vec3(-.55, .35, -2.42)
#define VIEWTARGET  vec3(1.5 - mouse.x * TAU, .15 + mouse.y, 0.)

#define LIGHTPOSITION   vec3(32., 24., 32.) * (vec3(rmat(time*.2) * vec2(1.), 1.).xzy)
#define LIGHTCOLOR  vec3(.85, 0.75,  0.7)
#define AMBIENTDUSK

vec2 rhash(in vec2 v) {
    const mat2 t = mat2(.12121212,.13131313,-.13131313,.12121212);
    const vec2 s = vec2(1e4, 1e6);
    v *= t;
    v *= s;
    return  fract(fract(v/s)*v);
}
vec2 map(in vec3 position)
{
    vec2 material_range = vec2(0.);

    vec3  p = position;
    vec3 np = p;
    
    p.z += time * .05;
    p.x += cos(time*.0125) * 2.;
    
    float fn = fbm(.5, 2., p.xz * .5, 2) * .25;
    p.y += fn;
    np   = vec3(p.x-p.z-.4, p.y, p.z-p.x+.015);
        float lp = length(8.*(p+p.x+p.z)-vec3(0., 24., 0.))-p.y;
    
    vec4 n = max(vec4(.5), mix(noise(vec4(12.*np, lp*.5)),vec4(.125), -1.5+p.y)-.25);

    p.xz = mod(p.xz, 1.5) - .75;
    p.xz -= .25*p.xz*rmat(floor(p.x+p.z)*1.);
    
    vec3  o = p; //origin
        
    vec3 tp = abs(.5 * n.xzy) + vec3(12., 2., 4.) * np - fn;
    float texture        = abs(fract(abs(fract(abs(fract(tp.y)-.5)-tp.x)-.5)-tp.z)-.5)*(1.5-p.y);
        
    o   +=  .075 * n.xyz * (1.5 - max(.5, 4.5-p.y*2.));

    vec2 m  = vec2(1.015, 1.);
    
    float r = m.y;                                 //rotation
    
    float w = m.x*.1/length(o+vec3(0., .45+r, 0.)); //branch width

    float f = .95;
    float a = (cos(3.*time+p.z+p.y-sin(p.x+time*.15)*.13*n.x)-.5)*.0025+.025;
    float t = FARPLANE;                                //tree
    for (int i = 0; i < 6; i++)
    {
            t = smoothmin(t, cylinder(o, vec3(0.0), r+.5, w)/f, 9.+float(i)*.25);
        o = 1.35 * o + a;                            //length change across iterations
        f = 1.25 * f;                                //thickness change across iterations
        o = foldY4(o);                              //branching
        o = rotateZ(o,r+a*1.5);

        o.x -= -r;                                  //rotate
        r += .15 + fn;
        o.y -= 1.+r-p.y*p.y*.75;                    //translate and rotate
    }
    
    t   -= .025;                                    //additioal thickness adjustment
        float l = length(o*vec3(.5, .5, 1.));           //leaves
    l   *= .015;
    l   = min(l, FARPLANE);

    t   -= texture*.05;
    material_range.x         = t < l ? 1. : 2.;

    t       = min(t, l);
    

    float g     = p.y;
        float md        = .025;
        p.xz            += .0125 * cos(time * .5 + p.x * .02 + sin(p.z*8.) - cos(p.x * 4.)) * (.5 + 2. * p.z * p.y);
    
        vec2 rp     = rhash(floor(p.xz * 32.));
        float gl    = length(rp);
        p.xz        *= rmat(gl * .5);
        p.xz            = mod(p.xz, md) - .5 * md;
        p.x         *= .5;
        float b         = cone(p + vec3(0., .5 - gl * .1, 0.), .25+fn, .05);
        g               = min(g, b);
        g       = p.y > .5 ? FARPLANE : g;
    material_range.x         = t < g ? material_range.x : 3.;
    
    t -= .0125;
    t = min(g, t);
    t = min(t, abs(t));
    material_range.y         = t;
    
    global_color_hack = p;
    
    return material_range;
}
#endif
//// END SCENES




//// MAIN
void main( void ) 
{
    vec2 uv     = gl_FragCoord.xy/resolution.xy;
    ray r       = view(uv);
    
    r       = emit(r);
    
    vec4 result = vec4(0.);
    
    vec4 ambientCoefficients[7];
    
    #ifdef AMBIENTDAY
        shcday(ambientCoefficients);
    #endif
    
    #ifdef AMBIENTDUSK
        shcdusk(ambientCoefficients);
    #endif
    light l         = light(vec3(0.), vec3(0.), vec3(0.), vec3(0.));
    l.color         = LIGHTCOLOR;   
    l.position  = LIGHTPOSITION;    
    l.direction = normalize(l.position-r.position);
    
    float distanceFog = clamp(r.material_range.y/FARPLANE, 0., 1.);
    float stepFog     = clamp(r.steps/float(ITERATIONS), 0., 1.);
        float fog         = min(distanceFog, stepFog);
    
    vec3 sky = sphericalharmonic(r.direction-l.direction, ambientCoefficients);
    
    if(r.material_range.x != 0. && fract(r.material_range.x) < 1.)
    {       
        surface s   = surface(vec4(0.), vec3(0.), 0.);
        s.color         = result;
        s.range         = distance(r.position, r.origin);
        s.normal    = derive(r.position);

        material m  = assign_material(floor(r.material_range.x));
        
        
        l.ambient   = sphericalharmonic(s.normal-l.direction, ambientCoefficients);
        
        s           = shade(r, s, m, l);
        
        result          = s.color;
    }
    else
    {
        result.xyz  = sky+sky*.5*fog+.5*(1.-uv.y*distanceFog);;
        result.w    = 1.;
    }
    
    result.xyz = mix(result.xyz, sky*fog*distanceFog+(1.-uv.y*distanceFog), distanceFog)+sky*distanceFog;
    
    gl_FragColor = result;
}// sphinx
//// END MAIN


//// RENDERING
//emit rays to map the scene, stepping along the direction of the ray by the  of the nearest object until it hits or goes to far
ray emit(ray r)
{
    r.material_range    = map(r.position);
        float total_range   = r.material_range.y;
        float threshold     = PHI * 2./float(ITERATIONS);
    for(int i = 0; i < ITERATIONS; i++)
    {
            if(total_range < FARPLANE)
            {
            if(r.material_range.y < threshold && r.material_range.y > 0.)
                {
                      r.material_range.x += r.material_range.y;
                          r.material_range.y = total_range;
                                              r.steps            = float(i);
                                  break;    
                }
            
                threshold          *= 1.05;
                r.position         += r.direction * r.material_range.y * .65;
            
                r.material_range   = map(r.position);
                if(r.material_range.y < 0.) r.material_range.y += threshold;            
                total_range        += r.material_range.y;
            }
            else
            {
                r.material_range.y = length(r.origin + r.direction * FARPLANE);
                r.material_range.x = 0.;
                r.steps            = float(i);
                break;
            }
    }
    return r;
}

//transform the pixel positions into rays 
ray view(in vec2 uv)
{ 
    uv          = uv * 2. - 1.;
    uv.x        *= resolution.x/resolution.y;
        
    vec3 w          = normalize(VIEWTARGET-VIEWPOSITION);
    vec3 u          = normalize(cross(w,vec3(0.,1.,0.)));
    vec3 v          = normalize(cross(u,w));
    
    ray r           = ray(vec3(0.), vec3(0.), vec3(0.), vec2(0.), 0.);
    r.origin        = VIEWPOSITION;
    r.position      = VIEWPOSITION;
    r.direction     = normalize(uv.x*u + uv.y*v + FOV*w);;

float yy = radians(180.*(gl_FragCoord.y/resolution.y-.5));
float xz = radians(360.*(gl_FragCoord.x/resolution.x-.5));
r.direction = vec3(sin(xz)*cos(yy), sin(yy), cos(xz)*cos(yy));
// 360 all of the things
    
    r.material_range    = vec2(0.);
    r.steps         = 0.;
    
    return r;
}   

//find the normal by comparing offset samples on each axis as a partial derivative
vec3 derive(in vec3 p)
{
    vec2 offset     = vec2(0., EPSILON);

    vec3 normal     = vec3(0.);
    normal.x    = map(p+offset.yxx).y-map(p-offset.yxx).y;
    normal.y    = map(p+offset.xyx).y-map(p-offset.xyx).y;
    normal.z    = map(p+offset.xxy).y-map(p-offset.xxy).y;
    
    return normalize(normal);
}
//// END RENDERING



//// SHADING
surface shade(in ray r, in surface s,  in material m, in light l)
{
    //http://simonstechblog.blogspot.com/2011/12/microfacet-brdf.html
    //view and light vectors
    vec3 view_direction = normalize(r.origin-r.position);       //direction into the view
    vec3 half_direction = normalize(view_direction+l.direction);    //direction halfway between view and light
    
    
    //exposure coefficients
        float light_exposure    = dot(s.normal, l.direction);           //ndl
    float view_exposure = dot(s.normal, view_direction);        //ndv
    
    
    float half_view     = dot(half_direction, view_direction);      //hdn   
    float half_normal   = dot(half_direction, s.normal);            //hdv
    float half_light    = dot(half_direction, l.direction);         //hdl
    
    //lighting coefficient

    float g             = geometry(m.roughness, light_exposure, view_exposure, half_normal, half_view, half_light);
    float d             = distribution(m.refractive_index, half_normal);
        float f             = fresnel(m.refractive_index, half_light);
    float n         = clamp(1. - fresnel(m.refractive_index, light_exposure) * pow(light_exposure, 5.), 0., 1.);
    
    //shadow and occlusion projections
    vec3 offset = s.normal * EPSILON * 2.;
    float occlusion     = ambient_occlusion(r.position+offset, s.normal);
    float shadows       = shadow(r.position+offset, l.direction);

    //bidrectional reflective distribution function
    float brdf              = (g+d+f)/(4.+(view_exposure*light_exposure));

        float distanceFog       = clamp(r.material_range.y/FARPLANE, 0., 1.);
        float stepFog           = clamp(r.steps/float(ITERATIONS), 0., 1.);
        float fog               =  min(distanceFog, stepFog);
    
        vec3 ambient_light      = clamp(l.ambient, 0., 1.) * fog;

    
        occlusion     = max(occlusion, fog);
        shadows       = max(shadows, .14);
    
    
    // compositing
    s.color.xyz     = m.color + m.color * brdf * l.color;
    s.color.xyz     *= occlusion * l.color * shadows;
    s.color.xyz     += light_exposure * fog * ambient_light * shadows;
    s.color.w       = 1.;
    
    return s;
}

float fresnel(in float i, in float hdl)
{   
    return i + (1.33-i) * pow(1.-max(hdl, 0.), 5.);
}

float geometry(in float i, in float ndl, in float ndv, in float hdn, in float hdv, in float hdl)
{
    float k         = i * sqrt(2./PI);
    float ik        = 1. - k;
    ndv         = max(0., ndv);
    ndl         = max(0., ndl);
    return (ndv / (ndv * ik + k)) * (ndl / (ndl * ik + k));
}

float distribution(in float r, in float ndh)
{  
    float m     = 1./(r*r) - 3.;
    return (m+2.) * pow(max(ndh, 0.0), m) / TAU;
}

float ambient_occlusion(vec3 p, vec3 n)
{
    float a       = 1.; 
    const float r = OCCLUSION_DISTANCE;
    float d       = 1.-r/float(OCCLUSION_ITERATIONS);
    for(int i = 0; i < OCCLUSION_ITERATIONS; i++ )
    {
            float hr = r + r * float(i);
            vec3  op = n * hr + p;
            float e  = map(op).y;
            a    += (e-hr) * d;
            d    *= d;
    }
    return max(0., a);
}

float shadow(vec3 p, vec3 d)
{
    //http://glslsandbox.com/e#20224.0 < adapted from here
    float k = SHADOW_PENUMBRA;
    float s = 1.;
        float t = EPSILON;
    float h = 0.0;
    for(int i = 0; i < SHADOW_ITERATIONS; i++) {
        if(t > SHADOW_DISTANCE) continue;
            h = map(p + d * t).y;
        s = min(s, k * h / t);
        t += h;
    }
    return max(0.5, s);
}

vec3 hsv(in float h, in float s, in float v){
    return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}

vec3 sphericalharmonic(vec3 n, in vec4 c[7])
{     
        vec4 p = vec4(n, 1.);
   
        vec3 l1 = vec3(0.);
        l1.r = dot(c[0], p);
    l1.g = dot(c[1], p);
    l1.b = dot(c[2], p);
    
    vec4 m2 = p.xyzz * p.yzzx;
    vec3 l2 = vec3(0.);
    l2.r = dot(c[3], m2);
    l2.g = dot(c[4], m2);
    l2.b = dot(c[5], m2);
    
    float m3 = p.x*p.x - p.y*p.y;
    vec3 l3 = vec3(0.);
    l3 = c[6].xyz * m3;
        
    vec3 sh = vec3(l1 + l2 + l3);
    
    return clamp(sh, 0., 1.);
}

//sh light coefficients
void shcdusk(out vec4 c[7])
{
    c[0] = vec4(0.2, .77, 0.2, 0.45);
    c[1] = vec4(0.2, .63, 0.2, 0.25);
    c[2] = vec4(0.0, .13, 0.1, 0.15);
    c[3] = vec4(0.1, -.1, 0.1, 0.0);
    c[4] = vec4(0.1,-0.1, 0.1, 0.0);
    c[5] = vec4(0.2, 0.2, 0.2, 0.0);
    c[6] = vec4(0.0, 0.0, 0.0, 0.0);
}


void shcday(out vec4 c[7])
{
    c[0] = vec4(0.0, 0.5, 0.0, 0.4);
    c[1] = vec4(0.0, 0.3, .05, .45);
    c[2] = vec4(0.0, 0.3, -.3, .85);
    c[3] = vec4(0.0, 0.2, 0.1, 0.0);
    c[4] = vec4(0.0, 0.2, 0.1, 0.0);
    c[5] = vec4(0.1, 0.1, 0.1, 0.0);
    c[6] = vec4(0.0, 0.0, 0.0, 0.0);   
}
//// END SHADING



////MATERIALS
material assign_material(in float material_index)
{
    material m;
    
    if(material_index == 1.)
    {
        vec3 position = global_color_hack;
        vec3 c0 = vec3(.85, .5, .4);
                vec3 c1 = vec3(.45, .5, .1);
                float b = clamp(.25+position.y*.125, 0., 1.);
            m.color = mix(c0, c1, b);
        m.gloss             = vec3(.95);
        m.refractive_index  = .4;
        m.roughness     = .2;   
    }
    else if(material_index == 2.)
    {
        vec3 position = global_color_hack;
        vec3 c0 = vec3(.4, .76, .51);
            vec3 c1 = vec3(.6, .8, .3);
                float b = clamp(1.-length(position)*.25, 0., 1.);
            m.color = mix(c0, c1, b);
        m.gloss             = vec3(.75, .75, .85);
        m.refractive_index  = .2;
        m.roughness     = .2;   
    }
    else if(material_index == 3.)
    {
        vec3 position = global_color_hack;
        vec3 c0 = vec3(.24, .6, .2);
                vec3 c1 = vec3(.6, .8, .3);
                float b = clamp(1.-length(position)*.25, 0., 1.);
                m.color = mix(c0, c1, b);
                m.gloss             = vec3(.75, .75, .85);
        m.refractive_index  = .1;
        m.roughness     = .4;   
    }
    else
    {
            m.color             = vec3(1.);
        m.gloss             = vec3(.5);
        m.refractive_index  = .5;
        m.roughness     = .5;   
    }
    return m;
}
////



//// CURVES
float smooth(float x)
{
    return x*x*(3.-2.*x);
}

float smoothmax(float a, float b, float k)
{
    return log(exp(k*a)+exp(k*b))/k;
}

float smoothmin(float a, float b, float k)
{
    return -(log(exp(k*-a)+exp(k*-b))/k);
}
//// END CURVES



//// DISTANCE FIELD FUNCTIONS
//primitives
float sphere(vec3 p, float r){
    return length(p)-r;     
}

float cube(vec3 p, vec3 s)
{
    vec3 d = (abs(p) - s);
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}


float cylinder(vec3 p, vec3 c, float h, float r)
{
    p -= c;

    return max(abs(p.y) - 0.5 * h, length(p.xz) - r);
}

float cylinder(vec3 p, float l, float r)
{
   return max(abs(p.y-l)-l, length(p.xz)-r);
}

float cone(vec3 p, float l, float r)
{
    return max(length(p.xz)-r*(1.-(p.y*.5)/max(r, l)), abs(p.y-l)-l);
}

float cone(vec3 p, float l, vec2 r)
{
    float m = 1.-(p.y*.5)/l;
    return max(length(p.xz)-mix(r.y, r.x, m), abs(p.y-l)-l);
}

float capsule( vec3 p, vec3 a, vec3 b, float r )
{
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    
    return length( pa - ba*h ) - r;
}

float torus( vec3 p, vec2 t )
{
    vec2 q = vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
}

vec3 foldY4(vec3 p)
{
    p.xz = vec2(p.x + p.z, p.z - p.x) * 2./sqrt(2.);
    p.xz = abs(p.x) > abs(p.z) ? p.xz * sign(p.x) : vec2(p.z,-p.x) * sign(p.z);
    return p;
}

vec3 rotateZ(vec3 p, float a)
{
    float c = cos(a);
    float s = sin(a);

    return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}

float tree(float a, float p, vec2 uv){
    float t;
    t = fract(uv.y*p) + .5;
    t *= a;
    return t;
}  

vec4 noise(in vec4 f)
{
    vec4 r = vec4(.0);
    vec4 s = vec4(1.);
    float a = 1.;
    
    const vec4 b = vec4(24.574, 18.343, 30.153, 40.121);
    const vec4 c = vec4(2.251, 3.124, 5.123, 4.241);
    
    const int it = 6;
    
    for ( int i = 0; i < it; i++ )
    {
        f += float(i);
        vec4 sa = (sin(f * b) + 1.0);
        vec4 sb = (sin(f * c) + 1.0);
        
        // Add up 'octaves'.
        r += sa * a;
        a *= 3.;
        
        // A variation of using dot(f, axis[i]), and variation of frequency (sort of like an octave), and addtional perturbation.
        f = (f.yxwz * 0.5) + (sb * 0.08);
    }

    return normalize(r);
}

float value_noise( vec2 uv ) 
{
    const float k = 257.;
    vec4 l  = vec4( floor( uv ), fract( uv ) );
    float u = l.x + l.y * k;
    vec4 v  = vec4( u, u + 1.,u + k, u + k +1. );
    v       = fract( fract( v * 1.23456789 ) * 9.18273645 * v );
    l.zw    = l.zw * l.zw * ( 3. -2. * l.zw );
    l.x     = mix( v.x, v.y, l.z);
        l.y     = mix( v.z, v.w, l.z);
        return    mix( l.x, l.y, l.w);
}


//fractal brownian motion
float fbm( float a, float f, vec2 uv, const int it )
{
    float n = 0.;
    uv = ( 32.5 + uv ) * rmat(.61);
    vec2 p = vec2( .3, .7 );
    for(int i = 0; i < 32; i++)
    {
            if( i < it )
        {
                    n += value_noise( uv * f + p ) * a;
            a *= .5;
            f *= 2.;
            }
            else
            {
                break;
            }
        }
        return n;
}

//// END DISTANCE FIELD FUNCTIONS



//// ROTATION
float vector_to_angle( vec2 v )
{
    return fract( atan( v.x, v.y ) / TAU ) ;
}

mat2 rmat(in float r)
{
    float c = cos(r);
    float s = sin(r);
    return mat2(c, s, -s, c);
}

//3d rotation matrix
mat3 rmat(in vec3 r)
{
    vec3 a = vec3(cos(r.x)*cos(r.y),sin(r.y),sin(r.x)*cos(r.y));
    
    float c = cos(r.z);
    float s = sin(r.z);
    vec3 as  = a*s;
    vec3 ac  = a*a*(1.1- c);
    vec3 ad  = a.yzx*a.zxy*(1.-c);
    mat3 rot = mat3(
        c    + ac.x, 
        ad.z - as.z, 
        ad.y + as.y,
        ad.z + as.z, 
        c    + ac.y, 
        ad.x - as.x,
        ad.y - as.y, 
        ad.x + as.x, 
        c    + ac.z);
    return rot; 
}
//// END ROTATION MATRICES


