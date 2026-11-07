(() => {
  const token = window.TERRAHEAT_MAPBOX_TOKEN;
  const $ = selector => document.querySelector(selector);
  let modisDates = ['2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25','2026-10-26'];
  const cities = [
    ['Cardiff','United Kingdom',-3.1791,51.4816],['London','United Kingdom',-0.1276,51.5072],['Madrid','Spain',-3.7038,40.4168],['Paris','France',2.3522,48.8566],['Rome','Italy',12.4964,41.9028],['Athens','Greece',23.7275,37.9838],['Cairo','Egypt',31.2357,30.0444],['Lagos','Nigeria',3.3792,6.5244],['Nairobi','Kenya',36.8219,-1.2921],['Cape Town','South Africa',18.4241,-33.9249],['Dubai','UAE',55.2708,25.2048],['Riyadh','Saudi Arabia',46.6753,24.7136],['Delhi','India',77.1025,28.7041],['Karachi','Pakistan',67.0099,24.8615],['Bangkok','Thailand',100.5018,13.7563],['Beijing','China',116.4074,39.9042],['Tokyo','Japan',139.6917,35.6895],['Jakarta','Indonesia',106.8456,-6.2088],['Sydney','Australia',151.2093,-33.8688],['Perth','Australia',115.8605,-31.9505],['Phoenix','United States',-112.074,33.4484],['Houston','United States',-95.3698,29.7604],['New York','United States',-74.006,40.7128],['Mexico City','Mexico',-99.1332,19.4326],['São Paulo','Brazil',-46.6333,-23.5505],['Santiago','Chile',-70.6693,-33.4489]
  ].map(([name,country,lon,lat],index)=>({name,country,lon,lat,index}));
  const cityEventNames=new Set(['Birmingham','Bristol','Manchester']);
  for(const [name,lon,lat] of [['Birmingham',-1.8904,52.4862],['Bristol',-2.5879,51.4545],['Manchester',-2.2426,53.4808]]){
    cities.push({name,country:'United Kingdom',lon,lat,index:cities.length});
  }
  const emptyFeatures={type:'FeatureCollection',features:[]};
  const state={field:'era5',frame:6,playing:false,selected:null,autoRotate:true,timer:null,tourIndex:-1,storyIndex:-1,researchLayer:'none',landsatMode:'event',thermalFront:'thermal-field',thermalTransitioning:false,thermalTransition:0,thermalSwapCount:0,thermalLastDuration:0};
  const fieldCache=new Map();
  const thermalLayers=['thermal-field','thermal-field-buffer'];
  const navigationZoom=3.1;
  const thermalOpacity=factor=>storySnapshot
    ?['interpolate',['linear'],['zoom'],0,.84*factor,2.6,.76*factor,4.4,.3*factor,6,0]
    :['interpolate',['linear'],['zoom'],0,.84*factor,2.2,.76*factor,navigationZoom,0];
  const thermalUrls={'thermal-field':'tiles/era5/6/{z}/{x}/{y}.png','thermal-field-buffer':'tiles/era5/6/{z}/{x}/{y}.png'};
  let thermalTransitionToken=0;
  let gfs,era5,live,londonBoundary,cityBoundaries,londonResearch,map,baseSymbols=[],toggleLayers=()=>{},tourTarget=null,storySnapshot=null;
  let cityEventData=null,cityEventRequest=null,stationIndexRequest=null;
  let cityBoundaryIndex=new Map();
  const ukExposureBounds=[-8.646,49.884,1.756,60.844];
  const ukExposureColors=['#393581','#79418d','#b84483','#e8655b','#ffb653','#fff2ab'];
  const ukDetailZoom=12.3;
  const ukExposureCities=[
    ...cities.filter(city=>city.country==='United Kingdom'),
    {name:'Edinburgh',lon:-3.1883,lat:55.9533},{name:'Glasgow',lon:-4.2518,lat:55.8642},
    {name:'Belfast',lon:-5.9301,lat:54.5973}
  ];
  const ukExposureLayers=['uk-utci','uk-utci-detail'];
  const ukCountryLayers=['uk-country-hit','uk-country-line','uk-country-marker','uk-country-label'];
  const cityLayers=['city-halo','city-points','city-labels'];
  const ukCityLayers=['uk-city-points','uk-city-labels'];
  let ukExposureActive=false,ukExposureEntered=false,ukExposureCity=null,exposureGuideActive=false,exposureGuideSeen=false;
  const tourSteps=[
    {target:'#layers-panel',title:'Switch global data layers',copy:'Use Layers to compare ERA5-Land daily maximum temperature, 2 m air temperature, surface skin temperature and MODIS Terra LST. The legend and timeline update with the selected field.',enter:()=>{resetGlobal(false);toggleLayers(true)}},
    {target:'#timeline',title:'Move through time',copy:'Drag the timeline or press play to move through every available frame. The valid date is always shown in the legend and beside the slider.',enter:()=>toggleLayers(false)},
    {target:'#city-rank',title:'Find the hottest cities',copy:'This list ranks the hottest sampled model cells in the current GFS frame. Choose a city here to move directly from the planetary field into its observatory view.',enter:()=>resetGlobal(false)},
    {target:'#search-form',title:'Enter the city scale',copy:'Search for a city, or zoom toward the city markers and select one. The map changes from the global field to a city observatory as you move closer.',enter:()=>map.easeTo({center:[14,18],zoom:3.2,duration:1100,essential:true})},
    {target:'#analysis',title:'Inspect real city-scale heat',copy:'London loads a Landsat surface-temperature raster at a 30 m output grid. Switch between the July 2022 event and the latest low-cloud scene while keeping the global model point metrics for context.',enter:()=>selectCity(cities.find(city=>city.name==='London'))},
    {target:'.brand',title:'Return to the planet',copy:'Use the TerraHeat logo at any time to close the city analysis, remove the local layer and return to the rotating global view.',enter:()=>resetGlobal(true)}
  ];
  const storySteps=[
    {eyebrow:'SEVEN DAYS OF EXTREME HEAT',title:'London, July 2022',copy:'A seven-day journey moves from the planetary heat field into one city. Air temperature, satellite surface temperature and environmental context are kept separate so that each layer says only what it can support.',fact:'13–19 July 2022 · ERA5-Land, Landsat, MODIS, WOW and AlphaEarth research inputs.',enter:()=>{resetGlobal(false,false);setField('era5',0)}},
    {eyebrow:'01 · THE REGIONAL FIELD',title:'Heat gathers over western Europe',copy:'ERA5-Land daily maximum 2 m air temperature shows the event at regional scale. Moving from 13 to 19 July reveals the build-up; this is reanalysis data at roughly 0.1°, not a street-level observation.',fact:'On 19 July, the hottest London grid cell in this extract reached 38.2 °C; the mean of grid-cell daily maxima was 37.3 °C.',enter:()=>{resetGlobal(false,false);setField('era5',era5.frames.length-1);map.flyTo({center:[-1.8,51.8],zoom:4.4,pitch:10,bearing:0,duration:1800,essential:true})}},
    {eyebrow:'02 · ENTER THE CITY',title:'One heatwave, many local surfaces',copy:'The London observatory combines a 35-cell full-variable weather extract with screened Met Office WOW stations. Together they provide regional continuity and a denser observational network, while retaining their different sampling and quality constraints.',fact:'The weather archive includes temperature, humidity, rainfall, radiation and wind; the chart shows the rise in grid-mean daily maximum air temperature during 13–19 July.',enter:()=>selectCity(cities.find(city=>city.name==='London'))},
    {eyebrow:'03 · THE SURFACE FROM ORBIT',title:'18 July at neighbourhood scale',copy:'Landsat 9 observed the city during the event. Warm roofs, paved surfaces, parks and water form a fine-grained thermal pattern that the regional air-temperature grid cannot show.',fact:'The product is delivered on a 30 m grid, but its thermal sensing is natively coarser. Display interpolation does not create new measured detail.',enter:()=>{selectCity(cities.find(city=>city.name==='London'));activateResearchLayer('none');activateLondonScene('event')}},
    {eyebrow:'04 · ENVIRONMENTAL CONTEXT',title:'Greenness and water reshape the pattern',copy:'Switching to summer NDVI and NDWI separates vegetation and surface-water signals from temperature. These layers can explain spatial contrasts, but by themselves they do not prove a causal cooling effect.',fact:'Use the London panel to compare summer LST, NDVI, NDWI, elevation and the AEF representation without leaving the same map extent.',enter:()=>{selectCity(cities.find(city=>city.name==='London'));activateResearchLayer('ndvi')}},
    {eyebrow:'05 · THE RESEARCH FRONTIER',title:'From heat surface to unequal exposure',copy:'The current archive provides environmental and meteorological inputs. Heatwave prediction, population exposure and spatial inequality remain explicit future modules until model outputs, validation, uncertainty and matched social data are available.',fact:'Reserved next: forecast skill and uncertainty · population-weighted exposure · deprivation, age, housing and green-space distribution.',enter:()=>{selectCity(cities.find(city=>city.name==='London'));activateResearchLayer('aef');$('#analysis').scrollTo({top:$('#analysis').scrollHeight,behavior:'smooth'})}}
  ];
  const exposureSteps=[
    {eyebrow:'PEDESTRIAN HEAT EXPOSURE · UK',title:'How hot does it feel to walk here?',
      copy:'Start with the UK during the July 2022 heatwave. The map shows the Universal Thermal Climate Index (UTCI), which expresses outdoor thermal stress as an equivalent temperature in °C.',
      fact:'18 July 2022 · 10:52 UTC · a historical model estimate.'},
    {eyebrow:'01 · THE HEAT BALANCE',title:'Air, humidity, wind and radiation',
      copy:'Air temperature, humidity and wind from 166 quality-screened UK stations adjust the ERA5 weather field. SOLWEIG estimates mean radiant temperature, which captures how much surrounding surfaces and sunlight heat a person. These four inputs feed UTCI.',
      fact:'The UK model represents flat, open grass. London uses LiDAR to resolve the effects of buildings and tree shade.'},
    {eyebrow:'02 · FOLLOW THE ZOOM',title:'From the country to a city',
      copy:'Zoom in or select a city marker. The national view averages results into 500 m cells. At city scale the map automatically loads 100 m cells for the visible area. Zoom out to return to the overview.',
      fact:'The UK weather field is estimated on a 0.25° mesh. The 100 m grid samples that field at finer spacing.'},
    {eyebrow:'03 · ON THE STREET',title:'Follow the shade in London',
      copy:'At street scale in Greater London, the map switches to the pedestrian model. Its 100 m cells summarize UTCI along sampled walking routes. Tap near a cell centre to read UTCI, mean radiant temperature and sunlit fraction.',
      fact:'London uses relative colour to highlight local contrasts. Tap a cell for its UTCI in °C.',
      enter:()=>{const london=ukExposureCities.find(city=>city.name==='London');flyToExposureCity(london)}}
  ];

  if(!token||!window.mapboxgl){showFatal('Mapbox token or library is missing.');return}
  mapboxgl.accessToken=token;

  Promise.all([
    fetch('gfs-temperature-day.json').then(r=>{if(!r.ok)throw new Error('GFS data unavailable');return r.json()}),
    fetch('data/era5-land-heatwave.json').then(r=>{if(!r.ok)throw new Error('ERA5 data unavailable');return r.json()}),
    fetch('data/live-manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
    fetch('data/greater-london-boundary.geojson').then(r=>{if(!r.ok)throw new Error('Greater London boundary unavailable');return r.json()}),
    fetch('data/city-boundaries.geojson?v=20261107').then(r=>{if(!r.ok)throw new Error('City boundaries unavailable');return r.json()}),
    fetch('data/london-research/manifest.json?v=london-layers-20261104-2',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('London research manifest unavailable');return r.json()})
  ]).then(([gfsData,era5Data,liveData,boundaryData,cityBoundaryData,researchData])=>{gfs=gfsData;era5=era5Data;live=liveData;londonBoundary=boundaryData;cityBoundaries=cityBoundaryData;londonResearch=researchData;cityBoundaryIndex=new Map(cityBoundaries.features.map(feature=>[feature.properties.name,feature]));if(live?.modis?.dates?.length)modisDates=live.modis.dates;init()}).catch(error=>showFatal(error.message));

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
  function signedArea(ring){let area=0;for(let i=0;i<ring.length-1;i++)area+=ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1];return area/2}
  function londonMask(){
    const geometry=londonBoundary.features[0].geometry,polygons=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.coordinates.map? [geometry.coordinates]:[],outer=[[-20,30],[20,30],[20,70],[-20,70],[-20,30]],holes=polygons.map(polygon=>{const ring=polygon[0].map(point=>[point[0],point[1]]);return signedArea(ring)>0?ring.reverse():ring});
    return {type:'Feature',properties:{name:'Outside Greater London mask'},geometry:{type:'Polygon',coordinates:[outer,...holes]}};
  }

  function thermalUrl(field,index){return `tiles/${field}/${index}/{z}/{x}/{y}.png`}
  function thermalBack(){return state.thermalFront==='thermal-field'?'thermal-field-buffer':'thermal-field'}
  function setThermalMix(layer,factor){if(map?.getLayer(layer))map.setPaintProperty(layer,'raster-opacity',thermalOpacity(Math.max(.001,Math.min(1,factor))))}
  function waitForThermalSource(sourceId,token,timeout=7000){
    return new Promise(resolve=>{
      if(token!==thermalTransitionToken)return resolve(false);
      if(map.isSourceLoaded(sourceId))return resolve(true);
      let finished=false;
      const done=value=>{if(finished)return;finished=true;clearTimeout(timer);map.off('sourcedata',onData);resolve(value)};
      const onData=event=>{if(event.sourceId===sourceId&&map.isSourceLoaded(sourceId))done(true)};
      const timer=setTimeout(()=>done(token===thermalTransitionToken&&map.isSourceLoaded(sourceId)),timeout);
      map.on('sourcedata',onData);
    });
  }
  function cancelThermalTransition(){
    thermalTransitionToken++;state.thermalTransitioning=false;state.thermalTransition=0;
    const front=state.thermalFront,back=thermalBack();setThermalMix(front,1);setThermalMix(back,0);
  }
  function primeNextThermal(){
    if(state.field==='modis'||state.thermalTransitioning||!map?.isStyleLoaded())return;
    const frames=framesFor(state.field),next=(state.frame+1)%frames.length,back=thermalBack(),url=thermalUrl(state.field,next);
    setThermalMix(back,0);
    if(thermalUrls[back]!==url){thermalUrls[back]=url;map.getSource(back).setTiles([url])}
  }
  async function transitionThermal(url){
    const token=++thermalTransitionToken,front=state.thermalFront,back=thermalBack();
    state.thermalTransitioning=true;state.thermalTransition=0;
    thermalLayers.forEach(id=>map.setLayoutProperty(id,'visibility','visible'));setThermalMix(front,1);setThermalMix(back,0);
    if(thermalUrls[front]===url){state.thermalTransitioning=false;primeNextThermal();return}
    if(thermalUrls[back]!==url){thermalUrls[back]=url;map.getSource(back).setTiles([url])}
    if(!await waitForThermalSource(back,token)||token!==thermalTransitionToken){if(token===thermalTransitionToken)state.thermalTransitioning=false;return}
    const started=performance.now(),duration=900;
    const step=now=>{
      if(token!==thermalTransitionToken)return
      const progress=Math.min(1,(now-started)/duration),eased=progress*progress*(3-2*progress);
      state.thermalTransition=eased;setThermalMix(front,1-eased);setThermalMix(back,eased);
      if(progress<1)requestAnimationFrame(step);else{
        state.thermalFront=back;state.thermalTransitioning=false;state.thermalTransition=1;
        state.thermalSwapCount++;state.thermalLastDuration=performance.now()-started;
        setThermalMix(front,0);setThermalMix(back,1);primeNextThermal();
      }
    };
    requestAnimationFrame(step);
  }

  function init(){
    setupMapFloats();
    map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/dark-v11',projection:'globe',center:[14,18],zoom:1.35,pitch:0,bearing:0,antialias:true,attributionControl:true});
    map.addControl(new mapboxgl.NavigationControl({showCompass:true,visualizePitch:true}),'top-right');
    map.on('error',event=>{const text=String(event.error?.message||'');if(/401|403|access token|style/i.test(text))showFatal('Mapbox rejected the token. Check its URL restrictions for localhost.')});
    map.on('load',setupMap);
  }
  function setupMap(){
    map.setFog({'space-color':'#050505','star-intensity':.18,'horizon-blend':.05,'color':'#171716','high-color':'#2c2624'});
    const styleLayers=map.getStyle().layers;baseSymbols=styleLayers.filter(layer=>layer.type==='symbol').map(layer=>layer.id);
    const firstSymbol=baseSymbols[0],firstRoad=styleLayers.find(layer=>layer.type==='line'&&/(road|street|transport)/i.test(layer.id))?.id||firstSymbol;
    setupUkExposure(firstRoad);
    map.addSource('thermal-field',{type:'raster',tiles:[thermalUrls['thermal-field']],tileSize:256,minzoom:0,maxzoom:2});
    map.addLayer({id:'thermal-field',type:'raster',source:'thermal-field',paint:{'raster-opacity':thermalOpacity(1),'raster-resampling':'linear','raster-fade-duration':0}},firstSymbol);
    map.addSource('thermal-field-buffer',{type:'raster',tiles:[thermalUrls['thermal-field-buffer']],tileSize:256,minzoom:0,maxzoom:2});
    map.addLayer({id:'thermal-field-buffer',type:'raster',source:'thermal-field-buffer',paint:{'raster-opacity':thermalOpacity(.001),'raster-resampling':'linear','raster-fade-duration':0}},firstSymbol);
    map.addSource('modis-field',{type:'raster',tiles:[modisUrl(modisDates.at(-1))],tileSize:256,minzoom:0,maxzoom:7,attribution:'NASA GIBS · MODIS Terra MOD11A1 v6.1'});
    map.addLayer({id:'modis-field',type:'raster',source:'modis-field',layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],0,.82,2.2,.72,navigationZoom,0],'raster-resampling':'linear','raster-fade-duration':420}},firstSymbol);
    map.addSource('cities',{type:'geojson',data:cityFeatures()});
    map.addLayer({id:'city-halo',type:'circle',source:'cities',minzoom:1.4,maxzoom:8,paint:{'circle-radius':['interpolate',['linear'],['zoom'],1.4,3,4,10,7,18],'circle-color':['interpolate',['linear'],['get','at'],-10,'#4f6ea7',15,'#9c5a8b',30,'#e16750',45,'#ffd16b'],'circle-blur':.8,'circle-opacity':['interpolate',['linear'],['zoom'],1.4,0,2.2,.48,5,.36,7,0]}});
    map.addLayer({id:'city-points',type:'circle',source:'cities',minzoom:1.4,maxzoom:8,paint:{'circle-radius':['interpolate',['linear'],['zoom'],1.4,1.5,4,5.5,7,7],'circle-color':['interpolate',['linear'],['get','at'],-10,'#4f77bd',10,'#875a9b',25,'#df5a58',40,'#ffd36f'],'circle-stroke-color':'rgba(255,245,229,.72)','circle-stroke-width':['interpolate',['linear'],['zoom'],2,0,4,.8],'circle-opacity':['interpolate',['linear'],['zoom'],1.4,0,2.2,.86,6,.96,7,0]}});
    map.addLayer({id:'city-labels',type:'symbol',source:'cities',minzoom:3.2,maxzoom:8,layout:{'text-field':['get','name'],'text-font':['DIN Pro Medium','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],3.2,9,6,12],'text-offset':[0,1.2],'text-anchor':'top','text-allow-overlap':false},paint:{'text-color':'#e8e1d8','text-halo-color':'rgba(10,10,9,.9)','text-halo-width':1.2,'text-opacity':['interpolate',['linear'],['zoom'],3.2,0,4.1,.95,7,0]}});
    cityLayers.forEach(id=>map.setFilter(id,['!=',['get','country'],'United Kingdom']));
    map.addSource('local-heat',{type:'image',url:blankImage(),coordinates:[[0,0],[.01,0],[.01,-.01],[0,-.01]]});
    map.addLayer({id:'local-heat',type:'raster',source:'local-heat',minzoom:5.8,layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],5.8,0,7.2,.88,11,.7,13,.25],'raster-resampling':'linear','raster-fade-duration':600}},firstSymbol);
    const londonEvent=londonScenes().event;
    map.addSource('london-landsat',{type:'raster',tiles:[landsatTile(londonEvent)],tileSize:256,minzoom:7,maxzoom:15,attribution:'USGS Landsat Collection 2 Level-2 · Microsoft Planetary Computer'});
    map.addLayer({id:'london-landsat',type:'raster',source:'london-landsat',minzoom:7,layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,0,8.5,.68,11,.62,13,.56,15,.48],'raster-resampling':'linear','raster-fade-duration':650,'raster-saturation':-.08,'raster-contrast':.08,'raster-brightness-max':.92}},firstRoad);
    const firstResearch=londonResearch.layers[0];
    map.addSource('london-research',{type:'image',url:firstResearch.image,coordinates:firstResearch.coordinates});
    map.addLayer({id:'london-research',type:'raster',source:'london-research',minzoom:7,layout:{visibility:'none'},paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,0,8.5,.72,11,.64,14,.5],'raster-resampling':'linear','raster-fade-duration':450}},firstRoad);
    map.addSource('london-mask',{type:'geojson',data:londonMask()});
    map.addLayer({id:'london-mask',type:'fill',source:'london-mask',minzoom:7,layout:{visibility:'none'},paint:{'fill-color':'#0f0f0e','fill-opacity':['interpolate',['linear'],['zoom'],7,0,8.5,.96,10,1]}},firstRoad);
    map.addSource('london-outline',{type:'geojson',data:londonBoundary,attribution:'Greater London Authority · OGL v3.0'});
    map.addLayer({id:'london-outline',type:'line',source:'london-outline',minzoom:7,layout:{visibility:'none'},paint:{'line-color':'#f2b267','line-width':['interpolate',['linear'],['zoom'],8,.9,10,1.5,13,2.2],'line-opacity':.9,'line-blur':.15}},firstRoad);
    map.addSource('london-utci',{type:'geojson',data:emptyFeatures,attribution:'Environment Agency LiDAR · OpenStreetMap · SOLWEIG'});
    map.addLayer({id:'london-utci',type:'heatmap',source:'london-utci',minzoom:7,layout:{visibility:'none'},paint:{
      'heatmap-weight':['*',['get','edgeWeight'],['interpolate',['linear'],['get','utci'],34.8,.13,37.4,1]],
      'heatmap-intensity':.58,
      'heatmap-opacity':['interpolate',['linear'],['zoom'],7,.45,9,.77,14,.70,17,.52],
      'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(75,44,133,0)',.12,'#4b2c85',.29,'#a23881',.47,'#ed6455',.66,'#fca947',1,'#fff5b0']
    }},firstRoad);
    map.addLayer({id:'london-utci-pick',type:'circle',source:'london-utci',minzoom:7,layout:{visibility:'none'},
      paint:{'circle-radius':13,'circle-color':'rgba(0,0,0,0)'}},firstSymbol);
    map.on('click','london-utci-pick',showPedestrianCell);
    map.on('moveend',()=>{if(pedestrianActive&&!ukExposureActive)updatePedestrianHeat()});
    map.addSource('wow-heat',{type:'image',url:blankImage(),coordinates:firstResearch.coordinates});
    map.addLayer({id:'wow-heat',type:'raster',source:'wow-heat',minzoom:7,layout:{visibility:'none'},paint:{
      'raster-opacity':['interpolate',['linear'],['zoom'],7,.36,9,.92,11,.83,13,.66,15,.52],
      'raster-resampling':'linear',
      'raster-fade-duration':150
    }},firstRoad);
    map.addSource('wow-wind',{type:'geojson',data:emptyFeatures});
    const arrow=document.createElement('canvas');arrow.width=arrow.height=28;
    const ctx=arrow.getContext('2d');
    ctx.beginPath();ctx.moveTo(14,3);ctx.lineTo(22,23);ctx.lineTo(14,19);ctx.lineTo(6,23);ctx.closePath();
    ctx.fillStyle='#91e9f0';ctx.fill();ctx.strokeStyle='#102d39';ctx.lineWidth=2;ctx.stroke();
    map.addImage('wow-wind-arrow',ctx.getImageData(0,0,28,28),{pixelRatio:2});
    map.addLayer({id:'wow-direction',type:'symbol',source:'wow-wind',minzoom:7,layout:{
      visibility:'none','icon-image':'wow-wind-arrow','icon-rotate':['get','direction'],
      'icon-rotation-alignment':'map','icon-offset':[0,-15],'icon-allow-overlap':true
    }});
    map.addSource('wow-stations',{type:'geojson',data:emptyFeatures,attribution:'Met Office WOW · NOAA NCEI Global Hourly'});
    map.addLayer({id:'wow-stations-halo',type:'circle',source:'wow-stations',minzoom:7,paint:{'circle-radius':['interpolate',['linear'],['zoom'],7,7,12,13],'circle-color':'#55dded','circle-opacity':.22,'circle-blur':.65}},firstSymbol);
    map.addLayer({id:'wow-stations',type:'circle',source:'wow-stations',minzoom:7,paint:{'circle-radius':['interpolate',['linear'],['zoom'],7,3,12,5.5],'circle-color':'#102e3b','circle-stroke-color':'#78ecf5','circle-stroke-width':1.6,'circle-opacity':.96}},firstSymbol);
    map.addSource('city-boundary',{type:'geojson',data:{type:'FeatureCollection',features:[]},attribution:'© OpenStreetMap contributors · ODbL 1.0'});
    map.addLayer({id:'city-boundary-fill',type:'fill',source:'city-boundary',minzoom:5.5,paint:{'fill-color':'#ef6548','fill-opacity':['interpolate',['linear'],['zoom'],5.5,0,7,.035,10,.065]}},firstSymbol);
    map.addLayer({id:'city-boundary',type:'line',source:'city-boundary',minzoom:5.5,paint:{'line-color':'rgba(255,190,151,.88)','line-width':['interpolate',['linear'],['zoom'],5.5,.7,10,1.35,13,2],'line-dasharray':[2,1.4],'line-opacity':['interpolate',['linear'],['zoom'],5.5,0,6.5,.82]}},firstSymbol);
    map.on('click','city-points',event=>{if(!map.queryRenderedFeatures(event.point,{layers:['wow-stations','london-utci-pick']}).length)selectCity(featureCity(event.features[0]))});
    map.on('mouseenter','city-points',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','city-points',()=>map.getCanvas().style.cursor='');
    map.on('click','wow-stations',event=>openWowStation(event.features[0]));
    map.on('mouseenter','wow-stations',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','wow-stations',()=>map.getCanvas().style.cursor='');
    map.on('zoom',updateScale);map.on('moveend',spinGlobe);
    map.on('moveend',()=>{
      if(ukExposureActive&&ukExposureEntered&&map.getZoom()<navigationZoom){
        hideUkExposure();
        updateFrame();
        updateScale();
      }else if(ukExposureActive)syncUkStreetDetail();
    });
    ['mousedown','touchstart','wheel','dragstart'].forEach(name=>map.on(name,()=>{state.autoRotate=false}));
    wireUI();populateCityOptions();renderRanks();renderLondonResearch();setField('era5',era5.frames.length-1);updateScale();
    $('#map-loading').classList.add('done');setTimeout(spinGlobe,700);
    window.__terraHeatMap={map,state,cities,cityBoundaries,londonResearch,selectCity,setField,transitionThermal,activateResearchLayer};
  }
  function setupUkExposure(before){
    const attribution='NOAA NCEI Global Hourly · Copernicus ERA5 · SOLWEIG · geoBoundaries / Eurostat GISCO';
    const hidden={visibility:'none'};
    map.addSource('uk-utci',{type:'raster',tiles:['data/uk-utci-grid/500m/{z}/{x}/{y}.webp'],tileSize:512,
      minzoom:4,maxzoom:8,bounds:ukExposureBounds,attribution});
    map.addSource('uk-utci-detail',{type:'raster',tiles:['data/uk-utci-grid/100m/{z}/{x}/{y}.webp'],tileSize:512,
      minzoom:10,maxzoom:10,bounds:ukExposureBounds,attribution});
    map.addLayer({id:'uk-utci',type:'raster',source:'uk-utci',maxzoom:ukDetailZoom+.3,layout:hidden,paint:{
      'raster-opacity':['interpolate',['linear'],['zoom'],ukDetailZoom-.35,.72,ukDetailZoom+.3,0],
      'raster-resampling':'linear','raster-fade-duration':620
    }},before);
    map.addLayer({id:'uk-utci-detail',type:'raster',source:'uk-utci-detail',minzoom:ukDetailZoom-.35,layout:hidden,paint:{
      'raster-opacity':['interpolate',['linear'],['zoom'],ukDetailZoom-.35,0,ukDetailZoom+.3,.72],
      'raster-resampling':'linear','raster-fade-duration':520
    }},before);

    map.addSource('uk-country',{type:'geojson',data:'data/uk-utci-grid/boundary.geojson',attribution:'geoBoundaries / Eurostat GISCO · CC BY 4.0'});
    map.addSource('uk-country-point',{type:'geojson',data:{type:'Point',coordinates:[-2.7,55.6]}});
    map.addSource('uk-exposure-cities',{type:'geojson',data:{type:'FeatureCollection',features:ukExposureCities.map(city=>({
      type:'Feature',properties:{name:city.name},geometry:{type:'Point',coordinates:[city.lon,city.lat]}
    }))}});
    map.addLayer({id:'uk-country-hit',type:'fill',source:'uk-country',minzoom:navigationZoom,layout:hidden,
      paint:{'fill-color':'#e8bc84','fill-opacity':.07}},before);
    map.addLayer({id:'uk-country-line',type:'line',source:'uk-country',minzoom:navigationZoom,layout:hidden,
      paint:{'line-color':'#e8bc84','line-opacity':.62,'line-width':1.1}},before);
    const pointPaint={'circle-radius':4.8,'circle-color':'#f1c792','circle-stroke-color':'#25211c','circle-stroke-width':1.4};
    map.addLayer({id:'uk-country-marker',type:'circle',source:'uk-country-point',minzoom:navigationZoom,layout:hidden,
      paint:{...pointPaint,'circle-radius':7}});
    map.addLayer({id:'uk-country-label',type:'symbol',source:'uk-country-point',minzoom:navigationZoom,
      layout:{...hidden,'text-field':'United Kingdom','text-size':12,'text-offset':[0,1.3],'text-allow-overlap':true},
      paint:{'text-color':'#f1c792','text-halo-color':'#171411','text-halo-width':1.6}});
    map.addLayer({id:'uk-city-points',type:'circle',source:'uk-exposure-cities',minzoom:4.15,maxzoom:10,
      layout:hidden,paint:pointPaint});
    map.addLayer({id:'uk-city-labels',type:'symbol',source:'uk-exposure-cities',minzoom:4.25,maxzoom:10,
      layout:{...hidden,'text-field':['get','name'],'text-size':11,'text-offset':[0,1.15]},
      paint:{'text-color':'#eee2cf','text-halo-color':'#171411','text-halo-width':1.4}});

    const cityTargets=['uk-city-points','uk-city-labels'];
    const countryTargets=['uk-country-hit','uk-country-marker','uk-country-label'];
    map.on('click',event=>{
      if(storySnapshot||(!ukExposureActive&&(state.selected||map.getZoom()<navigationZoom)))return;
      if(!ukExposureActive&&map.queryRenderedFeatures(event.point,{layers:['uk-country-marker']}).length){
        activateUkExposure();
        return;
      }
      const [city]=map.queryRenderedFeatures(event.point,{layers:cityTargets});
      if(city){activateUkExposure(ukExposureCities.find(place=>place.name===city.properties.name));return}
      if(ukExposureActive||map.queryRenderedFeatures(event.point,{layers:['city-points']}).length)return;
      if(map.queryRenderedFeatures(event.point,{layers:countryTargets}).length)activateUkExposure();
    });
    [...cityTargets,...countryTargets].forEach(id=>{
      map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');
      map.on('mouseleave',id,()=>map.getCanvas().style.cursor='');
    });
  }
  function modisUrl(date){return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/all/MODIS_Terra_Land_Surface_Temp_Day_v6.1_STD/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`}
  function featureCity(feature){const name=feature?.properties?.name;return cities.find(city=>city.name===name)}
  function framesFor(field){return field==='era5'?era5.frames:field==='modis'?modisDates.map(date=>({date})):gfs.frames}
  function frameLabel(field,index){const item=framesFor(field)[index];return field==='era5'||field==='modis'?item.date:new Date(item.validIso).toISOString().slice(0,16).replace('T',' ')}
  function utcStamp(value){
    if(!value||!Number.isFinite(Date.parse(value)))return 'Not recorded';
    return new Date(value).toISOString().slice(0,16).replace('T',' ')+' UTC';
  }
  function showLayerProvenance({kind,valid,updateLabel='Updated',updated,missing}){
    $('#layer-kind').textContent=kind;
    $('#layer-valid').textContent=valid;
    $('#layer-update-label').textContent=updateLabel;
    $('#layer-updated').textContent=updated;
    $('#layer-missing').textContent=missing;
  }
  function showGlobalProvenance(field,index){
    const frame=framesFor(field)[index];
    if(field==='era5'){
      showLayerProvenance({kind:'Historical replay · reanalysis',valid:frame.date+' · daily maximum (UTC)',updated:'Fixed July 2022 archive · build time not recorded',missing:'Pixel coverage not quantified in this archive'});
      return;
    }
    if(field==='modis'){
      showLayerProvenance({kind:live?.modis?.dates?.length?'Recent satellite · daytime LST':'Bundled satellite dates · fallback',valid:frame.date+' · daytime acquisition',updateLabel:'Catalog checked',updated:utcStamp(live?.modis?.dates?.length?live.generatedAt:null),missing:'Clouds and unavailable swaths can leave gaps. Coverage is not quantified.'});
      return;
    }
    const values=frame[field];
    const missing=values.reduce((count,value)=>count+Number(!Number.isFinite(value)),0);
    showLayerProvenance({kind:'Fixed model snapshot · NOAA GFS',valid:utcStamp(frame.validIso),updateLabel:'Packaged',updated:utcStamp(gfs.generatedIso),missing:`${missing.toLocaleString()} of ${values.length.toLocaleString()} grid cells missing`});
  }
  function shortDate(value){const date=new Date(value.length===10?`${value}T00:00:00Z`:value+'Z');return date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:value.length===10?'numeric':undefined,timeZone:'UTC'}).toUpperCase()+(value.length>10?` ${value.slice(11,16)}Z`:'')}
  function setField(field,index){
    hideUkExposure();
    state.field=field;const frames=framesFor(field);state.frame=Math.max(0,Math.min(frames.length-1,index??frames.length-1));
    const slider=$('#time-slider');slider.max=frames.length-1;slider.value=state.frame;
    $('#time-start').textContent=shortDate(frameLabel(field,0)).replace(/ 20\d\d/,'');$('#time-end').textContent=shortDate(frameLabel(field,frames.length-1)).replace(/ 20\d\d/,'');
    document.querySelector(`input[name=field][value=${field}]`).checked=true;updateFrame();updateScale();
  }
  function updateFrame(){
    $('#legend .temperature-ramp').style.background='';$('#legend>small').textContent='°C · DAILY FIELD';
    const field=state.field,index=state.frame,label=frameLabel(field,index),isModis=field==='modis',styleReady=Boolean(map?.getSource('modis-field')&&map.getSource(state.thermalFront));
    if(styleReady){thermalLayers.forEach(id=>map.setLayoutProperty(id,'visibility',isModis?'none':'visible'));map.setLayoutProperty('modis-field','visibility',isModis?'visible':'none')}
    if(isModis){if(styleReady){cancelThermalTransition();map.getSource('modis-field').setTiles([modisUrl(modisDates[index])])}$('#legend-name').textContent='MODIS TERRA LST';$('#time-type').textContent='MODIS TERRA'}
    else{if(styleReady)transitionThermal(thermalUrl(field,index));const names={era5:'ERA5-LAND TMAX',at:'GFS 2 M AIR',lst:'GFS SKIN LST'};$('#legend-name').textContent=names[field];$('#time-type').textContent=names[field]}
    const tickSets={era5:['−40','−10','10','30','50+'],at:['−40','−10','10','30','50+'],lst:['−20','0','20','40','60+'],modis:['−20','0','20','40','60+']};
    $('#legend').dataset.field=field;$('#legend-ticks').innerHTML=tickSets[field].map(value=>`<span>${value}</span>`).join('');
    $('#legend-date').textContent=label;$('#time-value').textContent=shortDate(label);$('#time-slider').value=index;
    showGlobalProvenance(field,index);
  }
  function clearCityClimate(){
    cityEventRequest?.abort();
    stationIndexRequest?.abort();
    cityEventData=null;
    $('#city-event').hidden=true;
    $('#city-station-control').hidden=true;
    $('#research-stations-switch').checked=false;
    map.getSource('wow-stations').setData(emptyFeatures);
    hideWowSurface();
    hidePedestrianHeat();
    closeWowStation();
  }
  function hideUkExposure(){
    if(!ukExposureActive)return;
    if(exposureGuideActive)endStory(false);
    leaveUkStreetDetail();
    ukExposureActive=false;
    ukExposureCity=null;
    ukExposureLayers.forEach(id=>setLayerVisible(id,false));
    $('#exposure-uk').setAttribute('aria-pressed','false');
    document.querySelector(`input[name=field][value=${state.field}]`).checked=true;
    $('#timeline').classList.remove('city-raster-active');
  }
  function setLayerVisible(id,visible){
    const value=visible?'visible':'none';
    if(map.getLayoutProperty(id,'visibility')!==value)map.setLayoutProperty(id,'visibility',value);
  }
  function activateUkExposure(city=null,intro=true){
    if(!map?.getLayer('uk-utci'))return;
    if(storySnapshot)endStory(false);
    map.stop();
    leaveUkStreetDetail();
    pausePlayback();
    cancelThermalTransition();
    clearCityClimate();
    state.selected=null;
    state.autoRotate=false;
    $('#welcome').classList.add('dismissed');
    $('#analysis').classList.remove('open','london-mode');
    $('#analysis').setAttribute('aria-hidden','true');
    $('#urban-raster').hidden=true;
    $('#london-research').hidden=true;
    $('#place-search').value='';
    map.getSource('city-boundary').setData(emptyFeatures);
    [...thermalLayers,'modis-field','local-heat','london-landsat','london-mask','london-outline','london-research']
      .forEach(id=>map.setLayoutProperty(id,'visibility','none'));
    ukExposureActive=true;
    ukExposureEntered=map.getZoom()>=navigationZoom;
    ukExposureCity=city;
    ukExposureLayers.forEach(id=>setLayerVisible(id,true));
    $('#exposure-uk').setAttribute('aria-pressed','true');
    document.querySelectorAll('input[name=field]').forEach(input=>{input.checked=false});
    $('#timeline').classList.add('city-raster-active');
    showUkExposureLegend();
    updateScale();
    if(city)flyToExposureCity(city);
    else{
      map.fitBounds(ukExposureBounds,{padding:{top:96,right:38,bottom:96,left:38},pitch:0,bearing:0,duration:1900});
      if(intro&&!exposureGuideSeen)startExposureGuide();
    }
  }
  function flyToExposureCity(city){
    ukExposureCity=city;
    map.flyTo({center:[city.lon,city.lat],zoom:12.7,pitch:0,bearing:0,duration:1900,essential:true,
      padding:{top:0,right:0,bottom:0,left:0}});
  }
  function showUkExposureLegend(){
    $('#legend').dataset.field='uk-utci';
    $('#legend-name').textContent='UK OPEN-SKY HEAT · UTCI';
    $('#legend-date').textContent='18 JUL 2022 · 10:52Z';
    $('#legend .temperature-ramp').style.background=`linear-gradient(90deg,${ukExposureColors.join(',')})`;
    $('#legend-ticks').innerHTML=['≤16','20','24','28','32','≥36'].map(value=>`<span>${value}</span>`).join('');
    showLayerProvenance({kind:'Historical open-sky estimate · 166 NOAA stations + ERA5 + SOLWEIG',
      valid:'18 July 2022 · 10:52 UTC',updated:'Fixed July 2022 simulation',
      missing:'Weather is estimated on a 0.25° mesh. The 100 m output is averaged into 500 m overview cells. The model assumes flat, open grass.'});
  }
  function insideLondon({lng,lat}){
    const insideRing=ring=>{
      let inside=false;
      for(let i=0,j=ring.length-1;i<ring.length;j=i++){
        const [x,y]=ring[i],[previousX,previousY]=ring[j];
        if((y>lat)!==(previousY>lat)&&lng<(previousX-x)*(lat-y)/(previousY-y)+x)inside=!inside;
      }
      return inside;
    };
    const boundary=londonBoundary.features[0].geometry;
    const polygons=boundary.type==='MultiPolygon'?boundary.coordinates:[boundary.coordinates];
    return polygons.some(([outline,...holes])=>insideRing(outline)&&!holes.some(insideRing));
  }
  function leaveUkStreetDetail(){
    if(!ukExposureActive||!pedestrianActive)return;
    hidePedestrianHeat();
    setLayerVisible('london-outline',false);
    state.researchLayer='none';
  }
  async function syncUkStreetDetail(){
    if(map.getZoom()<ukDetailZoom||!insideLondon(map.getCenter().wrap())){
      if(!pedestrianActive){updateScale();return}
      leaveUkStreetDetail();
      ukExposureLayers.forEach(id=>setLayerVisible(id,true));
      showUkExposureLegend();
      updateScale();
      return;
    }
    const ready=await (pedestrianActive?updatePedestrianHeat():activatePedestrianHeat());
    if(ready&&ukExposureActive&&pedestrianActive){
      ukExposureLayers.forEach(id=>setLayerVisible(id,false));
      updateScale();
    }else if(ready===false&&ukExposureActive&&pedestrianActive){
      leaveUkStreetDetail();
      ukExposureLayers.forEach(id=>setLayerVisible(id,true));
      showUkExposureLegend();
      updateScale();
    }else if(ukExposureActive)updateScale();
  }
  async function loadCityEvent(city){
    cityEventRequest?.abort();
    const request=new AbortController();
    cityEventRequest=request;
    $('#city-event-summary').textContent='Loading July 2022 archive…';
    $('#wow-station-count').textContent='Loading station index…';
    $('#city-event-actions').hidden=true;
    $('#city-event-chart').hidden=true;
    const local=cityEventNames.has(city.name);
    const slug=encodeURIComponent(city.name.toLowerCase());
    $('#city-event-title').textContent=local?'13–19 July 2022 heatwave':'July 2022 · historical weather';
    $('#city-event-source').textContent=local?'ERA5-Land via Open-Meteo · regional mean Tmax':'ERA5-Land via Open-Meteo · city-centre sample · Tmax / Tmin';
    $('#city-station-label').textContent=local?'WOW station network':'NOAA station observation';
    $('#locate-city-station').hidden=true;
    try{
      const url=local?`data/city-heatwave/${slug}/event.json?v=1`:`data/city-climate/${slug}.json`;
      const response=await fetch(url,{signal:request.signal});
      if(!response.ok)throw new Error('City archive unavailable');
      const data=await response.json();
      if(request.signal.aborted)return;
      cityEventData=data;
      const days=local?Object.entries(data.frames).map(([date, values])=>{
        const valid=values.filter(Number.isFinite);
        return [date,valid.length?valid.reduce((sum,value)=>sum+value,0)/valid.length:null];
      }):data.days;
      renderCityClimate(days,local);
      updateWowStations();
    }catch(error){
      if(request.signal.aborted)return;
      $('#city-event-summary').textContent='Archive unavailable. Select retry to load it again.';
      $('#wow-station-count').textContent='Station index unavailable';
      $('#city-event-actions').hidden=false;
    }
  }
  function renderCityClimate(days,local){
    const svg=$('#city-event-chart'),valid=days.flatMap(day=>day.slice(1)).filter(Number.isFinite);
    if(!valid.length){$('#city-event-summary').textContent='No daily values in this archive.';return}
    const hottest=days.reduce((best,day)=>Number.isFinite(day[1])&&day[1]>(best[1]??-Infinity)?day:best,days[0]);
    $('#city-event-summary').textContent=`${local?'Peak grid-mean Tmax':'Peak daily Tmax'} · ${hottest[1].toFixed(1)} °C · ${shortDate(hottest[0])}`;
    const lo=Math.floor(Math.min(...valid)/5)*5-5,hi=Math.ceil(Math.max(...valid)/5)*5+5;
    const x=i=>30+i*273/(days.length-1),y=v=>81-(v-lo)*68/(hi-lo);
    const path=column=>{
      let drawing=false;
      return days.map((day,i)=>{
        if(!Number.isFinite(day[column])){drawing=false;return ''}
        const command=drawing?'L':'M';drawing=true;return `${command}${x(i)},${y(day[column])}`;
      }).join(' ');
    };
    const guides=[lo,(lo+hi)/2,hi].map(v=>`<line x1="30" y1="${y(v)}" x2="303" y2="${y(v)}" class="weather-grid"/><text x="2" y="${y(v)+3}" fill="#aec8ca" font-size="8">${v}°</text>`).join('');
    svg.innerHTML=`${guides}<path d="${path(1)}" class="weather-mean"/>${local?'':`<path d="${path(2)}" class="city-climate-min"/>`}<text x="30" y="96" fill="#aec8ca" font-size="8">${days[0][0].slice(8)} JUL</text><text x="303" y="96" fill="#aec8ca" font-size="8" text-anchor="end">${days.at(-1)[0].slice(8)} JUL</text>`;
    svg.hidden=false;
    bindCurveTooltip(svg,(px,py)=>{
      const i=Math.max(0,Math.min(days.length-1,Math.round((px-30)/273*(days.length-1))));
      const [date,max,min]=days[i];
      if(!Number.isFinite(max))return null;
      return {x:x(i),y:Number.isFinite(min)&&Math.abs(y(min)-py)<Math.abs(y(max)-py)?y(min):y(max),text:`${date}\n${local?'Grid-mean Tmax':'Tmax'} ${max.toFixed(1)} °C${Number.isFinite(min)?`\nTmin ${min.toFixed(1)} °C`:''}`};
    });
  }
  async function updateWowStations(){
    stationIndexRequest?.abort();
    const source=map.getSource('wow-stations'),control=$('#research-stations-switch'),status=$('#wow-station-count');
    if(!control.checked){
      source.setData(emptyFeatures);
      closeWowStation();
    }
    if(state.selected?.name!=='London'){
      if(cityEventData){
        const stations=cityEventData.stations;
        const local=cityEventNames.has(state.selected?.name),nearest=stations.features[0];
        status.textContent=local?`${stations.features.length} screened sites · 13–19 July 2022`:nearest?`${nearest.properties.distanceKm} km from city centre · 13–19 July 2022`:'No nearby station with sufficient July 2022 data';
        $('#locate-city-station').hidden=local||!nearest||!control.checked;
        if(control.checked)source.setData(stations);
      }
      return;
    }
    status.textContent=`${londonResearch.stations.count} screened sites · June–August 2022`;
    if(!control.checked)return;
    const request=new AbortController();
    stationIndexRequest=request;
    status.textContent='Loading station index…';
    try{
      const response=await fetch('data/london-research/wow-stations.geojson?v=wow-series-20261104',{signal:request.signal});
      if(!response.ok)throw new Error('Station index unavailable');
      const stations=await response.json();
      if(request.signal.aborted)return;
      source.setData(stations);
      status.textContent=`${stations.features.length} screened sites · June–August 2022`;
    }catch(error){
      if(!request.signal.aborted){
        control.checked=false;
        status.textContent='Station index unavailable · switch on to retry';
      }
    }
  }
  function selectCity(city){
    if(!city)return;hideUkExposure();pausePlayback();clearCityClimate();state.selected=city;state.autoRotate=false;const series=nearestSeries(city);
    const isLondon=city.name==='London',boundary=cityBoundaryIndex.get(city.name);['london-landsat','london-mask','london-outline'].forEach(id=>map.setLayoutProperty(id,'visibility',isLondon?'visible':'none'));if(!isLondon)hideLondonResearch();map.setLayoutProperty('local-heat','visibility','none');
    if(isLondon){state.landsatMode='event';state.researchLayer='none';activateLondonScene('event');map.getSource('city-boundary').setData({type:'FeatureCollection',features:[]})}
    else{map.getSource('city-boundary').setData(boundary||emptyFeatures);updateFrame()}
    $('#city-station-control').hidden=false;
    $('#city-event').hidden=isLondon;
    if(!isLondon){
      $('#research-stations-switch').checked=true;
      loadCityEvent(city);
    }else{
      $('#city-station-label').textContent='WOW station network';
      $('#locate-city-station').hidden=true;
      updateWowStations();
      loadWowSurfaceOptions();
    }
    if(isLondon)map.flyTo({center:[city.lon,city.lat],zoom:9.7,pitch:10,bearing:-8,duration:2700,curve:1.25,essential:true,padding:{right:0}});
    else if(boundary?.bbox)map.fitBounds([[boundary.bbox[0],boundary.bbox[1]],[boundary.bbox[2],boundary.bbox[3]]],{padding:{top:100,bottom:90,left:45,right:45},maxZoom:10.8,pitch:10,bearing:0,duration:2400,essential:true});
    else map.flyTo({center:[city.lon,city.lat],zoom:8.3,pitch:34,bearing:-8,duration:2200,curve:1.25,essential:true,padding:{right:0}});
    populateAnalysis(city,series);updateScale();$('#analysis').classList.add('open');$('#analysis').setAttribute('aria-hidden','false');$('#welcome').classList.add('dismissed');
  }
  function activateLondonScene(mode){
    hideWowSurface();
    hidePedestrianHeat();
    $('#landsat-summer').classList.remove('active');
    $('#legend .temperature-ramp').style.background='';$('#legend>small').textContent='°C · SCENE';
    const scenes=londonScenes(),scene=scenes[mode]||scenes.event;state.landsatMode=mode;map.getSource('london-landsat').setTiles([landsatTile(scene)]);['london-landsat','london-mask','london-outline'].forEach(id=>map.setLayoutProperty(id,'visibility','visible'));
    const fromCatalog=Boolean(live?.landsatLondon?.[mode]?.id===scene.id);
    showLayerProvenance({
      kind:mode==='event'?'Historical scene · satellite LST':fromCatalog?'Recent satellite · Landsat LST':'Bundled Landsat scene · fallback',
      valid:scene.date+' · acquisition date',
      updateLabel:'Catalog checked',
      updated:utcStamp(fromCatalog?live.generatedAt:null),
      missing:'Cloud and quality masks can leave gaps. Scene cloud cover is '+Number(scene.cloudCover).toFixed(2)+'%, measured across the full scene.'
    });
    state.researchLayer='none';map.setLayoutProperty('london-research','visibility','none');document.querySelectorAll('[data-research-layer]').forEach(button=>button.classList.toggle('active',button.dataset.researchLayer==='none'));
    $('#urban-raster').hidden=false;$('#urban-raster-name').textContent=`${String(scene.platform||'Landsat').toUpperCase()} LST`;$('#urban-raster-meta').textContent=`${shortDate(scene.date)} · 30 m output grid · ${Number(scene.cloudCover).toFixed(2)}% scene cloud · GLA boundary clip`;
    $('#landsat-event').classList.toggle('active',mode==='event');$('#landsat-latest').classList.toggle('active',mode==='latest');$('#legend').dataset.field='landsat';$('#legend-name').textContent='LANDSAT LST · LONDON';$('#legend-date').textContent=scene.date;const [low,high]=scene.rescale||[15,45];$('#legend .temperature-ramp').style.background='linear-gradient(90deg,#30123b,#4662d8,#35abf8,#1ae4b6,#72fe5e,#c8ef34,#faba39,#f66b19,#ca2a04,#7a0403)';$('#legend-ticks').innerHTML=Array.from({length:5},(_,i)=>`<span>${Number((low+(high-low)*i/4).toFixed(1))}</span>`).join('');$('#timeline').classList.add('city-raster-active');
    $('#analysis-status').textContent=mode==='event'?'2022 HEATWAVE SCENE':'LATEST CLEAR SCENE';$('#analysis-story').textContent=mode==='event'?'Landsat 9 observed London during the 18 July 2022 extreme heat event. The raster reveals neighbourhood-scale surface contrasts hidden by the global field.':'This is the most recent London scene selected by the scheduled low-cloud Landsat search. Acquisition date and scene cloud cover are shown above.';$('#analysis-note').textContent='Landsat Collection 2 Level-2 surface temperature, visually clipped to the official GLA boundary. Output grid: 30 m; native thermal sensing is coarser. Linear map interpolation smooths display only and does not create new measured detail.';
  }
  function hideLondonResearch(){
    map.setLayoutProperty('london-research','visibility','none');
  }
  const pedestrianDirectory='data/london-utci/';
  const pedestrianColors=['#4b2c85','#a23881','#ed6455','#fca947','#fff5b0'];
  const pedestrianCache=new Map();
  let pedestrianActive=false,pedestrianRequest=0,pedestrianPopup;
  function pedestrianJson(file){
    if(!pedestrianCache.has(file)){
      if(pedestrianCache.size>=24){
        const stale=[...pedestrianCache.keys()].find(key=>key.startsWith('grid-'));
        if(stale)pedestrianCache.delete(stale);
      }
      const request=fetch(pedestrianDirectory+file+'?v=soft-edge-20261107').then(response=>{
        if(!response.ok)throw new Error('Pedestrian heat archive unavailable');
        return response.json();
      }).catch(error=>{pedestrianCache.delete(file);throw error});
      pedestrianCache.set(file,request);
    }
    return pedestrianCache.get(file);
  }
  function hidePedestrianHeat(){
    if(!pedestrianActive)return;
    pedestrianActive=false;
    pedestrianRequest++;
    pedestrianPopup?.remove();
    ['london-utci','london-utci-pick'].forEach(id=>map.setLayoutProperty(id,'visibility','none'));
    map.setLayoutProperty('london-outline','visibility','visible');
    map.getSource('london-utci').setData(emptyFeatures);
  }
  function showPedestrianCell(event){
    if(map.queryRenderedFeatures(event.point,{layers:['wow-stations']}).length)return;
    const closest=event.features.reduce((best,feature)=>{
      const distance=map.project(feature.geometry.coordinates).dist(event.point);
      return distance<best.distance?{distance,feature}:best;
    },{distance:Infinity}).feature;
    if(!closest)return;
    const p=closest.properties;
    const lst=Number.isFinite(p.lst)?` · Landsat LST ${p.lst.toFixed(1)} °C`:'';
    pedestrianPopup?.remove();
    pedestrianPopup=new mapboxgl.Popup({maxWidth:'280px',className:'utci-popup'}).setLngLat(closest.geometry.coordinates)
      .setText(`${p.grid} m walking grid · UTCI ${p.utci.toFixed(1)} °C · mean radiant temperature ${p.tmrt.toFixed(1)} °C · sunlit fraction ${p.sun}%${lst}`)
      .addTo(map);
  }
  async function updatePedestrianHeat(){
    const request=++pedestrianRequest,note=$('#research-layer-note');
    try{
      const manifest=await pedestrianJson('manifest.json');
      if(request!==pedestrianRequest)return;
      const detailed=map.getZoom()>=12.3;
      let rows;
      if(detailed){
        const bounds=map.getBounds(),dx=(bounds.getEast()-bounds.getWest())*.15,dy=(bounds.getNorth()-bounds.getSouth())*.15;
        const visible=manifest.shards.filter(({bounds:[w,s,e,n]})=>w<=bounds.getEast()+dx&&e>=bounds.getWest()-dx&&s<=bounds.getNorth()+dy&&n>=bounds.getSouth()-dy);
        rows=(await Promise.all(visible.map(tile=>pedestrianJson(tile.file)))).flat();
      }else rows=await pedestrianJson('overview.json');
      if(request!==pedestrianRequest)return;
      const grid=detailed?manifest.grid:manifest.overview_grid;
      const fadeDistance=detailed?550:1400;
      const features=rows.map(([lon,lat,utci,tmrt,sun,,lst,edge])=>{
        const t=Number.isFinite(edge)?Math.max(0,Math.min(1,edge/fadeDistance)):1;
        const edgeWeight=t*t*(3-2*t);
        return {type:'Feature',geometry:{type:'Point',coordinates:[lon,lat]},
          properties:{utci,tmrt,sun,grid,edgeWeight,...(Number.isFinite(lst)?{lst}:{})}};
      });
      map.getSource('london-utci').setData({type:'FeatureCollection',features});
      map.setPaintProperty('london-utci','heatmap-radius',detailed
        ?['interpolate',['exponential',2],['zoom'],12.3,17,14,52,16,155,18,175]
        :['interpolate',['exponential',2],['zoom'],7,5,9,12,11,31,12.3,72]);
      map.setPaintProperty('london-utci','heatmap-intensity',detailed?1.2:.58);
      note.textContent=rows.length?`${grid} m display · ${manifest.cells.toLocaleString()} modelled 100 m cells across Greater London · click near a grid centre for values`:'No sampled walking routes in this view.';
      return rows.length>0;
    }catch(error){
      if(request!==pedestrianRequest)return;
      note.textContent='Pedestrian heat archive unavailable. Select the layer again to retry.';
      return false;
    }
  }
  function activatePedestrianHeat(){
    state.researchLayer='utci';
    pedestrianActive=true;
    ['london-landsat','london-research','london-mask','london-outline'].forEach(id=>map.setLayoutProperty(id,'visibility','none'));
    ['london-utci','london-utci-pick'].forEach(id=>map.setLayoutProperty(id,'visibility','visible'));
    $('#research-layer-note').textContent='Loading pedestrian heat estimate…';
    $('#urban-raster-name').textContent='PEDESTRIAN HEAT · UTCI';
    $('#urban-raster-meta').textContent='18 July 2022 · 10:52 UTC · modelled walking routes';
    $('#legend').dataset.field='utci';
    $('#legend-name').textContent='PEDESTRIAN HEAT · UTCI';
    $('#legend-date').textContent='18 JUL 2022 · 10:52Z';
    $('#legend .temperature-ramp').style.background=`linear-gradient(90deg,${pedestrianColors.join(',')})`;
    $('#legend-ticks').innerHTML='<span>LOW</span><span>HIGH</span>';
    $('#legend>small').textContent=ukExposureActive?'100 M WALKING GRID · RELATIVE COLOUR':'RELATIVE COLOUR · 34.8–37.4 °C WEIGHTING';
    showLayerProvenance({kind:'Historical pedestrian heat estimate · SOLWEIG + UTCI',
      valid:'18 July 2022 · 10:52 UTC · Landsat overpass',updated:'Fixed July 2022 simulation',
      missing:'Cells with fewer than 20 m of valid walking routes are omitted. Display intensity fades at the study edge; grid values remain available.'});
    $('#analysis-status').textContent='MODELLED PEDESTRIAN HEAT';
    $('#analysis-story').textContent='Radiation was modelled on a 5 m LiDAR grid, then UTCI was averaged along candidate walking routes into 100 m cells.';
    $('#analysis-note').textContent='Exploratory SOLWEIG estimate. Canopy is inferred from LiDAR and building footprints. Local wind and air temperature are not independently resolved at 100 m.';
    return updatePedestrianHeat();
  }
  let wowSurfaceManifest;
  async function loadWowSurfaceOptions(){
    const select=$('#wow-surface-field'),status=$('#wow-surface-status');
    if(wowSurfaceManifest||select.disabled)return;
    select.disabled=true;
    try{
      const response=await fetch('data/london-research/wow-heat.json?v=1');
      if(!response.ok)throw new Error('WOW surface archive unavailable');
      wowSurfaceManifest=await response.json();
      Object.entries(wowSurfaceManifest.fields).forEach(([id,field])=>select.add(new Option(`${field.title} (${field.unit})`,id)));
      const times=Object.keys(wowSurfaceManifest.frames);
      times.forEach(time=>$('#wow-surface-time').add(new Option(`${shortDate(time.slice(0,10))} · ${time.slice(11,16)} UTC`,time)));
      $('#wow-surface-time').value=times.at(-1);
      status.textContent='Hourly station observations · 18–19 July 2022';
    }catch(error){
      status.textContent='Surface archive unavailable. Reopen London to retry.';
    }finally{
      select.disabled=false;
    }
  }
  function hideWowSurface(){
    map.setLayoutProperty('wow-heat','visibility','none');
    map.setLayoutProperty('wow-direction','visibility','none');
    map.getSource('wow-wind').setData(emptyFeatures);
    $('#legend .temperature-ramp').style.display='';
    $('#wow-surface-field').value='';
    $('#wow-surface-time').hidden=true;
    $('#wow-surface-status').textContent='Hourly station observations · 18–19 July 2022';
  }
  function renderWowGrid(samples,index,field){
    const polygons=londonBoundary.features.flatMap(({geometry})=>
      geometry.type==='MultiPolygon'?geometry.coordinates:[geometry.coordinates]);
    const vertices=polygons.flat(2),lon=vertices.map(point=>point[0]),lat=vertices.map(point=>point[1]);
    const west=Math.min(...lon),east=Math.max(...lon),south=Math.min(...lat),north=Math.max(...lat);
    const radians=Math.PI/180,mercator=latitude=>Math.asinh(Math.tan(latitude*radians));
    const left=west*radians,right=east*radians,top=mercator(north),bottom=mercator(south);
    // Over London's extent, scale Web Mercator to approximate ground kilometres.
    const groundScale=6371*Math.cos((north+south)*radians/2),bandwidthKm=4.5;
    const canvas=document.createElement('canvas');
    canvas.width=320;canvas.height=Math.round(canvas.width*(top-bottom)/(right-left));
    const {width,height}=canvas,ctx=canvas.getContext('2d'),pixels=ctx.createImageData(width,height);
    const x=longitude=>(longitude*radians-left)/(right-left)*width;
    const y=latitude=>(top-mercator(latitude))/(top-bottom)*height;
    const points=samples.map(row=>[x(row[0]),y(row[1]),row[index]]);
    const kilometresPerPixel=(right-left)*groundScale/width;
    const palette=field.colors.map(color=>color.slice(1).match(/../g).map(channel=>parseInt(channel,16)));
    const [low,high]=field.domain,last=palette.length-1;
    for(let py=0;py<height;py++){
      for(let px=0;px<width;px++){
        let numerator=0,denominator=0,nearest=Infinity;
        for(const [sx,sy,value] of points){
          const distanceSquared=((sx-px-.5)**2+(sy-py-.5)**2)*kilometresPerPixel**2;
          const weight=Math.exp(-distanceSquared/(2*bandwidthKm**2));
          numerator+=weight*value;denominator+=weight;
          nearest=Math.min(nearest,distanceSquared);
        }
        const colorIndex=last*Math.max(0,Math.min(1,(numerator/denominator-low)/(high-low)));
        const start=Math.floor(colorIndex),fraction=colorIndex-start;
        const a=palette[start],b=palette[Math.min(start+1,last)],offset=(py*width+px)*4;
        for(let i=0;i<3;i++)pixels.data[offset+i]=a[i]+fraction*(b[i]-a[i]);
        pixels.data[offset+3]=255*(.30+.42*Math.exp(-nearest/(2*5**2)));
      }
    }
    ctx.putImageData(pixels,0,0);
    ctx.globalCompositeOperation='destination-in';
    ctx.beginPath();
    for(const polygon of polygons){
      for(const ring of polygon){
        ring.forEach(([lng,lat],i)=>i?ctx.lineTo(x(lng),y(lat)):ctx.moveTo(x(lng),y(lat)));
        ctx.closePath();
      }
    }
    ctx.fill('evenodd');
    return {url:canvas.toDataURL(),coordinates:[[west,north],[east,north],[east,south],[west,south]]};
  }
  function updateWowSurface(){
    const id=$('#wow-surface-field').value,time=$('#wow-surface-time').value;
    if(!id){
      activateResearchLayer(state.researchLayer);
      return;
    }
    const rows=wowSurfaceManifest.frames[time],fields=wowSurfaceManifest.fields,field=fields[id];
    hidePedestrianHeat();
    $('#wow-surface-time').hidden=false;
    const directional=id==='direction',index=Object.keys(fields).indexOf(id)+2;
    const windIndex=Object.keys(fields).indexOf('wind')+2;
    const samples=rows.filter(row=>Number.isFinite(row[index])&&(!directional||(Number.isFinite(row[windIndex])&&row[windIndex]>=.1)));
    const arrows=directional?samples.map(row=>({type:'Feature',geometry:{type:'Point',coordinates:row.slice(0,2)},properties:{direction:(row[index]+180)%360}})):[];
    map.getSource('wow-wind').setData({type:'FeatureCollection',features:arrows});
    const allDry=id==='rain'&&samples.length>0&&samples.every(row=>row[index]===0);
    const showGrid=!directional&&samples.length>0&&!allDry;
    if(showGrid)map.getSource('wow-heat').updateImage(renderWowGrid(samples,index,field));
    map.setLayoutProperty('wow-heat','visibility',showGrid?'visible':'none');
    map.setLayoutProperty('wow-direction','visibility',directional?'visible':'none');
    ['london-landsat','london-research','london-mask'].forEach(layer=>map.setLayoutProperty(layer,'visibility','none'));
    document.querySelectorAll('[data-research-layer], #urban-raster button').forEach(button=>button.classList.remove('active'));
    $('#wow-surface-status').textContent=`${samples.length} station reports${allDry?' · all reports 0 mm':directional?' · arrows point downwind':showGrid?' · citywide estimate':' · no usable data'}`;
    $('#legend').dataset.field='wow';
    $('#legend-name').textContent=`WOW · ${field.title.toUpperCase()}`;
    $('#legend-date').textContent=time.slice(0,16).replace('T',' ')+'Z';
    const ramp=$('#legend .temperature-ramp');
    ramp.style.display=showGrid?'':'none';
    ramp.style.background=showGrid?`linear-gradient(90deg,${field.colors.join(',')})`:'';
    $('#legend-ticks').innerHTML=showGrid?field.colors.map((_,i)=>{
      const [low,high]=field.domain,n=field.colors.length-1;
      const value=Number((low+(high-low)*i/n).toFixed(2));
      return `<span>${i===0?'≤':i===n?'≥':''}${value}</span>`;
    }).join(''):'';
    $('#legend>small').textContent=directional?'ARROWS POINT DOWNWIND':allDry?'ALL REPORTS 0 mm':showGrid?`${field.unit} · STATION-BASED ESTIMATE`:'NO USABLE OBSERVATIONS';
    showLayerProvenance({kind:directional?'Historical wind observations · Met Office WOW':'Historical gridded estimate · Met Office WOW',
      valid:time.slice(0,16).replace('T',' ')+' UTC · hourly reports',
      updated:'Fixed July 2022 archive',
      missing:directional?'Calm winds and missing reports are omitted.':allDry?'All reporting stations recorded 0 mm for this hour.':'The grid uses a Gaussian distance-weighted mean. Fainter areas are farther from reporting stations.'});
    $('#analysis-status').textContent='WOW STATION OBSERVATIONS';
    $('#analysis-story').textContent=directional?'Arrows show where the wind was blowing toward at each station.'
      :allDry?'All reporting stations recorded 0 mm at this hour.'
      :showGrid?'Nearby observations are blended across Greater London. Colour gives the estimated value. Opacity decreases with distance from the closest station.'
      :'No usable observations were available for this hour.';
    $('#analysis-note').textContent='Click a station for its measured values and units.';
  }
  function activateResearchLayer(id){
    if(!map?.getLayer('london-research')||state.selected?.name!=='London')return;
    hideWowSurface();
    hidePedestrianHeat();
    if(id==='utci'){
      document.querySelectorAll('[data-research-layer]').forEach(button=>button.classList.toggle('active',button.dataset.researchLayer===id));
      document.querySelectorAll('#urban-raster button').forEach(button=>button.classList.remove('active'));
      activatePedestrianHeat();
      return;
    }
    if(id==='none'){activateLondonScene(state.landsatMode||'event');return}
    const layer=londonResearch.layers.find(item=>item.id===id);if(!layer)return;state.researchLayer=id;
    showLayerProvenance({
      kind:id==='elevation'?'Static terrain · NASADEM':id==='aef'?'Historical annual embedding · AlphaEarth':'Historical composite · satellite',
      valid:id==='elevation'?'Static elevation':id==='aef'?'2022 · annual':'1 June – 31 August 2022',
      updateLabel:'Web build',
      updated:utcStamp(londonResearch.generated),
      missing:id==='elevation'||id==='aef'?'Pixel coverage not quantified in the web preview':'Cloud and quality masks can leave gaps. Coverage is not quantified.'
    });
    map.getSource('london-research').updateImage({url:`${layer.image}?v=${encodeURIComponent(londonResearch.generated)}`,coordinates:layer.coordinates});map.setLayoutProperty('london-research','visibility','visible');map.setLayoutProperty('london-landsat','visibility','none');['london-mask','london-outline'].forEach(layerId=>map.setLayoutProperty(layerId,'visibility','visible'));
    document.querySelectorAll('[data-research-layer]').forEach(button=>button.classList.toggle('active',button.dataset.researchLayer===id));
    $('#landsat-event').classList.remove('active');$('#landsat-latest').classList.remove('active');
    $('#landsat-summer').classList.toggle('active',id==='lst-landsat');
    $('#urban-raster-name').textContent=layer.title.toUpperCase();$('#urban-raster-meta').textContent=`${layer.resolution} · GLA boundary clip`;$('#research-layer-note').textContent=`${layer.note} Source: ${layer.attribution}.`;
    const legends={
      'lst-summer':{name:'MODIS SUMMER LST',ticks:['12','18','24','30','36+']},
      ndvi:{name:'SUMMER NDVI',ticks:['−0.2','0','0.25','0.5','0.8']},
      ndwi:{name:'SUMMER NDWI',ticks:['−0.5','−0.1','0','0.2','0.6']},
      elevation:{name:'ELEVATION',ticks:['0','25','60','120','220 m']},
      aef:{name:'ALPHAEARTH EMBEDDING',ticks:['64D','→','RGB','→','VIEW']}
    },legend=legends[id]||{name:layer.title.toUpperCase()};
    const ramp=$('#legend .temperature-ramp');ramp.style.background=layer.colors?`linear-gradient(90deg,${layer.colors.join(',')})`:'';
    const ticks=layer.range?Array.from({length:5},(_,i)=>{const value=layer.range[0]+(layer.range[1]-layer.range[0])*i/4;return value.toFixed(id==='emissivity'?3:layer.unit==='unitless'?2:1)}):legend.ticks;
    $('#legend').dataset.field=id;$('#legend-name').textContent=legend.name;$('#legend-date').textContent=id==='elevation'?'STATIC':'JJA 2022';$('#legend-ticks').innerHTML=ticks.map(value=>`<span>${value}</span>`).join('');$('#legend>small').textContent=layer.unit?`${layer.unit} · 2–98% DISPLAY RANGE`:'64D EMBEDDING · RGB VIEW';
    $('#analysis-status').textContent='RESEARCH CONTEXT';$('#analysis-story').textContent=layer.note;$('#analysis-note').textContent='Environmental layers are descriptive research inputs. Comparisons with heat do not establish causation; modelling outputs require validation and uncertainty reporting.';
  }
  function resetMetricLabels(){
    const labels=['2 M AIR','SKIN LST','SURFACE EXCESS','HOT STEPS ≥35°C'];document.querySelectorAll('.metric-grid span').forEach((node,index)=>node.textContent=labels[index]);
  }
  let wowData=null,wowRequest=null;
  const wowColors={temperature:'#ee9d86',humidity:'#70dce8',dewpoint:'#bba4ff',wind:'#8ce6a5',gust:'#f6cd73',direction:'#b9cee0',pressure:'#ff99c6',rain:'#74aaff'};
  let curveTooltip;
  function bindCurveTooltip(svg,pick){
    if(!curveTooltip){curveTooltip=document.createElement('div');curveTooltip.className='curve-tooltip';curveTooltip.hidden=true;curveTooltip.setAttribute('role','tooltip');document.body.append(curveTooltip);document.addEventListener('scroll',()=>curveTooltip.hidden=true,true)}
    const hide=()=>{curveTooltip.hidden=true;svg.querySelector('.curve-focus')?.remove()};
    svg.onpointerleave=hide;svg.onpointercancel=hide;
    svg.onpointermove=event=>{const rect=svg.getBoundingClientRect(),box=svg.viewBox.baseVal;const scale=Math.min(rect.width/box.width,rect.height/box.height),ox=(rect.width-box.width*scale)/2,oy=(rect.height-box.height*scale)/2;const point=pick((event.clientX-rect.left-ox)/scale,(event.clientY-rect.top-oy)/scale);if(!point){hide();return}curveTooltip.textContent=point.text;curveTooltip.hidden=false;const px=rect.left+ox+point.x*scale,py=rect.top+oy+point.y*scale,w=curveTooltip.offsetWidth,h=curveTooltip.offsetHeight;curveTooltip.style.left=`${Math.max(8,Math.min(window.innerWidth-w-8,px+12))}px`;curveTooltip.style.top=`${Math.max(8,Math.min(window.innerHeight-h-8,py-h-10))}px`;let dot=svg.querySelector('.curve-focus');if(!dot){dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('class','curve-focus');dot.setAttribute('r','3.5');svg.append(dot)}dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y)};
  }
  function closeWowStation(){
    wowRequest?.abort();
    wowData=null;
    $('#wow-panel').hidden=true;
    $('#wow-fields').replaceChildren();
    $('#wow-charts').replaceChildren();
    if(curveTooltip)curveTooltip.hidden=true;
  }
  function pausePlayback(){clearInterval(state.timer);state.timer=null;state.playing=false;$('#play').classList.remove('playing');$('#play').setAttribute('aria-label','Play temperature sequence')}
  function setupMapFloats(){
    const panel=$('#analysis'),station=$('#wow-panel');$('#app').append(station);
    const makeDetails=(title,nodes,open=false)=>{const details=document.createElement('details');details.className='map-float-details';details.open=open;const summary=document.createElement('summary');summary.textContent=title;details.append(summary);nodes.filter(Boolean).forEach(node=>details.append(node));panel.append(details);return details};
    const research=$('#london-research');
    makeDetails('MAP LAYERS',[$('#urban-raster'),research,$('#city-event'),$('#city-station-control')],true);
    const context=makeDetails('CITY CONTEXT & RESEARCH',[$('.metric-grid'),$('.chart-title'),$('#point-chart'),$('.chart-key'),$('.analysis-story'),$('.research-weather'),$('#research-pipeline'),$('.research-source'),$('#analysis-note')]);
    context.id='city-context';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='float-collapse';toggle.textContent='−';toggle.setAttribute('aria-label','Collapse map controls');panel.prepend(toggle);toggle.onclick=()=>{const collapsed=panel.classList.toggle('compact');toggle.textContent=collapsed?'+':'−';toggle.setAttribute('aria-label',collapsed?'Expand map controls':'Collapse map controls')};
    const header=station.querySelector('header');header.title='Drag to move station window';header.addEventListener('pointerdown',event=>{if(event.target.closest('button')||window.innerWidth<701)return;const rect=station.getBoundingClientRect(),dx=event.clientX-rect.left,dy=event.clientY-rect.top;header.setPointerCapture(event.pointerId);station.style.transform='none';const move=e=>{station.style.left=`${Math.max(8,Math.min(window.innerWidth-station.offsetWidth-8,e.clientX-dx))}px`;station.style.top=`${Math.max(75,Math.min(window.innerHeight-90,e.clientY-dy))}px`};move(event);header.onpointermove=move;header.onpointerup=()=>{header.onpointermove=null};header.onpointercancel=()=>{header.onpointermove=null}});
  }
  async function openWowStation(feature){
    if(!$('#research-stations-switch').checked)return;
    closeWowStation();
    const request=new AbortController();
    wowRequest=request;
    const noaa=feature.properties.network==='NOAA',eventOnly=state.selected?.name!=='London';
    $('#wow-period-label').textContent=eventOnly?`${noaa?'NOAA NCEI':'WOW'} STATION · 13–19 JULY 2022`:'WOW STATION · JUNE–AUGUST 2022';
    $('#station-observation-note').textContent=noaa
      ?'NOAA NCEI Global Hourly · one quality-screened observation per UTC hour · gaps preserved. This station represents its own location.'
      :'Met Office WOW · UTC hourly means · gust: hourly maximum · gaps preserved. Rain shows mean reported amount. Basic screening; unvalidated observations.';
    $('#wow-period').hidden=eventOnly;
    $('#wow-period').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.period==='event')));
    $('#wow-panel').setAttribute('aria-busy','true');
    $('#wow-panel').hidden=false;$('#wow-panel').scrollTop=0;$('#wow-name').textContent=feature.properties.name;$('#wow-status').textContent='Loading station observations…';
    try{const response=await fetch(feature.properties.series+'?v=wow-20261104',{signal:request.signal});if(!response.ok)throw new Error('unavailable');const data=await response.json();if(request.signal.aborted)return;
      if(data.start){
        const start=Date.parse(data.start);
        data.rows=data.rows.map(([hour,...values])=>[new Date(start+hour*3600000).toISOString(),...values]);
      }
      wowData=data;$('#wow-status').textContent=`${data.rows.length.toLocaleString()} hourly records · ${data.coordinates.map(v=>v.toFixed(4)).join(', ')}`;
      data.fields.forEach((field,index)=>{
        const button=document.createElement('button');
        button.type='button';
        button.textContent=`${field.label} (${field.unit})`;
        button.style.setProperty('--series-color',wowColors[field.id]||'#c3e4e9');
        button.setAttribute('aria-pressed',String(index<2));
        button.onclick=()=>{button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));renderWowCharts()};
        $('#wow-fields').append(button);
      });
      renderWowCharts();
    }catch(error){if(!request.signal.aborted)$('#wow-status').textContent='Station data could not be loaded. Select the station again to retry.'}finally{if(!request.signal.aborted)$('#wow-panel').setAttribute('aria-busy','false')}
  }
  function renderWowCharts(){
    if(!wowData)return;
    if(curveTooltip)curveTooltip.hidden=true;
    const target=$('#wow-charts');
    target.replaceChildren();
    const summer=$('#wow-period [aria-pressed=true]').dataset.period==='summer';
    const start=Date.parse(summer?'2022-06-01':'2022-07-13');
    const end=Date.parse(summer?'2022-09-01':'2022-07-20');
    const rows=wowData.rows.filter(row=>Date.parse(row[0])>=start&&Date.parse(row[0])<end);
    const fields=wowData.fields.map((field,index)=>({...field,index:index+1}));
    const selected=fields.filter(field=>$('#wow-fields').children[field.index-1].getAttribute('aria-pressed')==='true');
    const visible=selected.filter(field=>rows.some(row=>Number.isFinite(row[field.index])));
    if(!visible.length){
      target.textContent=selected.length?'No valid observations in this period.':'Select a variable to show its curve.';
      return;
    }
    const units=[...new Set(visible.map(field=>field.unit))];
    const ranges=new Map(units.map(unit=>{
      const values=fields.filter(field=>field.unit===unit).flatMap(field=>rows.map(row=>row[field.index]).filter(Number.isFinite));
      const low=Math.min(...values),high=Math.max(...values);
      const padding=high===low?0.5:0;
      return [unit,unit==='°'?[0,360]:[low-padding,high+padding]];
    }));
    const dual=units.length===2;
    const right=dual?358:394;
    const plotWidth=right-48;
    const x=time=>48+(time-start)/(end-start)*plotWidth;
    const y=(value,unit)=>{
      const [low,high]=ranges.get(unit);
      return 166-(value-low)/(high-low)*142;
    };
    const mixed=units.length>2;
    const tick=(unit,fraction)=>{
      const [low,high]=ranges.get(unit);
      return Number((low+(high-low)*fraction).toFixed(2));
    };
    const axisColor=unit=>wowColors[visible.find(field=>field.unit===unit).id]||'#c3e4e9';
    const axis=Array.from({length:5},(_,i)=>{
      const pos=166-i*35.5;
      const label=mixed?i*25:tick(units[0],i/4);
      const rightLabel=dual?`<text x="${right+6}" y="${pos+3}" style="fill:${axisColor(units[1])}">${tick(units[1],i/4)}</text>`:'';
      return `<path d="M48 ${pos}H${right}" stroke="#38434b"/><text x="42" y="${pos+3}" text-anchor="end" style="fill:${mixed?'#b6c7c9':axisColor(units[0])}">${label}</text>${rightLabel}`;
    }).join('');
    const dates=Array.from({length:5},(_,i)=>{
      const time=start+(end-start)*i/4;
      return `<text x="${x(time)}" y="185" text-anchor="${i===0?'start':i===4?'end':'middle'}">${new Date(time).toISOString().slice(5,10)}</text>`;
    }).join('');
    const curves=visible.map(field=>{
      let path='',previousTime=NaN,previousValue=NaN;
      for(const row of rows){
        const value=row[field.index],time=Date.parse(row[0]);
        if(!Number.isFinite(value)){previousTime=NaN;continue}
        const connect=Number.isFinite(previousTime)&&time-previousTime<=5400000&&(field.id!=='direction'||Math.abs(value-previousValue)<=180);
        const px=x(time).toFixed(2),py=y(value,field.unit).toFixed(2);
        path+=connect?`L${px},${py}`:`M${px},${py}h0.01`;
        previousTime=time;
        previousValue=value;
      }
      return `<path d="${path}" fill="none" stroke="${wowColors[field.id]||'#c3e4e9'}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 410 192');
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label','Selected station observations on a shared UTC time axis');
    const axisUnits=mixed?'<text x="42" y="12" text-anchor="end">Relative</text>':
      `<text x="42" y="12" text-anchor="end" style="fill:${axisColor(units[0])}">${units[0]}</text>${dual?`<text x="${right+6}" y="12" style="fill:${axisColor(units[1])}">${units[1]}</text>`:''}`;
    svg.innerHTML=`${axisUnits}${axis}${dates}${curves}`;
    target.append(svg);
    const note=document.createElement('small');
    note.textContent=mixed?'Relative Y axis: 0 = lower bound, 100 = upper bound for each unit. Hover for original values.':dual?`Left: ${units[0]} · Right: ${units[1]} · Dates in UTC.`:`Y axis: ${units[0]} · Dates in UTC.`;
    const empty=selected.filter(field=>!visible.includes(field));
    if(empty.length)note.textContent+=' No data in this period: '+empty.map(field=>field.label).join(', ')+'.';
    target.append(note);
    bindCurveTooltip(svg,(px,py)=>{
      if(px<48||px>right||py<12||py>176)return null;
      const time=start+(px-48)/plotWidth*(end-start);
      const nearest=rows.reduce((best,row)=>Math.abs(Date.parse(row[0])-time)<Math.abs(Date.parse(best[0])-time)?row:best);
      if(Math.abs(Date.parse(nearest[0])-time)>1800000)return null;
      const readings=visible.filter(field=>Number.isFinite(nearest[field.index]));
      if(!readings.length)return null;
      const anchor=readings.reduce((best,field)=>Math.abs(y(nearest[field.index],field.unit)-py)<Math.abs(y(nearest[best.index],best.unit)-py)?field:best);
      return {x:x(Date.parse(nearest[0])),y:y(nearest[anchor.index],anchor.unit),text:[utcStamp(nearest[0]),...readings.map(field=>`${field.label}: ${nearest[field.index]} ${field.unit}`)].join('\n')};
    });
  }
  function populateLondonResearch(){
    const event=londonResearch.weather.event,last=event.at(-1),labels=['GRID MEAN TMAX','HOTTEST GRID CELL','MEAN WIND','DAILY RAIN'],values=[`${last.meanTmax.toFixed(1)} °C`,`${last.spatialMax.toFixed(1)} °C`,`${last.windSpeed.toFixed(1)} km/h`,`${last.precipitation.toFixed(1)} mm`];
    document.querySelectorAll('.metric-grid span').forEach((node,index)=>node.textContent=labels[index]);['metric-at','metric-lst','metric-delta','metric-hot'].forEach((id,index)=>{$(`#${id}`).textContent=values[index]});
    $('#chart-period').textContent='13 → 19 JUL 2022';$('#analysis-status').textContent='LONDON HEATWAVE DOSSIER';$('#analysis-story').textContent='Across 35 target cells intersecting the GLA boundary, the archive tracks air temperature together with humidity, rainfall, radiation and wind. The map connects this regional sequence to the 18 July Landsat surface scene and local environmental context.';
    $('#analysis-note').textContent='Weather values use the Open-Meteo seamless historical archive at the documented target cells. Landsat and MODIS measure land-surface temperature under clear-sky conditions, not 2 m air temperature. Each layer preserves its own date, resolution and limitation.';
  }
  function renderLondonResearch(){
    $('#wow-close').onclick=closeWowStation;
    $('#wow-period').onclick=event=>{
      const button=event.target.closest('[data-period]');
      if(!button)return;
      $('#wow-period').querySelectorAll('button').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
      renderWowCharts();
    };
    document.querySelectorAll('[data-research-layer]').forEach(button=>{const layer=londonResearch.layers.find(item=>item.id===button.dataset.researchLayer);if(layer?.colors)button.querySelector('.research-swatch').style.background=`linear-gradient(0deg,${layer.colors.join(',')})`});
    const series=londonResearch.weather.event,svg=$('#research-weather-chart'),min=Math.floor(Math.min(...series.map(day=>day.meanTmin))-2),max=Math.ceil(Math.max(...series.map(day=>day.spatialMax))+2),x=index=>28+index*286/(series.length-1),y=value=>126-(value-min)/(max-min)*100,path=key=>series.map((day,index)=>`${index?'L':'M'}${x(index).toFixed(1)},${y(day[key]).toFixed(1)}`).join(' '),area=`M${x(0)},126 ${series.map((day,index)=>`L${x(index).toFixed(1)},${y(day.meanTmax).toFixed(1)}`).join(' ')} L${x(series.length-1)},126 Z`,grid=[0,.5,1].map(t=>{const yy=26+t*100,value=Math.round(max-t*(max-min));return `<line class="weather-grid" x1="28" y1="${yy}" x2="314" y2="${yy}"/><text x="0" y="${yy+3}" fill="#716c65" font-size="8">${value}°</text>`}).join(''),dates=series.map((day,index)=>`<text x="${x(index)}" y="146" fill="#716c65" font-size="7" text-anchor="middle">${day.date.slice(8)}</text>`).join(''),dots=series.map((day,index)=>`<circle class="weather-dot" cx="${x(index)}" cy="${y(day.meanTmax)}" r="2.3"/>`).join('');
    svg.innerHTML=`<defs><linearGradient id="weather-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ef6548" stop-opacity=".28"/><stop offset="1" stop-color="#ef6548" stop-opacity="0"/></linearGradient></defs>${grid}<path class="weather-area" d="${area}"/><path class="weather-max" d="${path('spatialMax')}"/><path class="weather-mean" d="${path('meanTmax')}"/>${dots}${dates}`;
    bindCurveTooltip(svg,(px,py)=>{const i=Math.max(0,Math.min(series.length-1,Math.round((px-28)/286*(series.length-1)))),day=series[i],key=Math.abs(py-y(day.meanTmax))<Math.abs(py-y(day.spatialMax))?'meanTmax':'spatialMax';return {x:x(i),y:y(day[key]),text:`${key==='meanTmax'?'Grid mean Tmax':'Hottest grid cell'}\n${day[key]} °C\n${day.date}`}});
    $('#research-pipeline').innerHTML=`<div class="pipeline-title">NEXT RESEARCH MODULES</div>${londonResearch.pipeline.map((item,index)=>`<div class="pipeline-card"><i>0${index+1}</i><span><b>${item.title}</b><small>${item.copy}</small></span><em>RESERVED</em></div>`).join('')}`;
  }
  function populateAnalysis(city,series){
    const current=series.at(-1),delta=Number.isFinite(current.lst)&&Number.isFinite(current.at)?current.lst-current.at:null,hot=series.filter(d=>Number.isFinite(d.at)&&d.at>=35).length;
    $('#analysis-city').textContent=city.name;$('#analysis-place').textContent=`${city.country} · ${city.lat.toFixed(3)}°, ${city.lon.toFixed(3)}°`;$('#metric-at').textContent=Number.isFinite(current.at)?`${current.at.toFixed(1)} °C`:'—';$('#metric-lst').textContent=Number.isFinite(current.lst)?`${current.lst.toFixed(1)} °C`:'—';$('#metric-delta').textContent=Number.isFinite(delta)?`${delta>=0?'+':''}${delta.toFixed(1)} °C`:'—';$('#metric-hot').textContent=`${hot} / ${series.length}`;$('#chart-period').textContent=`${series[0].validIso.slice(5,16).replace('T',' ')} → ${series.at(-1).validIso.slice(5,16).replace('T',' ')}`;
    const status=!Number.isFinite(current.at)?'NO DATA':current.at>=35?'EXTREME HEAT':current.at>=30?'HIGH HEAT':'MODEL SNAPSHOT';$('#analysis-status').textContent=status;$('#analysis-story').textContent=Number.isFinite(delta)?`At the selected model cell, the land surface is ${Math.abs(delta).toFixed(1)} °C ${delta>=0?'warmer':'cooler'} than the air at the latest timestep.`:'The selected model cell does not contain a complete paired observation.';$('#urban-raster').hidden=city.name!=='London';$('#london-research').hidden=city.name!=='London';$('#analysis').classList.toggle('london-mode',city.name==='London');if(city.name!=='London'){const boundary=cityBoundaryIndex.get(city.name);resetMetricLabels();$('#analysis-note').textContent=`${boundary?`${boundary.properties.scope} boundary from OpenStreetMap (ODbL). `:''}Point values use the nearest bundled NOAA GFS model cell. No street-scale temperature raster is loaded for this city yet.`;$('#timeline').classList.remove('city-raster-active')}renderChart(series);
    if(city.name==='London'){activateLondonScene(state.landsatMode);populateLondonResearch()}
  }
  function resetGlobal(animate=true,rotate=state.tourIndex<0&&state.storyIndex<0){
    hideUkExposure();
    clearCityClimate();
    state.autoRotate=rotate;state.selected=null;$('#analysis').classList.remove('open');$('#analysis').setAttribute('aria-hidden','true');
    if(map.getLayer('local-heat'))map.setLayoutProperty('local-heat','visibility','none');if(map.getSource('city-boundary'))map.getSource('city-boundary').setData({type:'FeatureCollection',features:[]});hideLondonResearch();['london-landsat','london-mask','london-outline'].forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none')});$('#urban-raster').hidden=true;$('#london-research').hidden=true;$('#analysis').classList.remove('london-mode');$('#timeline').classList.remove('city-raster-active');updateFrame();map.easeTo({padding:{right:0},duration:350});
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
  function showStoryStep(index){
    const steps=exposureGuideActive?exposureSteps:storySteps;
    if(index<0||index>=steps.length){endStory(true);return}state.storyIndex=index;const step=steps[index];
    if(index===0){const panel=$('#heat-story');panel.dataset.revision=String(Number(panel.dataset.revision||0)+1)}
    $('#story-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;$('#story-progress').style.width=`${(index+1)/steps.length*100}%`;$('#story-eyebrow').textContent=step.eyebrow;$('#story-title').textContent=step.title;$('#story-copy').textContent=step.copy;$('#story-fact').textContent=step.fact;$('#story-prev').disabled=index===0;$('#story-next').textContent=index===steps.length-1?'RETURN TO MAP':index===0?'BEGIN':'NEXT';step.enter?.();
  }
  function startExposureGuide(){
    if(!ukExposureActive)return;
    if(state.tourIndex>=0)endTour();
    exposureGuideSeen=true;
    exposureGuideActive=true;
    $('#heat-story').classList.add('exposure-story');
    $('#heat-story').hidden=false;
    $('#exposure-guide').setAttribute('aria-expanded','true');
    showStoryStep(0);
  }
  function startStory(){
    pausePlayback();if(state.tourIndex>=0)endTour();storySnapshot={ukExposure:ukExposureActive,stations:$('#research-stations-switch').checked,field:state.field,frame:state.frame,selected:state.selected,researchLayer:state.researchLayer,landsatMode:state.landsatMode,wowField:$('#wow-surface-field').value,wowTime:$('#wow-surface-time').value};state.autoRotate=false;$('#welcome').classList.add('dismissed');$('#heat-story').hidden=false;$('#story-toggle').setAttribute('aria-expanded','true');showStoryStep(0);
  }
  function endStory(restore=true){
    const snapshot=storySnapshot;state.storyIndex=-1;storySnapshot=null;exposureGuideActive=false;$('#heat-story').hidden=true;$('#heat-story').classList.remove('exposure-story');$('#story-toggle').setAttribute('aria-expanded','false');$('#exposure-guide').setAttribute('aria-expanded','false');
    if(!restore||!snapshot)return;
    if(snapshot.ukExposure){setField(snapshot.field,snapshot.frame);activateUkExposure(null,false)}
    else if(snapshot.selected){
      selectCity(snapshot.selected);
      if(snapshot.selected.name==='London'){
        if(snapshot.researchLayer&&snapshot.researchLayer!=='none')activateResearchLayer(snapshot.researchLayer);else activateLondonScene(snapshot.landsatMode||'event');
        if(snapshot.wowField){
          $('#wow-surface-field').value=snapshot.wowField;
          $('#wow-surface-time').value=snapshot.wowTime;
          updateWowSurface();
        }
      }else setField(snapshot.field,snapshot.frame);
      $('#research-stations-switch').checked=snapshot.stations;
      updateWowStations();
    }else{resetGlobal(true,true);setField(snapshot.field,snapshot.frame)}
  }
  function renderChart(series){
    const svg=$('#point-chart'),values=series.flatMap(d=>[d.at,d.lst]).filter(Number.isFinite);if(!values.length){svg.innerHTML='';return}let min=Math.floor(Math.min(...values)-3),max=Math.ceil(Math.max(...values)+3);if(max-min<10){min-=5;max+=5}const x=i=>28+i*286/Math.max(1,series.length-1),y=v=>126-(v-min)/(max-min)*102,path=key=>series.map((d,i)=>Number.isFinite(d[key])?`${i&&Number.isFinite(series[i-1][key])?'L':'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`:'').join(' '),grid=[0,.5,1].map(t=>{const yy=24+t*102,value=Math.round(max-t*(max-min));return `<line class="chart-grid" x1="28" y1="${yy}" x2="314" y2="${yy}"/><text x="0" y="${yy+3}" fill="#716c65" font-size="8">${value}°</text>`}).join(''),dots=key=>series.map((d,i)=>Number.isFinite(d[key])?`<circle class="chart-${key}-dot" cx="${x(i)}" cy="${y(d[key])}" r="2.5"/>`:'').join('');svg.innerHTML=`${grid}<path class="chart-lst" d="${path('lst')}"/><path class="chart-at" d="${path('at')}"/>${dots('lst')}${dots('at')}`;
  }
  function updateScale(){
    const zoom=map.getZoom(),indicator=$('#scale-indicator'),rank=$('#city-rank');let level,title;
    if(ukExposureActive&&zoom>=navigationZoom)ukExposureEntered=true;
    if(ukExposureActive&&pedestrianActive&&zoom<ukDetailZoom-.15){
      leaveUkStreetDetail();
      ukExposureLayers.forEach(id=>setLayerVisible(id,true));
      showUkExposureLegend();
    }
    const navigation=!ukExposureActive&&!storySnapshot&&!state.selected&&zoom>=navigationZoom;
    const showCities=$('#cities-switch').checked;
    ukCountryLayers.forEach(id=>setLayerVisible(id,navigation));
    ukCityLayers.forEach(id=>setLayerVisible(id,showCities&&(ukExposureActive||navigation)));
    cityLayers.forEach(id=>setLayerVisible(id,showCities&&navigation));
    $('#app').classList.toggle('navigation-stage',navigation);
    $('#exposure-guide').hidden=!ukExposureActive;
    rank.classList.toggle('hidden',ukExposureActive||Boolean(state.selected)||zoom>=2.3);
    if(pedestrianActive){level='03 · LONDON HEAT EXPOSURE';title='PEDESTRIAN UTCI · JULY 2022'}
    else if(ukExposureActive){
      const grid=zoom>=ukDetailZoom?100:500;
      const center=map.getCenter().wrap(),city=ukExposureCity;
      const cityName=city&&zoom>=10&&Math.abs(center.lat-city.lat)<.22&&Math.abs(center.lng-city.lon)<.32?city.name.toUpperCase()+' · ':'';
      level=grid===100?'03 · CITY HEAT EXPOSURE':'02 · UK HEAT EXPOSURE';
      title=`${cityName}${grid} M · OPEN-SKY UTCI`;
      $('#legend>small').textContent=`°C UTCI · ${grid} M OUTPUT GRID`;
    }
    else if(navigation){level='02 · EXPLORE THE MAP';title='SELECT A COUNTRY OR CITY'}
    else if(!state.selected){level='01 · PLANET';title='GLOBAL THERMAL FIELD'}
    else if(state.selected?.name==='London'){level='03 · LOCAL HEAT';title='LONDON THERMAL SURFACE';rank.classList.add('hidden')}
    else if(state.selected){level='03 · CITY OBSERVATORY';title=state.selected.name.toUpperCase()+' · JULY 2022 ARCHIVE';rank.classList.add('hidden')}
    else{level='03 · CITY DETAIL';title=state.selected?`${state.selected.name.toUpperCase()} ADMINISTRATIVE BOUNDARY`:'CITY DETAIL';rank.classList.add('hidden')}
    indicator.querySelector('span').textContent=level;indicator.querySelector('small').textContent=title;
  }
  function spinGlobe(){if(!state.autoRotate||map.getZoom()>2.2||map.isMoving())return;const center=map.getCenter();map.easeTo({center:[center.lng+12,center.lat],duration:6000,easing:t=>t,essential:true})}
  function renderRanks(){
    $('#rank-time').textContent='GFS snapshot · '+utcStamp(gfs.frames.at(-1).validIso);
    const ranked=cities.map(city=>({city,current:nearestSeries(city).at(-1)})).filter(x=>Number.isFinite(x.current.at)).sort((a,b)=>b.current.at-a.current.at).slice(0,4),box=$('#rank-list');box.innerHTML='';ranked.forEach((item,index)=>{const button=document.createElement('button');button.className='rank-item';button.innerHTML=`<i>${String(index+1).padStart(2,'0')}</i><b>${item.city.name}</b><span>${item.current.at.toFixed(1)}°</span>`;button.addEventListener('click',()=>selectCity(item.city));box.appendChild(button)})
  }
  function populateCityOptions(){const list=$('#city-options');cities.forEach(city=>{const option=document.createElement('option');option.value=city.name;option.label=city.country;list.appendChild(option)})}
  function wireUI(){
    $('#place-search').addEventListener('input',event=>event.target.setCustomValidity(''));const welcome=$('#welcome'),layers=$('#layers-panel'),layersToggle=$('#layers-toggle');const dismiss=()=>welcome.classList.add('dismissed');$('#welcome-close').addEventListener('click',dismiss);$('#skip-intro').addEventListener('click',dismiss);$('#start-explore').addEventListener('click',()=>{dismiss();startTour()});$('#about-toggle').addEventListener('click',()=>{if(state.tourIndex>=0)endTour();if(state.storyIndex>=0)endStory(true);welcome.classList.toggle('dismissed')});$('.brand').addEventListener('click',event=>{event.preventDefault();if(state.tourIndex>=0)endTour();if(state.storyIndex>=0)endStory(false);resetGlobal(true,true);setTimeout(spinGlobe,1900)});
    toggleLayers=force=>{const open=force??layers.hidden;layers.hidden=!open;layersToggle.setAttribute('aria-expanded',String(open))};layersToggle.addEventListener('click',()=>toggleLayers());$('#layers-close').addEventListener('click',()=>toggleLayers(false));
    $('#exposure-uk').onclick=()=>{toggleLayers(false);activateUkExposure()};
    $('#exposure-guide').onclick=()=>exposureGuideActive?endStory(false):startExposureGuide();
    document.querySelectorAll('input[name=field]').forEach(input=>input.addEventListener('change',()=>{if(state.selected?.name==='London')resetGlobal(true,false);setField(input.value,framesFor(input.value).length-1)}));$('#cities-switch').addEventListener('change',updateScale);$('#labels-switch').addEventListener('change',event=>baseSymbols.forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',event.target.checked?'visible':'none')}));
    $('#time-slider').addEventListener('input',event=>{state.frame=+event.target.value;updateFrame()});$('#play').addEventListener('click',()=>{state.playing=!state.playing;const button=$('#play');button.classList.toggle('playing',state.playing);button.setAttribute('aria-label',state.playing?'Pause temperature sequence':'Play temperature sequence');clearInterval(state.timer);if(state.playing)state.timer=setInterval(()=>{const frames=framesFor(state.field);state.frame=(state.frame+1)%frames.length;updateFrame()},1250)});
    $('#analysis-close').addEventListener('click',()=>{$('#analysis').classList.remove('open');$('#analysis').setAttribute('aria-hidden','true');map.easeTo({padding:{right:0},duration:600})});$('#search-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#place-search'),query=input.value.trim().toLowerCase(),city=cities.find(c=>c.name.toLowerCase()===query)||cities.find(c=>c.name.toLowerCase().startsWith(query));if(!query||!city){input.setCustomValidity('Choose a city from the TerraHeat list.');input.reportValidity();return}input.blur();selectCity(city)});
    $('#open-london').addEventListener('click',()=>{toggleLayers(false);selectCity(cities.find(city=>city.name==='London'))});$('#landsat-event').addEventListener('click',()=>activateLondonScene('event'));$('#landsat-latest').addEventListener('click',()=>activateLondonScene('latest'));$('#landsat-summer').addEventListener('click',()=>activateResearchLayer('lst-landsat'));
    document.querySelectorAll('[data-open-city]').forEach(button=>button.onclick=()=>{toggleLayers(false);selectCity(cities.find(city=>city.name===button.dataset.openCity))});
    document.querySelectorAll('[data-research-layer]').forEach(button=>button.addEventListener('click',()=>activateResearchLayer(button.dataset.researchLayer)));$('#research-stations-switch').addEventListener('change',updateWowStations);
    $('#city-event-replay').onclick=()=>loadCityEvent(state.selected);
    $('#locate-city-station').onclick=()=>{
      const station=cityEventData?.stations.features[0];
      if(!station)return;
      map.easeTo({center:station.geometry.coordinates,zoom:Math.max(8,map.getZoom()),duration:800});
      openWowStation(station);
    };
    $('#wow-surface-field').onchange=()=>{
      if($('#wow-surface-field').value&&$('#wow-surface-time').hidden){
        $('#research-stations-switch').checked=true;
        updateWowStations();
      }
      updateWowSurface();
    };
    $('#wow-surface-time').onchange=updateWowSurface;
    $('#tour-next').addEventListener('click',()=>showTourStep(state.tourIndex+1));$('#tour-skip').addEventListener('click',endTour);
    $('#story-toggle').addEventListener('click',()=>{if(exposureGuideActive){endStory(false);startStory()}else if(state.storyIndex>=0)endStory(true);else startStory()});$('#story-close').addEventListener('click',()=>endStory(true));$('#story-prev').addEventListener('click',()=>showStoryStep(state.storyIndex-1));$('#story-next').addEventListener('click',()=>showStoryStep(state.storyIndex+1));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.storyIndex>=0)endStory(true)});
  }
})();
