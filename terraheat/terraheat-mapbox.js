(() => {
  const token = window.TERRAHEAT_MAPBOX_TOKEN;
  const $ = selector => document.querySelector(selector);
  let modisDates = ['2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25','2026-10-26'];
  const cities = [
    ['Cardiff','United Kingdom',-3.1791,51.4816],['London','United Kingdom',-0.1276,51.5072],['Madrid','Spain',-3.7038,40.4168],['Paris','France',2.3522,48.8566],['Rome','Italy',12.4964,41.9028],['Athens','Greece',23.7275,37.9838],['Cairo','Egypt',31.2357,30.0444],['Lagos','Nigeria',3.3792,6.5244],['Nairobi','Kenya',36.8219,-1.2921],['Cape Town','South Africa',18.4241,-33.9249],['Dubai','UAE',55.2708,25.2048],['Riyadh','Saudi Arabia',46.6753,24.7136],['Delhi','India',77.1025,28.7041],['Karachi','Pakistan',67.0099,24.8615],['Bangkok','Thailand',100.5018,13.7563],['Beijing','China',116.4074,39.9042],['Tokyo','Japan',139.6917,35.6895],['Jakarta','Indonesia',106.8456,-6.2088],['Sydney','Australia',151.2093,-33.8688],['Perth','Australia',115.8605,-31.9505],['Phoenix','United States',-112.074,33.4484],['Houston','United States',-95.3698,29.7604],['New York','United States',-74.006,40.7128],['Mexico City','Mexico',-99.1332,19.4326],['São Paulo','Brazil',-46.6333,-23.5505],['Santiago','Chile',-70.6693,-33.4489]
  ].map(([name,country,lon,lat],index)=>({name,country,lon,lat,index}));
  const state={field:'era5',frame:6,playing:false,selected:null,autoRotate:true,timer:null,tourIndex:-1,landsatMode:'event'};
  const fieldCache=new Map();
  let gfs,era5,live,map,baseSymbols=[],toggleLayers=()=>{},tourTarget=null;
  const tourSteps=[
    {target:'#layers-panel',title:'Switch global data layers',copy:'Use Layers to compare ERA5-Land daily maximum temperature, 2 m air temperature, surface skin temperature and MODIS Terra LST. The legend and timeline update with the selected field.',enter:()=>{resetGlobal(false);toggleLayers(true)}},
    {target:'#timeline',title:'Move through time',copy:'Drag the timeline or press play to move through every available frame. The valid date is always shown in the legend and beside the slider.',enter:()=>toggleLayers(false)},
    {target:'#city-rank',title:'Find the hottest cities',copy:'This list ranks the hottest sampled model cells in the current GFS frame. Choose a city here to move directly from the planetary field into its observatory view.',enter:()=>resetGlobal(false)},
    {target:'#search-form',title:'Enter the city scale',copy:'Search for a city, or zoom toward the city markers and select one. The map changes from the global field to a city observatory as you move closer.',enter:()=>map.easeTo({center:[14,18],zoom:3.2,duration:1100,essential:true})},
    {target:'#analysis',title:'Inspect real city-scale heat',copy:'London loads a Landsat surface-temperature raster at a 30 m output grid. Switch between the July 2022 event and the latest low-cloud scene while keeping the global model point metrics for context.',enter:()=>selectCity(cities.find(city=>city.name==='London'))},
    {target:'.brand',title:'Return to the planet',copy:'Use the TerraHeat logo at any time to close the city analysis, remove the local layer and return to the rotating global view.',enter:()=>resetGlobal(true)}
  ];

  if(!token||!window.mapboxgl){showFatal('Mapbox token or library is missing.');return}
  mapboxgl.accessToken=token;

  Promise.all([
    fetch('gfs-temperature-day.json').then(r=>{if(!r.ok)throw new Error('GFS data unavailable');return r.json()}),
    fetch('data/era5-land-heatwave.json').then(r=>{if(!r.ok)throw new Error('ERA5 data unavailable');return r.json()}),
    fetch('data/live-manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
  ]).then(([gfsData,era5Data,liveData])=>{gfs=gfsData;era5=era5Data;live=liveData;if(live?.modis?.dates?.length)modisDates=live.modis.dates;init()}).catch(error=>showFatal(error.message));

  function showFatal(message){const box=$('#map-error');box.hidden=false;box.querySelector('span').textContent=message;$('#map-loading')?.classList.add('done')}
  function nearestSeries(city){
    const x=Math.round((((city.lon-gfs.lo1)%360)+360)%360/gfs.dx)%gfs.nx;
    const y=Math.max(0,Math.min(gfs.ny-1,Math.round((gfs.la1-city.lat)/gfs.dy)));
    const index=y*gfs.nx+x;
    return gfs.frames.map(frame=>({validIso:frame.validIso,at:Number.isFinite(frame.at[index])?frame.at[index]:null,lst:Number.isFinite(frame.lst[index])?frame.lst[index]:null}));
  }
  function cityFeatures(){
    return {type:'FeatureCollection',features:cities.map(city=>{
      const current=nearestSeries(city).at(-1),at=current.at??-99,lst=current.lst??at;
      return {type:'Feature',geometry:{type:'Point',coordinates:[city.lon,city.lat]},properties:{...city,at,lst,delta:lst-at}};
    })};
  }
  function blankImage(){const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;return canvas.toDataURL()}
  function colorFor(value){
    const stops=[[-50,[31,51,126]],[-20,[53,86,165]],[0,[92,82,165]],[15,[164,76,132]],[30,[225,84,80]],[45,[244,145,70]],[60,[255,224,122]]];
    if(value<=stops[0][0])return stops[0][1];if(value>=stops.at(-1)[0])return stops.at(-1)[1];
    for(let i=1;i<stops.length;i++)if(value<=stops[i][0]){const [a,ca]=stops[i-1],[b,cb]=stops[i],t=(value-a)/(b-a);return ca.map((v,j)=>Math.round(v+(cb[j]-v)*t))}
  }
  function sampleGrid(array,lon,lat){
    const gx=((((lon-gfs.lo1)%360)+360)%360)/gfs.dx,gy=(gfs.la1-lat)/gfs.dy;
    const x0=Math.floor(gx)%gfs.nx,x1=(x0+1)%gfs.nx,y0=Math.max(0,Math.min(gfs.ny-1,Math.floor(gy))),y1=Math.min(gfs.ny-1,y0+1),fx=gx-Math.floor(gx),fy=Math.max(0,Math.min(1,gy-y0));
    const values=[array[y0*gfs.nx+x0],array[y0*gfs.nx+x1],array[y1*gfs.nx+x0],array[y1*gfs.nx+x1]];
    if(!values.some(Number.isFinite))return null;
    const safe=values.map(v=>Number.isFinite(v)?v:values.find(Number.isFinite));
    return (safe[0]*(1-fx)+safe[1]*fx)*(1-fy)+(safe[2]*(1-fx)+safe[3]*fx)*fy;
  }
  function gridImage(field,index){
    const key=`${field}-${index}`;if(fieldCache.has(key))return fieldCache.get(key);
    const canvas=document.createElement('canvas');canvas.width=720;canvas.height=360;const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height),array=gfs.frames[index][field];
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
      const lon=-180+(x+.5)*360/canvas.width,lat=90-(y+.5)*180/canvas.height,value=sampleGrid(array,lon,lat),i=(y*canvas.width+x)*4;
      if(!Number.isFinite(value)){image.data[i+3]=0;continue}const [r,g,b]=colorFor(value);image.data[i]=r;image.data[i+1]=g;image.data[i+2]=b;image.data[i+3]=field==='lst'?222:234;
    }
    ctx.putImageData(image,0,0);const url=canvas.toDataURL('image/png');fieldCache.set(key,url);return url;
  }
  function localHeatImage(city,base){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d'),image=ctx.createImageData(512,512);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const nx=x/511*2-1,ny=y/511*2-1,core=Math.exp(-(nx*nx*1.35+ny*ny*1.9))*8.8,corridor=Math.exp(-Math.pow(ny+nx*.22-.08,2)*23)*3.1,texture=Math.sin((nx+city.index*.13)*11)*.8+Math.cos((ny-city.index*.09)*13)*.65,value=base+core+corridor+texture-2.2,[r,g,b]=colorFor(value),radial=Math.sqrt(nx*nx+ny*ny),fade=Math.max(0,Math.min(1,(1.04-radial)/.25)),alpha=Math.round(224*fade*fade*(3-2*fade)),i=(y*512+x)*4;
      image.data[i]=r;image.data[i+1]=g;image.data[i+2]=b;image.data[i+3]=alpha;
    }
    ctx.putImageData(image,0,0);return canvas.toDataURL('image/png');
  }
  function landsatTile(item){
    const id=item.id,range=item.rescale||[15,45];
    return `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?collection=landsat-c2-l2&item=${encodeURIComponent(id)}&assets=lwir11&asset_as_band=true&expression=lwir11*0.00341802-124.15&rescale=${range.join(',')}&colormap_name=turbo&format=png`;
  }
  function londonScenes(){
    const fallback={event:{id:'LC09_L2SP_201024_20220718_02_T1',date:'2022-07-18',platform:'Landsat 9',cloudCover:0.72,rescale:[15,45]},latest:{id:'LC09_L2SP_201024_20261017_02_T1',date:'2026-10-17',platform:'Landsat 9',cloudCover:12.02,rescale:[5,30]}};
    return live?.landsatLondon||fallback;
  }

  function init(){
    map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/dark-v11',projection:'globe',center:[14,18],zoom:1.35,pitch:0,bearing:0,antialias:true,attributionControl:true});
    map.addControl(new mapboxgl.NavigationControl({showCompass:true,visualizePitch:true}),'top-right');
    map.on('error',event=>{const text=String(event.error?.message||'');if(/401|403|access token|style/i.test(text))showFatal('Mapbox rejected the token. Check its URL restrictions for localhost.')});
    map.on('load',setupMap);
  }
  function setupMap(){
    map.setFog({'space-color':'#050505','star-intensity':.18,'horizon-blend':.05,'color':'#171716','high-color':'#2c2624'});
    baseSymbols=map.getStyle().layers.filter(layer=>layer.type==='symbol').map(layer=>layer.id);
    const firstSymbol=baseSymbols[0];
    map.addSource('thermal-field',{type:'raster',tiles:['tiles/era5/6/{z}/{x}/{y}.png'],tileSize:256,minzoom:0,maxzoom:2});
    map.addLayer({id:'thermal-field',type:'raster',source:'thermal-field',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],0,.84,2.6,.76,4.4,.3,6,0],'raster-resampling':'linear','raster-fade-duration':420}},firstSymbol);
    map.addSource('modis-field',{type:'raster',tiles:[modisUrl(modisDates.at(-1))],tileSize:256,minzoom:0,maxzoom:7,attribution:'NASA GIBS · MODIS Terra MOD11A1 v6.1'});
    map.addLayer({id:'modis-field',type:'raster',source:'modis-field',layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],0,.82,3,.72,5,.18,6,0],'raster-resampling':'linear','raster-fade-duration':420}},firstSymbol);
    map.addSource('cities',{type:'geojson',data:cityFeatures()});
    map.addLayer({id:'city-halo',type:'circle',source:'cities',minzoom:1.4,maxzoom:8,paint:{'circle-radius':['interpolate',['linear'],['zoom'],1.4,3,4,10,7,18],'circle-color':['interpolate',['linear'],['get','at'],-10,'#4f6ea7',15,'#9c5a8b',30,'#e16750',45,'#ffd16b'],'circle-blur':.8,'circle-opacity':['interpolate',['linear'],['zoom'],1.4,0,2.2,.48,5,.36,7,0]}});
    map.addLayer({id:'city-points',type:'circle',source:'cities',minzoom:1.4,maxzoom:8,paint:{'circle-radius':['interpolate',['linear'],['zoom'],1.4,1.5,4,5.5,7,7],'circle-color':['interpolate',['linear'],['get','at'],-10,'#4f77bd',10,'#875a9b',25,'#df5a58',40,'#ffd36f'],'circle-stroke-color':'rgba(255,245,229,.72)','circle-stroke-width':['interpolate',['linear'],['zoom'],2,0,4,.8],'circle-opacity':['interpolate',['linear'],['zoom'],1.4,0,2.2,.86,6,.96,7,0]}});
    map.addLayer({id:'city-labels',type:'symbol',source:'cities',minzoom:3.2,maxzoom:8,layout:{'text-field':['get','name'],'text-font':['DIN Pro Medium','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],3.2,9,6,12],'text-offset':[0,1.2],'text-anchor':'top','text-allow-overlap':false},paint:{'text-color':'#e8e1d8','text-halo-color':'rgba(10,10,9,.9)','text-halo-width':1.2,'text-opacity':['interpolate',['linear'],['zoom'],3.2,0,4.1,.95,7,0]}});
    map.addSource('local-heat',{type:'image',url:blankImage(),coordinates:[[0,0],[.01,0],[.01,-.01],[0,-.01]]});
    map.addLayer({id:'local-heat',type:'raster',source:'local-heat',minzoom:5.8,layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],5.8,0,7.2,.88,11,.7,13,.25],'raster-resampling':'linear','raster-fade-duration':600}},firstSymbol);
    const londonEvent=londonScenes().event;
    map.addSource('london-landsat',{type:'raster',tiles:[landsatTile(londonEvent)],tileSize:256,minzoom:7,maxzoom:15,attribution:'USGS Landsat Collection 2 Level-2 · Microsoft Planetary Computer'});
    map.addLayer({id:'london-landsat',type:'raster',source:'london-landsat',minzoom:7,layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,0,8.5,.82,11,.88,14,.72],'raster-resampling':'linear','raster-fade-duration':650}},firstSymbol);
    map.addSource('city-boundary',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:'city-boundary',type:'line',source:'city-boundary',minzoom:6,paint:{'line-color':'rgba(255,233,211,.68)','line-width':['interpolate',['linear'],['zoom'],6,.7,12,1.5],'line-dasharray':[2,2],'line-opacity':['interpolate',['linear'],['zoom'],6,0,7,.7]}});
    map.on('click','city-points',event=>selectCity(featureCity(event.features[0])));
    map.on('mouseenter','city-points',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','city-points',()=>map.getCanvas().style.cursor='');
    map.on('zoom',updateScale);map.on('moveend',spinGlobe);
    ['mousedown','touchstart','wheel','dragstart'].forEach(name=>map.on(name,()=>{state.autoRotate=false}));
    wireUI();populateCityOptions();renderRanks();setField('era5',era5.frames.length-1);updateScale();
    $('#map-loading').classList.add('done');setTimeout(spinGlobe,700);
    window.__terraHeatMap={map,state,cities,selectCity,setField};
  }
  function modisUrl(date){return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/all/MODIS_Terra_Land_Surface_Temp_Day_v6.1_STD/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`}
  function featureCity(feature){const name=feature?.properties?.name;return cities.find(city=>city.name===name)}
  function framesFor(field){return field==='era5'?era5.frames:field==='modis'?modisDates.map(date=>({date})):gfs.frames}
  function frameLabel(field,index){const item=framesFor(field)[index];return field==='era5'||field==='modis'?item.date:new Date(item.validIso).toISOString().slice(0,16).replace('T',' ')}
  function shortDate(value){const date=new Date(value.length===10?`${value}T00:00:00Z`:value+'Z');return date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:value.length===10?'numeric':undefined,timeZone:'UTC'}).toUpperCase()+(value.length>10?` ${value.slice(11,16)}Z`:'')}
  function setField(field,index){
    state.field=field;const frames=framesFor(field);state.frame=Math.max(0,Math.min(frames.length-1,index??frames.length-1));
    const slider=$('#time-slider');slider.max=frames.length-1;slider.value=state.frame;
    $('#time-start').textContent=shortDate(frameLabel(field,0)).replace(/ 20\d\d/,'');$('#time-end').textContent=shortDate(frameLabel(field,frames.length-1)).replace(/ 20\d\d/,'');
    document.querySelector(`input[name=field][value=${field}]`).checked=true;updateFrame();
  }
  function updateFrame(){
    if(!map?.isStyleLoaded())return;const field=state.field,index=state.frame,label=frameLabel(field,index),isModis=field==='modis';
    map.setLayoutProperty('thermal-field','visibility',isModis?'none':'visible');map.setLayoutProperty('modis-field','visibility',isModis?'visible':'none');
    if(isModis){map.getSource('modis-field').setTiles([modisUrl(modisDates[index])]);$('#legend-name').textContent='MODIS TERRA LST';$('#time-type').textContent='MODIS TERRA'}
    else{map.getSource('thermal-field').setTiles([`tiles/${field}/${index}/{z}/{x}/{y}.png`]);const names={era5:'ERA5-LAND TMAX',at:'GFS 2 M AIR',lst:'GFS SKIN LST'};$('#legend-name').textContent=names[field];$('#time-type').textContent=names[field]}
    const tickSets={era5:['−40','−10','10','30','50+'],at:['−40','−10','10','30','50+'],lst:['−20','0','20','40','60+'],modis:['−20','0','20','40','60+']};
    $('#legend').dataset.field=field;$('#legend-ticks').innerHTML=tickSets[field].map(value=>`<span>${value}</span>`).join('');
    $('#legend-date').textContent=label;$('#time-value').textContent=shortDate(label);$('#time-slider').value=index;
  }
  function selectCity(city){
    if(!city)return;state.selected=city;state.autoRotate=false;const series=nearestSeries(city),current=series.at(-1),base=Number.isFinite(current.lst)?current.lst:Number.isFinite(current.at)?current.at:30,width=.9,height=.64,coords=[[city.lon-width/2,city.lat+height/2],[city.lon+width/2,city.lat+height/2],[city.lon+width/2,city.lat-height/2],[city.lon-width/2,city.lat-height/2]];
    const isLondon=city.name==='London';map.setLayoutProperty('london-landsat','visibility',isLondon?'visible':'none');map.setLayoutProperty('local-heat','visibility',isLondon?'none':'visible');
    if(isLondon){state.landsatMode='event';activateLondonScene('event');map.getSource('city-boundary').setData({type:'FeatureCollection',features:[]})}
    else{const source=map.getSource('local-heat');source.updateImage({url:localHeatImage(city,base),coordinates:coords});source.setCoordinates(coords);map.getSource('city-boundary').setData({type:'Feature',geometry:{type:'Polygon',coordinates:[[[city.lon-width/2,city.lat-height/2],[city.lon+width/2,city.lat-height/2],[city.lon+width/2,city.lat+height/2],[city.lon-width/2,city.lat+height/2],[city.lon-width/2,city.lat-height/2]]]},properties:{}})}
    map.flyTo({center:[city.lon,city.lat],zoom:isLondon?11.2:8.3,pitch:isLondon?18:34,bearing:isLondon?-12:-8,duration:isLondon?2700:2200,curve:1.25,essential:true,padding:{right:window.innerWidth>700?350:0}});populateAnalysis(city,series);$('#analysis').classList.add('open');$('#analysis').setAttribute('aria-hidden','false');$('#welcome').classList.add('dismissed');
  }
  function activateLondonScene(mode){
    const scenes=londonScenes(),scene=scenes[mode]||scenes.event;state.landsatMode=mode;map.getSource('london-landsat').setTiles([landsatTile(scene)]);map.setLayoutProperty('london-landsat','visibility','visible');
    $('#urban-raster').hidden=false;$('#urban-raster-name').textContent=`${String(scene.platform||'Landsat').toUpperCase()} LST`;$('#urban-raster-meta').textContent=`${shortDate(scene.date)} · 30 m output grid · ${Number(scene.cloudCover).toFixed(2)}% scene cloud`;
    $('#landsat-event').classList.toggle('active',mode==='event');$('#landsat-latest').classList.toggle('active',mode==='latest');$('#legend').dataset.field='landsat';$('#legend-name').textContent='LANDSAT LST · LONDON';$('#legend-date').textContent=scene.date;$('#legend-ticks').innerHTML=['15','22','30','38','45+'].map(value=>`<span>${value}</span>`).join('');$('#timeline').classList.add('city-raster-active');
    $('#analysis-status').textContent=mode==='event'?'2022 HEATWAVE SCENE':'LATEST CLEAR SCENE';$('#analysis-story').textContent=mode==='event'?'Landsat 9 observed London during the 18 July 2022 extreme heat event. The raster reveals neighbourhood-scale surface contrasts hidden by the global field.':'This is the most recent London scene selected by the scheduled low-cloud Landsat search. Acquisition date and scene cloud cover are shown above.';$('#analysis-note').textContent='Landsat Collection 2 Level-2 surface temperature. Output grid: 30 m; native thermal sensing is coarser. Linear map interpolation smooths display only and does not create new measured detail.';
  }
  function populateAnalysis(city,series){
    const current=series.at(-1),delta=Number.isFinite(current.lst)&&Number.isFinite(current.at)?current.lst-current.at:null,hot=series.filter(d=>Number.isFinite(d.at)&&d.at>=35).length;
    $('#analysis-city').textContent=city.name;$('#analysis-place').textContent=`${city.country} · ${city.lat.toFixed(3)}°, ${city.lon.toFixed(3)}°`;$('#metric-at').textContent=Number.isFinite(current.at)?`${current.at.toFixed(1)} °C`:'—';$('#metric-lst').textContent=Number.isFinite(current.lst)?`${current.lst.toFixed(1)} °C`:'—';$('#metric-delta').textContent=Number.isFinite(delta)?`${delta>=0?'+':''}${delta.toFixed(1)} °C`:'—';$('#metric-hot').textContent=`${hot} / ${series.length}`;$('#chart-period').textContent=`${series[0].validIso.slice(5,16).replace('T',' ')} → ${series.at(-1).validIso.slice(5,16).replace('T',' ')}`;
    const status=!Number.isFinite(current.at)?'NO DATA':current.at>=35?'EXTREME HEAT':current.at>=30?'HIGH HEAT':'MODEL SNAPSHOT';$('#analysis-status').textContent=status;$('#analysis-story').textContent=Number.isFinite(delta)?`At the selected model cell, the land surface is ${Math.abs(delta).toFixed(1)} °C ${delta>=0?'warmer':'cooler'} than the air at the latest timestep.`:'The selected model cell does not contain a complete paired observation.';$('#urban-raster').hidden=city.name!=='London';if(city.name!=='London'){$('#analysis-note').textContent='Point values use the nearest bundled NOAA GFS model cell. The local urban surface is an interaction prototype, not measured street-scale temperature.';$('#timeline').classList.remove('city-raster-active')}renderChart(series);
    if(city.name==='London')activateLondonScene(state.landsatMode);
  }
  function resetGlobal(animate=true,rotate=state.tourIndex<0){
    state.autoRotate=rotate;state.selected=null;$('#analysis').classList.remove('open');$('#analysis').setAttribute('aria-hidden','true');
    if(map.getLayer('local-heat'))map.setLayoutProperty('local-heat','visibility','none');if(map.getLayer('london-landsat'))map.setLayoutProperty('london-landsat','visibility','none');$('#urban-raster').hidden=true;$('#timeline').classList.remove('city-raster-active');updateFrame();map.easeTo({padding:{right:0},duration:350});
    map.flyTo({center:[14,18],zoom:1.35,pitch:0,bearing:0,duration:animate?1800:700,curve:1.2,essential:true});
  }
  function positionTour(){
    if(state.tourIndex<0||!tourTarget)return;const popover=$('#tour-popover'),rect=tourTarget.getBoundingClientRect(),gap=14,pw=popover.offsetWidth,ph=popover.offsetHeight;
    let left=rect.right+gap,top=rect.top+rect.height/2-ph/2;if(left+pw>window.innerWidth-12)left=rect.left-pw-gap;if(left<12)left=Math.max(12,Math.min(window.innerWidth-pw-12,rect.left));top=Math.max(12,Math.min(window.innerHeight-ph-12,top));
    popover.style.left=`${left}px`;popover.style.top=`${top}px`;
  }
  function showTourStep(index){
    if(index<0||index>=tourSteps.length){endTour();return}tourTarget?.classList.remove('tour-focus');state.tourIndex=index;const step=tourSteps[index],popover=$('#tour-popover');popover.classList.remove('is-visible');step.enter?.();
    $('#tour-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(tourSteps.length).padStart(2,'0')}`;$('#tour-title').textContent=step.title;$('#tour-copy').textContent=step.copy;$('#tour-next').textContent=index===tourSteps.length-1?'FINISH':'NEXT';
    setTimeout(()=>{tourTarget=$(step.target);if(!tourTarget)return;tourTarget.classList.add('tour-focus');positionTour();popover.classList.add('is-visible')},80);if(index===4||index===5)setTimeout(positionTour,index===4?2300:1900);
  }
  function startTour(){
    $('#tour').hidden=false;state.autoRotate=false;showTourStep(0);window.addEventListener('resize',positionTour);
  }
  function endTour(){
    tourTarget?.classList.remove('tour-focus');tourTarget=null;state.tourIndex=-1;$('#tour-popover').classList.remove('is-visible');$('#tour').hidden=true;toggleLayers(false);window.removeEventListener('resize',positionTour);
    if(map.getZoom()<2.3){state.autoRotate=true;setTimeout(spinGlobe,500)}
  }
  function renderChart(series){
    const svg=$('#point-chart'),values=series.flatMap(d=>[d.at,d.lst]).filter(Number.isFinite);if(!values.length){svg.innerHTML='';return}let min=Math.floor(Math.min(...values)-3),max=Math.ceil(Math.max(...values)+3);if(max-min<10){min-=5;max+=5}const x=i=>28+i*286/Math.max(1,series.length-1),y=v=>126-(v-min)/(max-min)*102,path=key=>series.map((d,i)=>Number.isFinite(d[key])?`${i?'L':'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`:'').join(' '),grid=[0,.5,1].map(t=>{const yy=24+t*102,value=Math.round(max-t*(max-min));return `<line class="chart-grid" x1="28" y1="${yy}" x2="314" y2="${yy}"/><text x="0" y="${yy+3}" fill="#716c65" font-size="8">${value}°</text>`}).join(''),dots=key=>series.map((d,i)=>Number.isFinite(d[key])?`<circle class="chart-${key}-dot" cx="${x(i)}" cy="${y(d[key])}" r="2.5"/>`:'').join('');svg.innerHTML=`${grid}<path class="chart-lst" d="${path('lst')}"/><path class="chart-at" d="${path('at')}"/>${dots('lst')}${dots('at')}`;
  }
  function updateScale(){
    const zoom=map.getZoom(),indicator=$('#scale-indicator'),rank=$('#city-rank');let level,title;
    if(zoom<2.3){level='01 · PLANET';title='GLOBAL THERMAL FIELD';rank.classList.remove('hidden')}
    else if(zoom<6.7){level='02 · CITY NETWORK';title='SELECT AN URBAN OBSERVATORY';rank.classList.add('hidden')}
    else{level='03 · LOCAL HEAT';title=state.selected?`${state.selected.name.toUpperCase()} THERMAL SURFACE`:'CITY DETAIL';rank.classList.add('hidden')}
    indicator.querySelector('span').textContent=level;indicator.querySelector('small').textContent=title;
  }
  function spinGlobe(){if(!state.autoRotate||map.getZoom()>2.2||map.isMoving())return;const center=map.getCenter();map.easeTo({center:[center.lng+12,center.lat],duration:6000,easing:t=>t,essential:true})}
  function renderRanks(){
    const ranked=cities.map(city=>({city,current:nearestSeries(city).at(-1)})).filter(x=>Number.isFinite(x.current.at)).sort((a,b)=>b.current.at-a.current.at).slice(0,4),box=$('#rank-list');box.innerHTML='';ranked.forEach((item,index)=>{const button=document.createElement('button');button.className='rank-item';button.innerHTML=`<i>${String(index+1).padStart(2,'0')}</i><b>${item.city.name}</b><span>${item.current.at.toFixed(1)}°</span>`;button.addEventListener('click',()=>selectCity(item.city));box.appendChild(button)})
  }
  function populateCityOptions(){const list=$('#city-options');cities.forEach(city=>{const option=document.createElement('option');option.value=city.name;option.label=city.country;list.appendChild(option)})}
  function wireUI(){
    const welcome=$('#welcome'),layers=$('#layers-panel'),layersToggle=$('#layers-toggle');const dismiss=()=>welcome.classList.add('dismissed');$('#welcome-close').addEventListener('click',dismiss);$('#skip-intro').addEventListener('click',dismiss);$('#start-explore').addEventListener('click',()=>{dismiss();startTour()});$('#about-toggle').addEventListener('click',()=>{if(state.tourIndex>=0)endTour();welcome.classList.toggle('dismissed')});$('.brand').addEventListener('click',event=>{event.preventDefault();if(state.tourIndex>=0)endTour();resetGlobal(true,true);setTimeout(spinGlobe,1900)});
    toggleLayers=force=>{const open=force??layers.hidden;layers.hidden=!open;layersToggle.setAttribute('aria-expanded',String(open))};layersToggle.addEventListener('click',()=>toggleLayers());$('#layers-close').addEventListener('click',()=>toggleLayers(false));
    document.querySelectorAll('input[name=field]').forEach(input=>input.addEventListener('change',()=>setField(input.value,framesFor(input.value).length-1)));$('#cities-switch').addEventListener('change',event=>['city-halo','city-points','city-labels'].forEach(id=>map.setLayoutProperty(id,'visibility',event.target.checked?'visible':'none')));$('#labels-switch').addEventListener('change',event=>baseSymbols.forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',event.target.checked?'visible':'none')}));
    $('#time-slider').addEventListener('input',event=>{state.frame=+event.target.value;updateFrame()});$('#play').addEventListener('click',()=>{state.playing=!state.playing;$('#play').classList.toggle('playing',state.playing);clearInterval(state.timer);if(state.playing)state.timer=setInterval(()=>{const frames=framesFor(state.field);state.frame=(state.frame+1)%frames.length;updateFrame()},1250)});
    $('#analysis-close').addEventListener('click',()=>{$('#analysis').classList.remove('open');$('#analysis').setAttribute('aria-hidden','true');map.easeTo({padding:{right:0},duration:600})});$('#search-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#place-search'),query=input.value.trim().toLowerCase(),city=cities.find(c=>c.name.toLowerCase()===query)||cities.find(c=>c.name.toLowerCase().startsWith(query));input.blur();if(city)selectCity(city)});
    $('#open-london').addEventListener('click',()=>{toggleLayers(false);selectCity(cities.find(city=>city.name==='London'))});$('#landsat-event').addEventListener('click',()=>activateLondonScene('event'));$('#landsat-latest').addEventListener('click',()=>activateLondonScene('latest'));
    $('#tour-next').addEventListener('click',()=>showTourStep(state.tourIndex+1));$('#tour-skip').addEventListener('click',endTour);
  }
})();
