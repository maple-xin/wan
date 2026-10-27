// Small original Web Audio cues. Sound starts only after an explicit gesture.
export function createAudio(){
 let ctx,master,muted=true,volume=.5,nextBell=0,lastTime=0,playing=true;
 function unlock(){try{ctx??=new (window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.connect(ctx.destination);}ctx.resume().catch(()=>{});apply();}catch{}}
 function apply(){if(master&&ctx)master.gain.setTargetAtTime(muted||!playing?0:volume*.22,ctx.currentTime,.04);}
 function note(freq,duration=.35,delay=0,type='sine',gain=.4){if(!ctx||muted)return;const now=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(gain,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(master);o.start(now);o.stop(now+duration+.02);}
 return {unlock,set(m,v){muted=m;volume=v;apply();},cue(type){if(type==='knock'){note(160,.09,0,'triangle',.5);note(180,.09,.16,'triangle',.4);}else if(type==='bump')note(125,.22,0,'sine',.3);else if(['treat','lantern','pickup','win'].includes(type)){const melody=type==='win'?[523,659,784,1047]:[523,659,784];melody.forEach((f,i)=>note(f,.5,i*.12,'sine',.3));}},tick(time,active){if(time<lastTime)nextBell=0;lastTime=time;if(playing!==active){playing=active;apply();}if(active&&!muted&&time>nextBell){nextBell=time+7;note([262,330,392,440][Math.floor(time/7)%4],2,0,'sine',.11);}},dispose(){ctx?.close();}};
}
