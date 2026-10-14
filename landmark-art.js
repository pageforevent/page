/* Every visible landmark is drawn on a 160 × 120 integer pixel grid. */
const LandmarkArt = (() => {
 const ink='#292b48', cream='#fff0c5', pink='#fa81ab', blue='#326a9d';
 const r=(x,y,w,h,c,cls='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${cls ? ` class="${cls}"` : ''}/>`;
 function line(x0,y0,x1,y1,c,size=1){
  let out='', dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;
  for(;;){out+=r(x0,y0,size,size,c);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
  return out;
 }
 const group=(cls,body)=>`<g class="${cls}">${body}</g>`;
 function windows(x,y,w,h){let s='';for(let yy=y;yy<y+h;yy+=7)for(let xx=x;xx<x+w;xx+=6)s+=r(xx,yy,2,3,'var(--px-window)');return s;}
 function house(x,y,w,h,c){return r(x,y,w,h,ink)+r(x+1,y+2,w-2,h-2,c)+r(x-1,y,w+2,2,cream)+windows(x+3,y+5,w-5,h-7);}
 function tree(x,y){
  const trunk=r(x+5,y+10,3,15,'#795557');
  const canopy=group('px-deciduous-canopy',r(x+2,y+3,10,14,'var(--season-leaf)')+r(x,y+8,16,8,'var(--season-leaf)')+r(x+2,y+11,4,4,'var(--season-leaf-shadow)'));
  const buds=group('px-season-spring',r(x+3,y+6,3,3,'#ff8faf')+r(x+9,y+10,3,3,'#ffe3ec')+r(x+1,y+12,3,2,'#ffb9cb'));
  const bare=group('px-season-winter',line(x+6,y+13,x+1,y+7,'#795557')+line(x+6,y+15,x+13,y+7,'#795557')+line(x+6,y+10,x+6,y+3,'#795557'));
  return trunk+canopy+buds+bare;
 }
 function mountain(){let s='';for(let x=0;x<160;x+=4){const top=46+Math.round(9*Math.sin(x/17)+6*Math.cos(x/9));s+=r(x,top,4,90-top,'var(--season-hill)');}return s;}
 function sea(y=86){let marks='';for(let i=0;i<28;i++)marks+=r((i*37)%155,y+3+(i*7)%(117-y),3+i%5,1,i%3?'#68b9c3':'#9be3d4');return r(0,y,160,120-y,'var(--px-sea)')+group('px-water-mark',marks);}
 function boat(x,y){return group('px-boat',r(x+2,y,12,3,cream)+r(x+4,y+3,8,2,pink)+r(x+6,y-5,5,5,cream)+r(x+7,y-4,2,2,blue)+r(x,y+7,18,1,'#91e1d2'));}
 function person(x,y,color=pink,travel=8,dy=0,duration=14,phase=0){
  const sprite=r(1,0,3,1,ink)+r(1,1,3,2,'#edbe9b')+r(0,3,5,4,color)
   +group('px-season-winter',r(0,3,5,5,'#68597d')+r(0,3,5,1,'#e8bd72')+r(4,4,1,2,'#e8bd72'))
   +r(0,7,2,1,ink)+r(3,7,2,1,ink)
   +group('px-stride-a',r(0,8,2,2,ink)+r(3,8,2,1,ink))
   +group('px-stride-b',r(0,8,2,1,ink)+r(3,8,2,2,ink));
  // Keep each local walk on its path; moving the inner group preserves the anchor.
  return `<g class="px-person" transform="translate(${x} ${y})"><g class="px-walker" style="--walk-x:${travel}px;--walk-y:${dy}px;--walk-steps:${Math.max(Math.abs(travel),Math.abs(dy),1)};--walk-duration:${duration}s;--walk-delay:${phase}s">${sprite}</g></g>`;
 }
 function crowd(points){return points.map((p,i)=>person(...p)).join('');}
 function pine(x,y){
  return line(x+7,y+8,x+4,y+28,'#735752',2)+line(x+7,y+14,x+15,y+8,'#735752',2)
   +r(x,y+7,21,4,'var(--season-pine)')+r(x+4,y+3,15,4,'var(--season-pine)')
   +r(x-3,y+13,13,3,'var(--season-pine)')+r(x+12,y+10,13,4,'var(--season-pine)');
 }
 function roof(x,y,w){let s='';for(let i=0;i<5;i++)s+=r(x+i*3,y-i*2,w-i*6,2,i%2?'#384b67':'#252e48');return s+r(x,y+2,w,2,'#f4ab84');}
 function seasonDetails(key){
  // Foreground plants are rooted outside the frame, never floating in the sea.
  const coastal=['gwangan','jagalchi','nurimaru','haeundae','huinnyeoul'].includes(key);
  const base=coastal?120:117;
  let spring='',summer='',autumn='',winter='';
  for(const x of [0,5,10,145,151,157]){
   spring+=r(x,base-10,1,10,'#639970')+r(x-2,base-13,5,3,'#ffa6c3')+r(x-1,base-15,3,7,'#ffc8dc')+r(x,base-12,1,1,'#fff2a8');
   summer+=r(x,base-15,2,15,'#285f50')+r(x-3,base-10,5,4,'#3da879')+r(x+1,base-15,4,4,'#6dc38a');
   autumn+=r(x,base-11,1,11,'#805841')+r(x-2,base-13,4,4,'#e47443')+r(x+1,base-8,3,3,'#f4c25b');
   winter+=r(x,base-14,1,14,'#827484')+line(x,base-7,x-3,base-10,'#827484')+line(x,base-10,x+3,base-13,'#827484');
  }
  if(!coastal)for(let i=0;i<16;i++){
   const x=18+(i*23)%125,y=112+i%6;
   spring+=r(x,y,2,1,'#ffc0d6');autumn+=r(x,y,3,1,i%2?'#de7444':'#eec058');
   winter+=r(x,y,1,3,'#9a8d91');
  }
  if(key==='ahopsan')spring+=r(62,109,2,7,'#8cbf71')+r(60,111,6,1,'#8cbf71');
  return group('px-season-spring',spring)+group('px-season-summer',summer)+group('px-season-autumn',autumn)+group('px-season-winter',winter);
 }
 const scenes={
 gwangan(){
  let s=sea(84)+r(0,70,160,7,'#426f91');
  for(let x=0;x<160;x+=8)s+=house(x,58-(x%24),7,19+(x%24),'#8bb5c4');
  // Two portal towers carry cables; the two road decks pass through them.
  for(const x of [43,108]){
   s+=r(x,24,5,73,cream)+r(x+20,24,5,73,cream);
   s+=r(x+4,28,17,4,cream)+r(x+6,32,13,3,cream)+r(x+8,35,9,2,cream);
   s+=r(x-2,22,9,3,'#ded8c5')+r(x+18,22,9,3,'#ded8c5');
   s+=r(x+4,83,17,3,cream)+r(x+6,86,13,2,cream)+r(x+8,88,9,2,cream);
   s+=r(x-5,97,35,4,'#eadba6')+r(x-3,101,31,2,'#a99588');
  }
  const points=[[0,64],[12,58],[24,49],[36,35],[45,24],[55,37],[65,24],[76,41],[87,54],[98,60],[110,24],[120,37],[130,24],[141,45],[159,63]];
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];s+=line(...a,...b,cream);}
  for(let x=4;x<160;x+=5){let seg=points.findIndex((p,i)=>i&&p[0]>=x);const a=points[seg-1],b=points[seg];let y=Math.round(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]));s+=r(x,y,1,69-y,'#e8e2c6');}
  s+=r(0,69,160,3,cream)+r(0,72,160,2,'#666e86')+r(0,81,160,2,cream);
  for(let x=0;x<160;x+=8)s+=line(x,75,x+4,80,cream)+line(x+4,80,x+8,75,cream);
  s+=group('px-car',r(12,67,7,2,pink)+r(14,65,3,2,cream))+group('px-car px-car-second',r(80,67,7,2,'#d8ed78')+r(82,65,3,2,cream));
  return s+boat(91,108);
 },
 gamcheon(){let s=mountain()+r(0,105,160,15,'var(--season-ground)');const colors=[pink,'#f5c85a','#81c2ce','#a397d5',cream];for(let row=0;row<4;row++)for(let col=0;col<7;col++){let x=col*25-8+(row%2)*10,y=42+row*17+(col%3)*4;s+=house(x,y,22,17,colors[(row+col)%5])+r(x+3,y-4,16,4,colors[(row+col+2)%5]);}s+=r(0,111,160,3,cream)+crowd([[103,101,pink,14,0,16,-3],[29,101,'#83bbca',12,0,14,-7],[69,101,'#e9b850',-10,0,18,-9]]);return s;},
 nurimaru(){
  let s=sea(62);
  for(let x=0;x<100;x+=4){const top=43+Math.floor(x/15);s+=r(x,top,4,50,'#3c7468');}
  for(const [x,y] of [[0,30],[14,34],[28,35],[42,38],[132,44]])s+=pine(x,y);
  // Low circular glass hall, shallow dome and a few angled structural supports.
  s+=r(37,88,92,6,'#5a786a')+r(30,94,107,5,'#818b86');
  for(let i=0;i<10;i++)s+=r(29+i*11,97+(i%3)*2,9,4,i%2?'#acb6ab':'#616d7b');
  for(let x=48;x<132;x+=2){
   const edge=Math.abs((x-89)/43),lower=76-Math.round(4*edge);
   s+=r(x,61,2,lower-61,edge>.7?'#5c8fa0':'#90c9cf');
   s+=r(x,lower,2,3,cream);
  }
  for(let x=55;x<129;x+=9)s+=r(x,63,1,10,'#d8ede0')+r(x+2,65,3,1,'#aedcd7');
  for(const [x,d] of [[52,-4],[69,-2],[108,2],[123,4]])s+=line(x,78,x+d,90,cream,2);
  s+=r(49,59,82,3,cream);
  for(let x=43;x<137;x+=2){
   const t=(x-90)/47,top=60-Math.round(15*Math.sqrt(Math.max(0,1-t*t)));
   s+=r(x,top,2,60-top,x<88?'#e9e6d7':'#b4c4cd')+r(x,60,2,2,'#64768e');
  }
  for(const [x,y] of [[57,53],[68,48],[80,46],[92,46],[105,48],[117,53]])s+=line(x,y,x+(x<90?-5:5),59,'#95a6b7');
  s+=r(83,43,14,2,cream)+r(32,86,103,2,cream)+r(30,87,2,6,cream)+r(133,87,2,6,cream);
  // Coastal pavilion and connected viewing terrace distinguish Dongbaekseom.
  s+=r(6,89,37,5,'#a29683')+r(13,76,2,13,cream)+r(32,76,2,13,cream)+roof(5,75,38);
  s+=r(8,98,35,4,'#bfb5a0')+r(12,102,35,3,'#cbbfa8')+pine(0,65)+pine(139,62);
  s+=crowd([[49,78,pink,8,0,13,-2],[100,78,'#e5c565',-9,0,16,-7],[19,89,'#8a7db9',8,0,12,-4]]);
  return s+boat(129,109);
 },
 huinnyeoul(){
  let s=sea(58);
  // Overlapping homes and planted terraces take precedence over the retaining wall.
  for(let x=0;x<160;x+=4){const top=50+Math.floor(x/20),bottom=88+Math.floor(x/14);s+=r(x,top,4,bottom-top,'#b6ba95')+r(x,bottom,4,5,'#9a9f91');}
  const homes=[[0,36,20,18],[23,40,18,16],[46,34,21,22],[72,39,18,19],[96,42,22,18],[123,44,18,19],[145,47,18,16],
   [-3,58,23,21],[24,60,23,19],[54,55,20,24],[82,61,24,19],[112,65,23,19],[140,68,21,19]];
  for(const [x,y,w,h] of homes){
   s+=house(x,y,w,h,cream)+r(x-1,y,w+2,2,'#428fac')+r(x+3,y+5,4,6,'#579bb5');
   s+=r(x+2,y+h-2,w-4,2,'#d2c9b4')+r(x+w-5,y+h-7,3,5,'#688699');
   s+=r(x+5,y-3,6,3,'#dde3ce');
  }
  s+=r(30,69,18,3,pink)+r(31,72,16,1,cream)+r(113,76,22,3,'#68bab5');
  for(let i=0;i<6;i++)s+=r(73+i,58+i*5,7,3,i%2?'#8bc4cd':cream);
  for(let x=0;x<160;x+=4){
   const y=88+Math.floor(x/14);
   s+=r(x,y,4,5,'#62bfd0')+r(x,y+5,4,2,'#d6eada');
   if(x%12===0)s+=r(x,y+1,1,4,cream);
   if(x%16===0)s+=r(x+1,y+8,5,2,'#9ba697');
  }
  for(const [x,y] of [[9,82],[51,83],[98,86],[143,92]])s+=r(x,y,7,3,'#578778')+r(x+2,y-2,4,2,'var(--season-leaf)');
  s+=crowd([[12,79,pink,14,1,16,-2],[56,82,'#ad91cc',11,1,19,-8],[107,86,'#e9b850',-12,-1,17,-5]]);
  return s+boat(132,113);
 },
 jagalchi(){let s=sea(88)+r(0,82,160,9,'#9b91ad')+r(12,49,132,34,'#78b7c1');for(let x=15;x<145;x+=8)s+=r(x,52,2,27,cream);for(let x=10;x<150;x+=4){const y=39+Math.round(8*Math.sin((x-10)/22));s+=r(x,y,4,5,cream)+r(x,y+5,4,2,ink);}s+=r(19,73,122,10,pink)+r(19,83,122,3,cream);for(let i=0;i<6;i++)s+=r(22+i*20,73,14,3,i%2?cream:'#f5bc58')+r(27+i*20,77,4,6,ink);return s+boat(31,105)+boat(111,99);},
 haeundae(){let s=sea(71)+r(0,94,160,26,'#f4d19b');for(const [x,h,w] of [[107,55,12],[122,68,14],[140,48,12]]){s+=house(x,72-h,w,h,'#91b6cc');s+=r(x+2,70-h,w-4,2,cream)+r(x+4,68-h,w-8,2,cream);}for(let x=0;x<100;x+=12)s+=house(x,54+(x%3)*4,10,18,'#b6a9cf');for(let i=0;i<8;i++)s+=r(i*21,92+i%2,12,2,cream);let parasols='';for(let x=21;x<150;x+=32)parasols+=r(x,103,1,8,ink)+r(x-6,102,13,2,pink)+r(x-4,100,9,2,cream)+r(x-2,98,5,2,pink);return s+group('beach-parasols',parasols)+crowd([[78,103,pink,12,0,15,-2],[20,108,'#b592cf',10,0,17,-8],[122,106,'#69aab7',-12,0,14,-5],[51,100,'#f4b754',8,0,19,-11]])+boat(40,80);},
 busanTower(){let s=mountain()+r(0,94,160,26,'var(--season-ground)');s+=r(77,34,7,57,cream)+r(72,90,17,5,cream)+r(68,27,25,8,cream)+r(65,24,31,5,ink)+r(69,22,23,2,pink)+r(73,19,15,3,cream)+r(79,7,2,12,cream)+r(67,29,27,3,'#86bdc8');for(let x=70;x<92;x+=5)s+=r(x,29,1,3,cream);s+=r(38,89,29,12,pink)+roof(33,87,39)+r(43,94,4,7,ink)+r(57,94,4,7,ink);for(let x of [9,24,113,134])s+=tree(x,79);return s+crowd([[89,105,pink,12,0,16,-2],[36,106,'#77b9be',15,0,18,-8],[123,103,'#f0c362',-10,0,14,-5]]);},
 cinemaCenter(){let s=mountain()+r(0,94,160,26,'#bcafca')+r(33,66,93,28,'#668ba7');s+=r(100,43,13,51,cream)+r(95,49,23,13,'#9ea6bb')+r(89,62,35,4,pink);for(let x=13;x<148;x+=3){const y=39+Math.floor((x-13)/18);s+=r(x,y,3,9,ink)+r(x,y+9,3,2,['#e68bb9','#98d5c8','#f6d78d'][Math.floor(x/9)%3]);}s+=r(18,85,117,5,cream)+windows(38,69,56,13)+r(21,96,117,2,cream)+crowd([[65,101,pink,15,0,17,-3],[21,104,'#79bbbd',12,0,14,-7],[117,101,'#dcb663',-13,0,19,-11],[89,108,'#987db9',10,0,16,-5]]);return s;},
 beomeosa(){let s=mountain()+r(0,94,160,26,'var(--season-ground)');for(let x of [1,19,129,145])s+=tree(x,66);s+=r(45,65,72,29,'#dca679')+r(46,72,70,4,'#689f8c');for(let x=48;x<116;x+=13)s+=r(x,73,3,20,'#a34657');s+=roof(36,64,90)+roof(46,51,70)+r(58,53,46,9,'#6fa89a')+r(73,81,17,13,ink)+r(39,94,84,4,cream)+r(35,98,92,3,'#9e9fa7');let pagoda='';for(let i=0;i<3;i++)pagoda+=r(20+i*2,84-i*8,19-i*4,3,cream)+r(25+i,87-i*8,9-i*2,4,'#a6a5ab');return s+pagoda+crowd([[107,105,pink,10,0,14,-2],[53,104,'#7db6bb',14,0,18,-9],[79,108,'#c69ad3',-12,0,16,-5]]);},
 ahopsan(){let s=r(0,39,160,81,'var(--season-pine)');for(let x=0;x<160;x+=4){const edge=Math.abs(x-80);s+=r(x,75+Math.floor(edge/4),4,45-Math.floor(edge/4),'#bba383');}for(let i=0;i<18;i++){let x=i<9?i*7:103+(i-9)*7,top=14+(i*11)%20;s+=r(x,top,3,120-top,i%2?'#629b6d':'#87b780');for(let y=top+8;y<120;y+=11)s+=r(x,y,3,1,'#254f53');s+=r(x-4,top+4,10,2,'var(--season-leaf)')+r(x+3,top+7,7,2,'var(--season-leaf)');}s+=r(0,10,160,7,'var(--season-pine)')+r(0,17,63,9,'var(--season-pine)')+r(99,17,61,9,'var(--season-pine)')+crowd([[77,87,pink,3,6,16,-2],[88,97,'#e4c266',-3,-6,20,-10],[68,102,'#99bdd0',4,7,18,-6]]);for(let i=0;i<6;i++)s+=r(21+i*23,53+(i%3)*17,1,1,'#f4e98c','px-firefly');return s;}
 };
 function sky(){let s=r(0,0,160,120,'var(--env-sky-top)')+r(0,37,160,83,'var(--env-sky-bottom)');s+=group('px-sun',r(23,16,10,14,'#ffe29a')+r(21,18,14,10,'#ffe29a'));s+=group('px-moon',r(23,16,10,14,cream)+r(21,18,14,10,cream)+r(28,15,8,11,'var(--env-sky-top)'));for(let i=0;i<9;i++)s+=r(48+(i*29)%106,8+(i*13)%28,1,1,cream,'px-star');s+=group('px-cloud',r(92,20,28,4,cream)+r(96,17,18,3,cream)+r(101,15,8,2,cream));return s;}
 const result={};
 // Merge consecutive static cells without changing SVG painter order.
 // Moving sprites retain independent nodes; paths contain only integer right angles.
 function packStaticCells(svg){
  return svg.replace(/(?:<rect x="-?\d+" y="-?\d+" width="\d+" height="\d+" fill="[^"]+"\/>){2,}/g,run=>{
   let packed='',fill=null,cells='',count=0;
   const flush=()=>{if(count)packed+=`<path fill="${fill}" d="${cells}"/>`;cells='';count=0;};
   for(const match of run.matchAll(/<rect x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)" fill="([^"]+)"\/>/g)){
    if(fill!==match[5]){flush();fill=match[5];}
    cells+=`M${match[1]} ${match[2]}h${match[3]}v${match[4]}h-${match[3]}Z`;
    count++;
   }
   flush();return packed;
  });
 }
 const cache=new Map();
 function artwork(key,draw){
  if(!cache.has(key))cache.set(key,packStaticCells(sky()+draw()+seasonDetails(key)));
  return cache.get(key);
 }
 for(const [key,draw] of Object.entries(scenes)) result[key]={
  viewBox:'0 0 160 120',width:160,height:120,pixel:true,
  render:()=>`<g class="pixel-art px-${key}" shape-rendering="crispEdges">${artwork(key,draw)}</g>`,
  map:()=>`<g class="map-pixel-art px-${key}" shape-rendering="crispEdges" transform="translate(-80 -60)">${artwork(key,draw)}</g>`
 };
 return result;
})();
