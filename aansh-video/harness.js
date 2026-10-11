global.window=global; const fs=require('fs');
function mkctx(){const g={addColorStop(){}};const t={measureText:(s)=>({width:(''+s).length*20}),createLinearGradient:()=>g,createRadialGradient:()=>g,createPattern:()=>({}),getImageData:(a,b,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),arc(x,y,r){if(!(r>=0))throw Error('bad arc '+r)},ellipse(x,y,a,b){if(!(a>=0&&b>=0))throw Error('bad ell '+a+' '+b)},roundRect(){}};return new Proxy(t,{get(o,k){if(k in o)return o[k];return typeof k==='string'&&/^[a-z]/.test(k)?(()=>{}):o[k]},set(o,k,v){o[k]=v;return true}})}
global.document={createElement:()=>({getContext:mkctx,width:0,height:0})};
global.FRAME=[1920,1080];
for(const f of process.argv.slice(2)) eval(fs.readFileSync(f,'utf8'));
FILM.init();const c=mkctx();const step=+process.env.STEP||1/15;for(let t=0;t<FILM.DUR;t+=step){try{FILM.render(c,t)}catch(e){console.log(t.toFixed(2),e.stack.split('\n').slice(0,4).join(' | '));process.exit(1)}}console.log('ok');
