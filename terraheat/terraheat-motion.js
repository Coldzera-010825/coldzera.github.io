/* Motion language shared with the portfolio: soft rise, stagger, deliberate ease. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ease='cubic-bezier(.22,1,.36,1)';
  const animate=(node,frames,options={})=>{if(reduced.matches)return null;return node.animate(frames,{duration:420,easing:ease,...options})};
  const replay=new WeakSet(),closing=new WeakSet();
  const toast=document.createElement('div');toast.className='motion-status';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.querySelector('#app').append(toast);let toastTimer;
  function announce(text){clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('visible');toastTimer=setTimeout(()=>toast.classList.remove('visible'),1800)}
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    const close=button.matches('#wow-close,#layers-close,#story-close,#analysis-close');
    if(close&&!reduced.matches&&!replay.has(button)){
      const panel=button.closest('#wow-panel,#layers-panel,#heat-story,#analysis'),surface=panel?.querySelector('.story-card')||panel;
      if(surface){event.preventDefault();event.stopImmediatePropagation();if(closing.has(button))return;closing.add(button);surface.style.pointerEvents='none';const revision=panel.dataset.revision,a=animate(surface,[{opacity:1,translate:'0 0',filter:'blur(0px)'},{opacity:0,translate:'0 8px',filter:'blur(1px)'}],{duration:180});a.finished.catch(()=>{}).then(()=>{surface.style.pointerEvents='';closing.delete(button);if(revision!==panel.dataset.revision)return;replay.add(button);button.click();replay.delete(button)});return}
    }
    if(!replay.has(button))animate(button,[{scale:'1'},{scale:'.96',offset:.28},{scale:'1'}],{duration:280});
    if(button.matches('[data-research-layer],#landsat-event,#landsat-latest,#landsat-summer')){
      requestAnimationFrame(()=>{const name=document.querySelector('#urban-raster-name')?.textContent;if(name)announce(name);});
    }
  },true);
  const entrances=new MutationObserver(records=>{
    for(const record of records){const panel=record.target;if(panel.hidden||panel.getAttribute('aria-hidden')==='true')continue;
      if(record.attributeName==='hidden'){
        const surface=panel.querySelector('.story-card')||panel;
        animate(surface,[{opacity:0,translate:'0 14px',filter:'blur(2px)'},{opacity:1,translate:'0 0',filter:'blur(0px)'}],{duration:480});
      }
    }
  });
  ['wow-panel','layers-panel','heat-story'].forEach(id=>{const el=document.getElementById(id);if(el)entrances.observe(el,{attributes:true,attributeFilter:['hidden']})});
  const charts=document.querySelector('#wow-charts');if(charts)new MutationObserver(()=>{
    [...charts.children].forEach((node,index)=>animate(node,[{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:430,delay:Math.min(index*45,180)}));
    charts.querySelectorAll('path').forEach(path=>{if(reduced.matches)return;const length=path.getTotalLength();if(length)path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:650,easing:ease})});
  }).observe(charts,{childList:true});
  document.addEventListener('click',event=>{
    const summary=event.target.closest('summary');if(!summary||reduced.matches)return;const details=summary.parentElement;if(details.dataset.moving)return;event.preventDefault();const from=details.getBoundingClientRect().height,wasOpen=details.open;details.open=true;const expanded=details.getBoundingClientRect().height;const to=wasOpen?summary.getBoundingClientRect().height:expanded;
    details.dataset.moving='1';details.style.overflow='hidden';const a=animate(details,[{height:from+'px'},{height:to+'px'}],{duration:300});a.finished.catch(()=>{}).then(()=>{details.open=!wasOpen;details.style.overflow='';delete details.dataset.moving});
  });
  document.addEventListener('change',event=>{if(event.target.matches('#research-stations-switch'))announce(event.target.checked?'Station network · visible':'Station network · hidden')});
})();
