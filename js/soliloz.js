let soliloz = {};
(function(){
  "use strict";
  let export_object = {
    main: function(){main();},
    user_data_download: function(){user_data_download();},
    solilo_download: function(){solilo_download();},
  };
  Object.assign(soliloz, export_object);

  const timeout = 5000;//ms
  const name_len = 16;//ms
  var root={}; 
  var profile={}; 
  var article={}; 
  var follow={}; 
  async function main(){
    root = await JSONIC.fetch("data/root.j.css", 5000);
    if(root==null){
      regist_user();
      return;
    }

    draw_home(root);
  }
  function regist_user(){
    draw_header();
    add_body('<h2>ユーザー登録</h2>');
    add_body('<p>ユーザー名</p><label>@<input id="user_name"></input></label><a id="download" class="button" download="soliloz.zip" onclick="soliloz.user_data_download();">OK</a>');
  }

  async function draw_home(root){
    draw_header();
    add_body('<div class="solio"><h2>ホーム</h2></div>');
    if(root.profile==null||root.profile==undefined){
      alert("profileデータが不正です。");
      return;
    }
    profile= await JSONIC.fetch("data/"+root.profile+".j.css", 5000);
    
    if(root.article==null||root.article==undefined){
      alert("articleデータが不正です。");
      return;
    }
    article= await JSONIC.fetch("data/"+root.article+".j.css", 5000);

    if(root.follow==null||root.follow==undefined){
      alert("followデータが不正です。");
      return;
    }
    follow= await JSONIC.fetch("data/"+root.follow+".j.css", 5000);

    add_body('<div class="solio"><p>@'+profile.name+'</p><div class="textarea"><textarea id="text"></textarea></div><div class="button_wrap"><a id="download" class="button" download="soliloz.zip" onclick="soliloz.solilo_download();">つぶやく</a></div></div>');


    var i_article;
    var i; 
    for(i_article=article,i=0;i<5;i++,i_article= await JSONIC.fetch("data/"+i_article.next_article+".j.css", 5000)){
      console.log(i_article);
      if(i_article==null||i_article==undefined||i_article=="timeout"){
        break;
      }
      if(i_article.next_article==null||i_article.next_article==undefined){
        break;
      }
      if(i_article.article_text==null||i_article.article_text==undefined){
        continue;
      }
      add_body('<div class="solio"><p>@'+profile.name+'</p><p>'+i_article.article_text+'</p></div>');
    }
    add_body('<div class="tl_end"></div>');

  }
  function draw_header(){
    body('');
    add_body('<div class="solio"><h1>soliloz</h1></div>');
  }
  function body(x){
    document.body.innerHTML=x;
  }
  function add_body(x){
    document.body.innerHTML+=x;
  }
  function user_data_download(){

    let user_name=document.getElementById('user_name').value.trim();
    if(!user_name || user_name.length == 0){
      alert("ユーザー名が不正です。");
      return;
    }

    var zip = new Zlib.Zip();
    var root={
      type:"root",
      article:"A_"+random_name(name_len),
      follow:"F_"+random_name(name_len),
      profile:"P_"+random_name(name_len)
    };
    var follow={
      type:"follow",
      users:null,
      next_folllow:null
    };

    var profile={
      type:"profile",
      name:user_name,
      profile_text:null,
    };
    var article={
      type:"article",
      article_text:null,
      next_article:null
    };


    var root_jsonic = JSONIC.cnv(root);
    zip.addFile(stringToByteArray(root_jsonic), {
        filename: stringToByteArray('data/root.j.css')
    });
    var article_jsonic = JSONIC.cnv(article);
    zip.addFile(stringToByteArray(article_jsonic), {
        filename: stringToByteArray('data/'+root.article+'.j.css')
    });
    var follow_jsonic = JSONIC.cnv(follow);
    zip.addFile(stringToByteArray(follow_jsonic), {
        filename: stringToByteArray('data/'+root.follow+'.j.css')
    });
    var profile_jsonic = JSONIC.cnv(profile);
    zip.addFile(stringToByteArray(profile_jsonic), {
      filename: stringToByteArray('data/'+root.profile+'.j.css')
    });
    
    var blob = new Blob([zip.compress()], { 'type': 'application/zip' });

    document.getElementById('download').href = window.URL.createObjectURL(blob);
    
  }

  function solilo_download(){
    let text=document.getElementById('text').value;
    let text_trim=text.trim();
    if(!text_trim || text_trim.length == 0){
      alert("テキストが不正です。");
      return;
    }
   
    var zip = new Zlib.Zip();
    var new_root=Object.assign({},root);
    new_root.article="A_"+random_name(name_len);

    var new_article={
      type:"article",
      article_text:text,
      next_article:root.article
    };
  

    var root_jsonic = JSONIC.cnv(new_root);
    zip.addFile(stringToByteArray(root_jsonic), {
        filename: stringToByteArray('data/root.j.css')
    });
    var article_jsonic = JSONIC.cnv(new_article);
    zip.addFile(stringToByteArray(article_jsonic), {
        filename: stringToByteArray('data/'+new_root.article+'.j.css')
    });

    var blob = new Blob([zip.compress()], { 'type': 'application/zip' });

    document.getElementById('download').href = window.URL.createObjectURL(blob);
  }

  function stringToByteArray(str) {
    var str2=encodeURIComponent(str);//アルファベット、数字、- _ . ! ~ * ' ( )
    var array = new Uint8Array(str2.length);
    
    var i;
    var i2;

    for (i = 0, i2 = 0; i < str2.length; i++,i2++) {
      array[i2]=0;
        if(str2.charCodeAt(i)=="%".charCodeAt(0)){
          if("0".charCodeAt(0)<=str2.charCodeAt(i+1)&&str2.charCodeAt(i+1)<="9".charCodeAt(0)){
            array[i2]=(str2.charCodeAt(i+1)-"0".charCodeAt(0))*16;
          }
          if("A".charCodeAt(0)<=str2.charCodeAt(i+1)&&str2.charCodeAt(i+1)<="F".charCodeAt(0)){
            array[i2]=(str2.charCodeAt(i+1)-"A".charCodeAt(0)+10)*16;
          }

          if("0".charCodeAt(0)<=str2.charCodeAt(i+2)&&str2.charCodeAt(i+2)<="9".charCodeAt(0)){
            array[i2]+=str2.charCodeAt(i+2)-"0".charCodeAt(0);
          }
          if("A".charCodeAt(0)<=str2.charCodeAt(i+2)&&str2.charCodeAt(i+2)<="F".charCodeAt(0)){
            array[i2]+=str2.charCodeAt(i+2)-"A".charCodeAt(0)+10;
          }
          i+=2;
        }else{
          array[i2]=str2.charCodeAt(i);
        }
    }

    var array2 = new Uint8Array(i2);

    for (i = 0; i < i2; i++) {
      array2[i]=array[i];
    }

    return array2;
  }
  function random_name(len) {
    var i;
    var str=""
    for (i = 0; i < len; i++) {
        let num=random_int(26+26+10);
        if(num<10){
          str += String.fromCharCode("0".charCodeAt(0)+num);
        }else if(num<10+26){
          str += String.fromCharCode("a".charCodeAt(0)+num-10);
        }else{
          str += String.fromCharCode("A".charCodeAt(0)+num-10-26);
        }
        
    }
    return str;
  }
  function random_int(max) {
    return Math.floor(Math.random()*max);
  }
})();
