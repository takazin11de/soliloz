class Soliloz{
  constructor() {
    this.timeout = 5000;//ms
    this.name_len = 32;//ms
    this.root={}; 
    this.profile={}; 
    this.article={};
    this.timeline=new Array(); 
    this.follow={}; 
    this.high_priority_queue = new Array();
    this.low_priority_queue = new Array();
    this.priority_rate=0.8;
    this.div_top;
    this.div_home;
    this.div_notice;
    this.num_notice=0;
    this.old_num_notice=0;
    this.div_timeline;
    this.div_tl_end;
    this.loop_timer;
    this.loop_interval= 250;//ms

    console.log(this.priority_rate);

    this.draw_header();
    this.high_priority_queue.push({cmd:"fetch_root",prm:""});
    this.loop_timer = setInterval(()=>{this.loop(0)}, this.loop_interval);
  }

  loop(){
    let command;

    if(Math.random()<this.priority_rate){
      command = this.high_priority_queue.shift();
    }else{
      command = this.low_priority_queue.shift();
      
    }
    if(command==undefined){
      return;
    }
    //console.log(command.cmd);
    switch(command.cmd){
      case "fetch_root":

        this.fetch_root();
        break;
      case "fetch_hot_users":
        this.fetch_hot_users();
        break;
      case "fetch_user":
        this.fetch_user(command.prm);
        break;
      case "fetch_my_article":
        this.fetch_my_article();
        break;
      case "fetch_timeline":
        this.fetch_timeline();
        break;
      default:
    }
    this.draw_notice();
    //this.draw_timeline();
  }
  fetch_hot_users(){
    //console.log("aaa "+this.high_priority_queue);
    if(this.root.hot_users != null && this.root.hot_users != undefined){
      this.high_priority_queue.push(
        ... this.root.hot_users.map(user=> ({cmd:"fetch_user",prm:user.name}) ));
    }
    //console.log("aaa "+this.high_priority_queue);
    this.high_priority_queue.push({cmd:"fetch_hot_users",prm:""});
    //console.log("aaa "+this.high_priority_queue);
  }

  fetch_root(){
    

    JSONPIC.fetch("data/root.j.css", 5000).then(
      (json)=>{
        this.root=json;
        this.draw_home();
        this.high_priority_queue.push({cmd:"fetch_my_article",prm:""});
        this.high_priority_queue.push({cmd:"fetch_timeline",prm:""});
        this.high_priority_queue.push({cmd:"fetch_hot_users",prm:""});
    
      }).catch(
        (err)=>{
          if(err=="timeout"){
            return;
          }
          if(err=="error"){
            this.regist_user();
            return;
          }
      });
  }
  fetch_user(user){
    JSONPIC.fetch(""+user+"/data/root.j.css", 5000).then(
      (json)=>{
        let user_root=json;
        const fileaddress=""+user+"/data/"+user_root.article+".j.css";

        JSONPIC.fetch(""+user+"/data/"+user_root.article+".j.css", 5000).then(
          (json)=>{
            let user_article=json;

            if(this.timeline.find(element=>{return element.filename==fileaddress})==undefined){
              JSONPIC.fetch(""+user+"/data/"+user_root.profile+".j.css", 5000).then(
                (json)=>{
                  let user_profile=json;
                  this.timeline.push({filename:fileaddress, data:user_article, name:user_profile.name, address:user});
                  this.sort_timeline();
                  this.num_notice++;
                }
              ).catch();
            }

            

          }).catch((err)=>{           
            if(err=="timeout"){
              return;
            }
            if(err=="error"){
              return;
            }
          });
      }).catch((err)=>{
          if(err=="timeout"){
            return;
          }
          if(err=="error"){
            return;
          }
      });
  }


  fetch_timeline(){
    let i;
    let len=this.timeline.length;
    console.log("aaa "+len);
    this.high_priority_queue.push({cmd:"fetch_timeline",prm:""});
    for(i=0;i<len;i++){
      let user_article=this.timeline[i].data;
      let user_name=this.timeline[i].name;
      let user_address=this.timeline[i].address;
      let fileaddress=""+user_address+"/data/"+user_article.next_article+".j.css"
      if(user_address==null){
        fileaddress="data/"+user_article.next_article+".j.css"
      }
      
      JSONPIC.fetch(fileaddress, 5000).then(
        
        (article)=>{
          if(article.article_text==null){
            return;
          }
          if(this.timeline.find(element=>{return element.filename==fileaddress})==undefined){
            this.timeline.push({filename:fileaddress, data:article, name:user_name, address:user_address});
            this.sort_timeline();
            this.num_notice++;
          }

        }
      )
    }
  }
  sort_timeline(){
    this.timeline.sort((a, b) => {
      var a;
      var b;
      a=a.data.time;
      b=b.data.time;
      if(a == null || a == undefined){a=0;}
      if(b == null || b == undefined){b=0;}
      return a-b;
    } );
  }

  fetch_my_article(){
    const fileaddress="data/"+this.root.article+".j.css"
      
    JSONPIC.fetch(fileaddress, 5000).then(
      
      (article)=>{
        if(article.article_text==null){
          return;
        }
        if(this.timeline.find(element=>{return element.filename==fileaddress})==undefined){
          this.timeline.push({filename:fileaddress, data:article, name:this.profile.name, address:null});
          this.sort_timeline();
          this.num_notice++;
        }

      }
    )
  }

  regist_user(){
    clearTimeout(this.loop_timer);
    this.create_ele(this.div_top, "div", "solio", "<h2>ユーザー登録</h2>");
    this.create_ele(this.div_top, "div", "solio", '<p>ユーザー名</p><label>@<input id="user_name"></input></label><a id="download" class="button" download="soliloz.zip" onclick="soliloz.user_data_download();">OK</a>');
    this.create_ele(this.div_top, "div", "tl_end","");
   }

  async draw_home(){
    this.div_home=this.create_ele(this.div_top, "div", "div_home", "");
    this.create_ele(this.div_home, "div", "solio", "<h2>ホーム</h2>");
    

    if(this.root.profile==null||this.root.profile==undefined){
      console.log("profileデータが不正です。");
      alert("profileデータが不正です。");
      return;
    }
    await JSONPIC.fetch("data/"+this.root.profile+".j.css", 5000).then(
      (json)=>{
        this.profile=json;
        
      }
    ).catch(
      (err)=>{console.log("profileデータが不正です。");alert("profileデータが不正です。");}
    );
    
    if(this.root.article==null||this.root.article==undefined){
      console.log("articleデータが不正です。");
      alert("articleデータが不正です。");
      return;
    }
    await JSONPIC.fetch("data/"+this.root.article+".j.css", 5000).then(
      (json)=>{
        this.article=json;
      }
    ).catch(
      (err)=>{console.log("articleデータが不正です。");alert("articleデータが不正です。");}
    );

    if(this.root.follow==null||this.root.follow==undefined){
      console.log("followデータが不正です。");
      alert("followデータが不正です。");
      return;
    }
    await JSONPIC.fetch("data/"+this.root.follow+".j.css", 5000).then(
      (json)=>{
        this.follow=json;
      }
    ).catch(
      (err)=>{console.log("followデータが不正です。");alert("followデータが不正です。");}
    );

    this.create_ele(this.div_home, "div", "solio_box", '<div class="solio"><p>@'+this.profile.name+'</p><div class="textarea"><textarea id="text"></textarea></div><div class="button_wrap"><a id="download" class="button" download="soliloz.zip" onclick="soliloz.solilo_download();">つぶやく</a></div></div>');
    this.div_notice=this.create_ele(this.div_home, "div", "div_notice","");
    this.div_timeline=this.create_ele(this.div_home, "div", "div_timeline","");
    this.div_tl_end=this.create_ele(this.div_home, "div", "tl_end","");
    


  }
  draw_notice(){
    console.log("draw_notice")
    if(this.div_notice==null||this.div_notice==undefined){
      return;
    }
    if(this.old_num_notice!=this.num_notice){
    this.div_notice.innerHTML="";
    this.old_num_notice=this.num_notice;
    this.create_ele(this.div_notice, "div", "solio", `<p class="notice" onclick="soliloz.draw_timeline();"><a>${this.num_notice}件の新しい投稿</a></p>`);
    }
    if(this.num_notice==0){
      this.div_notice.innerHTML="";
    }
  }
  reset_notice(){
    this.old_num_notice=0
    this.num_notice=0;
    this.div_notice.innerHTML="";
  }

  draw_timeline(){
    this.reset_notice();
    if(this.div_timeline==null||this.div_timeline==undefined){
      return;
    }
    this.div_timeline.innerHTML="";
    let i;

    
    //console.log(this.timeline.length);
    for(i=this.timeline.length-1;0<=i;i--){
      //console.log(this.timeline[i].data);
      let article_text = this.htmlescape(this.timeline[i].data.article_text);
      let address = this.htmlescape(this.timeline[i].address);
      if(address==null){
        address="";
      }
      let time = new Date(this.timeline[i].data.time);
      let timef = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}  ${time.getHours()}:${time.getMinutes()}`;
      let name = this.timeline[i].name;
      this.create_ele(this.div_timeline, "div", "solio", `@${name}<span class="address">${address}</span><span class="date">${timef}</span><br>${article_text}`);
    }

  }

  draw_header(){
    document.body.innerHTML="";
    this.div_top = this.create_ele(document.body, "div", "top", "");
    this.div_header = this.create_ele(this.div_top, "div", "header", "");
    this.h1 = this.create_ele(this.div_top, "div", "solio", "<h1>soliloz</h1>");
  }
  create_ele(parent, tag, class_name, text){
    let ele = document.createElement(tag);
    ele.setAttribute("class", class_name);
    ele.innerHTML=text;
    parent.appendChild(ele);
    return ele;
  }

  user_data_download(){

    let user_name=document.getElementById('user_name').value.trim();
    if(!user_name || user_name.length == 0){
      alert("ユーザー名が不正です。");
      return;
    }

    var zip = new Zlib.Zip();
    var root={
      type:"root",
      article:"A_"+this.random_name(this.name_len),
      follow:"F_"+this.random_name(this.name_len),
      profile:"P_"+this.random_name(this.name_len)
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
      time: Date.now(),
      article_text:null,
      next_article:null
    };


    var root_jsonpic = JSONPIC.cnv(root);
    zip.addFile(this.stringToByteArray(root_jsonpic), {
        filename: this.stringToByteArray('data/root.j.css')
    });
    var article_jsonpic = JSONPIC.cnv(article);
    zip.addFile(this.stringToByteArray(article_jsonpic), {
        filename: this.stringToByteArray('data/'+root.article+'.j.css')
    });
    var follow_jsonpic = JSONPIC.cnv(follow);
    zip.addFile(this.stringToByteArray(follow_jsonpic), {
        filename: this.stringToByteArray('data/'+root.follow+'.j.css')
    });
    var profile_jsonpic = JSONPIC.cnv(profile);
    zip.addFile(this.stringToByteArray(profile_jsonpic), {
      filename: this.stringToByteArray('data/'+root.profile+'.j.css')
    });
    
    var blob = new Blob([zip.compress()], { 'type': 'application/zip' });

    document.getElementById('download').href = window.URL.createObjectURL(blob);
    
  }

  solilo_download(){
    let text=document.getElementById('text').value;
    let text_trim=text.trim();
    if(!text_trim || text_trim.length == 0){
      alert("テキストが不正です。");
      return;
    }
   
    var zip = new Zlib.Zip();
    var new_root=Object.assign({},this.root);
    new_root.article="A_"+this.random_name(this.name_len);

    var new_article={
      type:"article",
      time: Date.now(),
      article_text:text,
      next_article:this.root.article
    };
  

    var root_jsonpic = JSONPIC.cnv(new_root);
    zip.addFile(this.stringToByteArray(root_jsonpic), {
        filename: this.stringToByteArray('data/root.j.css')
    });
    var article_jsonpic = JSONPIC.cnv(new_article);
    zip.addFile(this.stringToByteArray(article_jsonpic), {
        filename: this.stringToByteArray('data/'+new_root.article+'.j.css')
    });

    var blob = new Blob([zip.compress()], { 'type': 'application/zip' });

    document.getElementById('download').href = window.URL.createObjectURL(blob);
  }

  stringToByteArray(str) {
    var str2=encodeURIComponent(str);
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
  random_name(len) {
    var i;
    var str=""
    for (i = 0; i < len; i++) {
        let num=this.random_int(26+26+10);
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
  random_int(max) {
    return Math.floor(Math.random()*max);
  }
  htmlescape(str){
    try{
    return str.split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split(' ').join("&nbsp;")
    .split('\t').join("&nbsp;")
  }catch(e){
    return "";
  }
}
}
let soliloz;

