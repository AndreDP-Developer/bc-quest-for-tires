import * as THREE from 'three';
import { WIDTH, HEIGHT } from './game.js';
// Scale2x gently rounds pixel corners without inventing new character poses.
export class Renderer {
  constructor(host, pixels) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.append(this.renderer.domElement);
    this.texture = new THREE.DataTexture(pixels, WIDTH, HEIGHT, THREE.RGBAFormat);
    this.texture.minFilter = this.texture.magFilter = THREE.NearestFilter;
    this.texture.flipY = true;
    this.texture.needsUpdate = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    this.camera.position.z = 1;
    this.material = new THREE.ShaderMaterial({
      uniforms: { picture: { value: this.texture }, soft: { value: true } },
      vertexShader: `varying vec2 uv0; void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `precision highp float;
        uniform sampler2D picture; uniform bool soft; varying vec2 uv0;
        vec4 cell(vec2 p){return texture2D(picture,(clamp(p,vec2(0.),vec2(319.,199.))+.5)/vec2(320.,200.));}
        bool same(vec4 a,vec4 b){return distance(a.rgb,b.rgb)<.01;}
        void main(){vec2 p=uv0*vec2(320.,200.); vec2 i=floor(p); vec4 e=cell(i);
          if(soft && uv0.y > .17){vec4 b=cell(i+vec2(0.,1.));vec4 d=cell(i-vec2(1.,0.));
            vec4 f=cell(i+vec2(1.,0.));vec4 h=cell(i-vec2(0.,1.));vec2 q=fract(p);
            if(!same(b,h)&&!same(d,f)){
              if(q.x<.5&&q.y>=.5&&same(d,b))e=d;
              if(q.x>=.5&&q.y>=.5&&same(b,f))e=f;
              if(q.x<.5&&q.y<.5&&same(d,h))e=d;
              if(q.x>=.5&&q.y<.5&&same(h,f))e=f;
            }
          }gl_FragColor=e;
        }`,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    this.observer = new ResizeObserver(() => {
      this.renderer.setSize(host.clientWidth, host.clientHeight, false);
      this.render();
    });
    this.observer.observe(host);
  }
  render(soft = this.material.uniforms.soft.value) {
    this.material.uniforms.soft.value = soft;
    this.texture.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }
}
