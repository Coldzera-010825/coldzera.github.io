import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';

const output=resolve(process.argv[2]||'data/live-manifest.json');
const stac='https://planetarycomputer.microsoft.com/api/stac/v1';
const londonBbox=[-0.55,51.25,0.35,51.72];
const eventId='LC09_L2SP_201024_20220718_02_T1';
const gibsLayer='MODIS_Terra_Land_Surface_Temp_Day_v6.1_STD';

async function json(url,options={}){
  const response=await fetch(url,{...options,headers:{'user-agent':'TerraHeat-live-pipeline/1.4',...(options.headers||{})}});
  if(!response.ok)throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}
function isoDate(value){return new Date(value).toISOString().slice(0,10)}
function displayPlatform(value){return String(value||'Landsat').replace(/landsat-(\d+)/i,'Landsat $1')}
function rangeFor(date){const month=Number(date.slice(5,7));return month>=6&&month<=8?[10,42]:month===12||month<=2?[-5,24]:[3,32]}
function scene(item,rescale){
  if(!item?.assets?.lwir11)throw new Error(`Scene ${item?.id||'unknown'} has no surface-temperature asset`);
  return {id:item.id,date:isoDate(item.properties.datetime),platform:displayPlatform(item.properties.platform),cloudCover:Number(item.properties['eo:cloud_cover']),rescale,bbox:item.bbox};
}
async function latestModisDate(){
  const response=await fetch('https://gibs.earthdata.nasa.gov/wmts/epsg3857/all/1.0.0/WMTSCapabilities.xml',{headers:{'user-agent':'TerraHeat-live-pipeline/1.4'}});
  if(!response.ok)throw new Error(`GIBS capabilities ${response.status}`);
  const xml=await response.text(),start=xml.indexOf(`<ows:Identifier>${gibsLayer}</ows:Identifier>`);
  if(start<0)throw new Error('MODIS LST layer missing from GIBS capabilities');
  const fragment=xml.slice(start,start+6000),match=fragment.match(/<Dimension>.*?<Default>(\d{4}-\d{2}-\d{2})<\/Default>/s);
  if(!match)throw new Error('MODIS LST latest date missing from GIBS capabilities');
  return match[1];
}
function dateWindow(last,count=7){
  const end=new Date(`${last}T00:00:00Z`);return Array.from({length:count},(_,index)=>{const date=new Date(end);date.setUTCDate(end.getUTCDate()-(count-1-index));return isoDate(date)});
}

const searchBody={collections:['landsat-c2-l2'],bbox:londonBbox,limit:30,query:{'eo:cloud_cover':{lt:20},platform:{in:['landsat-8','landsat-9']}},sortby:[{field:'properties.datetime',direction:'desc'}]};
const [search,eventItem,modisLatest]=await Promise.all([
  json(`${stac}/search`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(searchBody)}),
  json(`${stac}/collections/landsat-c2-l2/items/${eventId}`),
  latestModisDate()
]);
const latestItem=search.features.find(item=>item.assets?.lwir11);
if(!latestItem)throw new Error('No recent low-cloud London Landsat LST scene found');
const latestDate=isoDate(latestItem.properties.datetime);
const manifest={
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  timezone:'UTC',
  modis:{dataset:'NASA GIBS MODIS Terra MOD11A1 v6.1 daytime LST',latestAvailable:modisLatest,dates:dateWindow(modisLatest),source:'https://gibs.earthdata.nasa.gov/'},
  landsatLondon:{
    dataset:'USGS Landsat Collection 2 Level-2 Surface Temperature',
    outputGridMetres:30,
    displayInterpolation:'linear',
    event:scene(eventItem,[15,45]),
    latest:scene(latestItem,rangeFor(latestDate)),
    searchBbox:londonBbox,
    source:'https://planetarycomputer.microsoft.com/api/stac/v1'
  },
  gfs:{status:'bundled-snapshot',automaticUpdate:false,note:'The current GFS JSON is not relabelled as live. A GRIB processing stage is required before automatic replacement.'},
  pipeline:{schedule:'daily at 03:20 UTC / 11:20 Asia/Shanghai',checks:['GIBS advertised latest date','latest London Landsat 8/9 scene below 20% scene cloud','presence of ST_B10/lwir11 asset']}
};
await mkdir(dirname(output),{recursive:true});
let previous=null;try{previous=JSON.parse(await readFile(output,'utf8'))}catch{}
if(previous){manifest.previousGeneratedAt=previous.generatedAt||null}
await writeFile(output,`${JSON.stringify(manifest,null,2)}\n`,'utf8');
console.log(JSON.stringify({output,modisLatest,landsatLatest:manifest.landsatLondon.latest},null,2));
