// Compare before writing: a stale tab must never replace a newer route.
export function createSaveStore(storage,key){
 let expected=null,unavailable=false;try{expected=storage.getItem(key);}catch{unavailable=true;}
 return {get raw(){return expected;},commit(value,archive=null){try{if(unavailable)return 'unavailable';if(storage.getItem(key)!==expected)return 'conflict';if(archive!==null)storage.setItem(`${key}-before-replace-${Date.now()}`,archive);else if(expected!==null)storage.setItem(`${key}-previous`,expected);storage.setItem(key,value);expected=value;return 'saved';}catch{return 'unavailable';}}};
}
