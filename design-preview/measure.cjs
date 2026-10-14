const fs=require('node:fs'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('landmark-art.js','utf8'),ctx);
const art=vm.runInContext('LandmarkArt',ctx);
const stats={};
for(const [key,value] of Object.entries(art)){
 const svg=value.render();
 stats[key]={nodes:(svg.match(/<(?:rect|path|g)\b/g)||[]).length,bytes:Buffer.byteLength(svg)};
}
const start=performance.now();
for(let i=0;i<100;i++)for(const value of Object.values(art))value.render();
console.log(JSON.stringify({scriptBytes:fs.statSync('script.js').size,stats,render1000Ms:Math.round(performance.now()-start)},null,2));
