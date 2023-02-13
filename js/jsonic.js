let JSONIC = {};
(function(){
  "use strict";
  let export_object = {
    fetch: function(filename, timeout){return fetch(filename, timeout);},
    cnv: function(object){return cnv(object);}
  };
  Object.assign(JSONIC, export_object);

  function fetch(filename, timeout){
    const iframe = document.createElement('iframe');
    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve("timeout");
        return;
      },timeout);
      iframe.onload = () =>  {
        const elemnt = iframe.contentWindow.document.getElementById("jsonic");
        var content = window.getComputedStyle(elemnt).getPropertyValue("content");
        try {
          iframe.parentNode.removeChild(iframe);
        }catch(e){}
        try {
          content = content.split('a').join('aa');
          content = content.split('\\\\').join('1a1');
          content = content.split('\\"').join('2a2');
          content = content.split('"').join('');
          content = content.split('1a1').join('\\');
          content = content.split('2a2').join('"');
          content = content.split('aa').join('a');
          clearTimeout(timer);
          resolve(JSON.parse(content));
          return;
        }catch(e){
          clearTimeout(timer);
          resolve(null);
          return;
        }
      };
      iframe.onerror = () => {
        clearTimeout(timer);
        reject(new Error('JSONIC Error'));
        return;
      };
      
    })
    iframe.setAttribute('srcdoc', '<!DOCTYPE html><html><head>'+
    '<meta charset="utf-8"><link rel="stylesheet" href="'+filename+'">'+
    '<title></title></head><body><p id="jsonic"></p></body></html>');
    iframe.setAttribute("class", "jsonic_iframe");
    iframe.style.visibility="hidden";
    iframe.style.position="absolute";
    iframe.style.width="0";
    iframe.style.height="0";
    iframe.style.border="none";
    document.body.appendChild(iframe);
    return promise;
  }
  function cnv(object){
    return "#jsonic{content:'"+CSS.escape(JSON.stringify(object))+"'}";
  }
})();