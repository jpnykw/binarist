/*
//　＝＝＝少々長いコードですが、
//		審査のほうをよろしくお願いします＝＝＝
*/
var canv,cont,c1,c2,i,k,rs,res,mem;
var c1_conv,c2_conv,ftime,mxsc;
var mode_ui=new Array();
var add_ui=new Array();
var number=new Array();
var animat_timer;
var screen_flag;
var ab=new Array();
var ui=new Array(); // スクリーン上メインUI
var mk=new Array();
var se=new Array();
var re=new Array();
var tn=new Array();
var rtry=new obj();
var rest=new obj();
var syme=new obj();
var lv=new obj();
var bg=new obj();
var rl=new obj();
var sl=new obj();
var tr=new obj();
var tm=new obj();
var rd=new obj();
var base_x=320;
var select_x=0;
var problem={ // 問題データ
	fn:0, // 上位4bit
	sn:0, // 下位4bit
	set:function(){ // ランダムで問題を生成する
		problem.fn=~~(Math.random()*15)+1;
		problem.sn=~~(Math.random()*15)+1;
		problem.fn_b=parseInt(problem.fn_b,10).toString(2);
		problem.sn_b=parseInt(problem.sn_b,10).toString(2);
		if(level=='easy'){
			problem.mark=['-','+'][~~(Math.random()*2)];
		}else{
			if(problem.fn%problem.sn==0){ // ゼロ除算除外演算処理
				problem.mark=['/','+','-','*'][~~(Math.random()*4)];
			}else{
				problem.mark=['*','+','-'][~~(Math.random()*3)];
			}
		}
		if(problem.fn-problem.sn<0&&problem.mark=='-'){ // 負の値になったときにすスワップする
			mem=problem.fn;
			problem.fn=problem.sn;
			problem.sn=mem;
		}
		number=[('00'+problem.fn).slice(-2),('00'+problem.sn).slice(-2)]; // デバッグ用　10進数変換
		problem.answer=eval(problem.fn+problem.mark+problem.sn); // 問題の答え(10進数)
	},
	fn_b:0,
	sn_b:0,
	mark:null, // 計算記号
	answer:null, // 答え
};
var time={ // 制限時間
	start:null, // 開始時間
	now:null,　// 現在の時間
	sec:null,
	lsc:null,
};
var user_timezone;
var result_bgm;
var res_bgm_fl;
var clear_cnt;
var bgm_start;
var interval;
var game_bgm;
var display;
var go_next;
var bg_stop;
var red_se;
var level;
var judge;
var hours;

function limit(vname,max,spd){return eval(`${vname}+=(${max}-${vname})/${spd}`)}; // 任意の値$(vname)を変化の割合$(spd)で$(max)にする極限関数

function obj(){ // メインオブジェクト
	this.x=0;
	this.y=0;
	this.image=new Image();
	this.stat='unnamed'; // 状態変化記憶
	this.elements=new Array();
}

obj.prototype.set=function(x,y,i){ // init関数
	this.x=x;
	this.y= y;
	this.image.src=i;
};

obj.prototype.move=function(dx,dy){ // motion関数
	this.x+=dx;
	this.y+=dy;
};

obj.prototype.draw=function(){ // draw関数
	cont.drawImage(this.image, this.x, this.y);
};

obj.prototype.elm=function(add){ // element add関数
	this.elements.push(add);
};

function init(f){ // データ初期化関数(main init)
	if(f){
	canv=document.getElementById('main-area'); // Canvasデータ取得
	cont=canv.getContext('2d');
	}
	screen_flag=0; // アニメーション制御Flag
	animat_timer=0;
	mxsc=60;
	/*
	//		ここから、ゲームで使用する
	//		効果音、画像データを
	//		追加する
	*/
	for(i=0;i<18;i++){ui.push(new obj());}
	for(i=0;i<2;i++){tn.push(new obj());}
	ui[0].set(100,-700,'binalist_logo_1000x.png');
	ui[1].set(600-250,1000,'keylogo.png');
	//ここから
	for(i=0;i<4;i++){ui[i+2].set([-400,-400,1600,1600][i],300,'bit_0_200x.png');}
	for(i=0;i<4;i++){ui[i+6].set(1200,300,'bit_0_200x.png');}
	//ここまで　上位＆下位 8bitオブジェクト
	for(i=0;i<8;i++){ui[i+10].set((i+1)*115,1000,'i_bit_0_200x.png');}
	bg.set(-1200,0,'bg_line_fullx.png');
	rl.set(0,-400,'rules2_fullx.png');
	sl.set(115,1000,'i_select_200x.png');
	tr.set(-1200,0,'tutorial_fullx.png');
	tm.set(300,-310,'timer_300x.png');
	rd.set(1300,-100,'ready_1000x.png');
	rd.stat='first_image';
	lv.set(350,1200,'result_0_500x.png');
	rest.set(1200,0,'result_str_fullx.png');
	rtry.set(350,800,'retry_500x.png');
	tn[0].set(450,-310,`time_${(mxsc+'').substr(0,1)}_300x.png`);
	tn[1].set(600,-310,`time_${(mxsc+'').substr(1,1)}_300x.png`);
	// オーディオ生成
	for(i=0;i<3;i++){se.push(new Audio());}
	se[0].src='teleport01.mp3';
	se[1].src='button11.mp3';
	se[2].src='se_maoudamashii_system48.wav';
	game_bgm=new Audio();
	result_bgm=new Audio();
	game_bgm.src='bgm_maoudamashii_neorock55.mp3';
	result_bgm.src='bgm_maoudamashii_cyber45.mp3';
	// ゲームフラッグ初期化
	bgm_start=false;
	go_next=false;
	red_se=true;
	ftime=true;
	res=true;
	judge=true;
	res_bgm_fl=true;
	interval=0;
	level='unnset';
	for(i=0;i<3;i++){mode_ui.push(new obj());}
	mode_ui[0].set(-600,325,'mode_0_500x.png');
	mode_ui[1].set(1800,425,'mode_1_500x.png');
	mode_ui[2].set(-1200,325,'mode_selector_500x.png');
	user_timezone=new Date();
	hours=user_timezone.getHours();
	// ユーザーへの簡易コミュニケーションツール
	if(5<hours&&hours<17){
		syme.set(-95,600,'hello_500x.png');
	}else{
		syme.set(-40,600,'goodev_500x.png');
	}
}

function main(){ // メイン関数　ゲームの描画処理全般
	cont.clearRect(0,0,canv.width,canv.height);
	//ここから
	bg.draw();
	syme.draw();
	if(ui.length>0)for(var i=0;i<ui.length;i++){ui[i].draw();}
	rl.draw();
	if(5<screen_flag&&screen_flag<10)mk[mk.length-1].draw();
	sl.draw();
	tr.draw();
	tm.draw();
	rd.draw();
	rest.draw();
	rtry.draw();
	lv.draw();
	for(i=0;i<2;i++){tn[i].draw();}
	if(add_ui.length>0){
		for(i=0;i<add_ui.length;i++){add_ui[i].x=limit(`add_ui[${i}].x`,-1200,70);}
		for(i=0;i<add_ui.length;i++){add_ui[i].draw();}
	}
	if(!res){
		time.now=new Date();time.sec=~~(((time.now).getTime()-(time.start).getTime())/1000);time.lsc=mxsc-time.sec;
		display=('00'+time.lsc).slice(-2);
		if(time.lsc>-1){for(i=0;i<2;i++){tn[i].image.src=`time_${display.substr(i,1)}_300x.png`;}}
	}
	//ここまで　画面上のUI描画
	
	//ここからUIの制御
	if(screen_flag>2){syme.y=limit('syme.y',600,7);}else{syme.y=limit('syme.y',535,7);}
	switch(screen_flag){
		case 0:
			ui[0].y=limit('ui[0].y',-350,17);
			ui[1].y=limit('ui[1].y',450,17);
			bg.x=limit('bg.x',0,7);
			if(ui[0].y>-351&&ui[1].y<451){se[0].play();screen_flag++;}
			break;
		case 1:
			for(var k=0;k<4;k++){ui[k+2].x=limit(`ui[${k+2}].x`,base_x+(k*120),15);}
			if(ui[3].x>438)screen_flag++;
			break;
		case 3:
			ui[0].y=limit('ui[0].y',-700,17);
			ui[1].y=limit('ui[1].y',1000,17);
			if(ui[0].y<-525&&ui[1].y>900){
				screen_flag++;
				if(ftime){
					screen_flag=10;
				}else{
					screen_flag++;
				}
			}
			break;
		case 4: // bitアニメーション
			limit('base_x',15,15);
			for(k=0;k<4;k++){ui[k+2].x=limit(`ui[${k+2}].x`,base_x+(k*120),13);}
			for(k=0;k<4;k++){ui[k+6].x=limit(`ui[${k+6}].x`,[620,740,860,980][k],13);}
			if(ui[5].x<376&&ui[6].x<621)screen_flag++;
			break;
		case 5: // プレイヤー入力データリセット
			re=[0,0,0,0,0,0,0,0];
			problem.set();
			mk.push(new obj());
			mk[mk.length-1].set(350,1700,`mk_${['+','-','*','/'].indexOf(problem.mark)}_500x.png`);
			screen_flag++;
			break;
		case 6: // マークアニメーション
			rl.y=limit('rl.y',-15,15);
			tm.y=limit('tm.y',100,10);
			for(i=0;i<2;i++){tn[i].y=limit(`tn[${i}].y`,150/1.5,10);}
			mk[mk.length-1].y=limit(`mk[${mk.length-1}].y`,150,10);
			if(mk[mk.length-1].y<151){
				screen_flag++;
				c1=0;
				c2=0;
			}
			break;
		case 7: // 問題bitカウントアップアニメーション
			animat_timer=(animat_timer%500)+1;
			c1_conv='0000'+~~(parseInt(c1,10).toString(2));
			c2_conv='0000'+~~(parseInt(c2,10).toString(2));
			if(animat_timer%10==0){
				if(c1!==problem.fn+1){
					c1++;
					for(k=0;k<4;k++){
						ui[k+2].image.src=(`bit_${(c1_conv.slice(-4)).substr(k,1)}_200x.png`); //上位4bit
					}
				}
				if(c2!==problem.sn+1){
					c2++;
					for(k=0;k<4;k++){
						ui[k+6].image.src=(`bit_${(c2_conv.slice(-4)).substr(k,1)}_200x.png`); // 下位4bit
					}
				}
			}
			if(!bgm_start){
				interval++;
				clear_cnt=0;
				bg_stop=false;
				if(150<interval){ // アニメーションインターバル
				if(!(rd.x<101)&&rd.stat=='first_image'){
					if(red_se){se[0].play();red_se=false;}
					rd.x=limit('rd.x',100,20);
				}else if(!(rd.x<-1000)&&rd.stat=='first_image'){
					rd.x=limit('rd.x',-1300,13);
				}else if(rd.stat=='first_image'){ // 状態変化制御
					rd.image.src='go_1000x.png';
					rd.stat='last_image';
					rd.x=1300;
				}else{
					if(rd.x>101){
						rd.x=limit('rd.x',100,17);
					}else{
						rd.x=limit('rd.x',-1300,10);
					}					
				}
					go_next=(rd.x<-1000&&rd.stat=='last_image');
					game_bgm.volume=0.5;
				}
			}
			if(c1==problem.fn+1&&c2==problem.sn+1&&go_next){screen_flag++;if(!bgm_start){game_bgm.play();bgm_start=true;}}
			break;
		case 8:
			for(k=0;k<8;k++){ui[k+10].y=limit(`ui[${k+10}].y`,600,10);}
			sl.y=limit('sl.y',600,15);
			if(res){time.start=new Date();res=false;} // ゲームカウントダウンスタート
			if(sl.y<601){screen_flag++;}
			break;
		case 9:
			sl.x=115+select_x*115;
			if(!(time.lsc>-1)){ // ゲームオーバー後の処理
				if(judge){lv.image.src=`result_${(clear_cnt<3)?0:(clear_cnt<7)?1:2}_500x.png`;judge=false;}
				if(!bg_stop){
					game_bgm.volume=limit('game_bgm.volume',0,35);
					bg_stop=game_bgm.volume<0.1;
				}else if(bg_stop&&bg_stop!='hide_ui'){
					game_bgm.volume=0;
					bg_stop='fin';
					bg_stop='hide_ui';
				}else if(bg_stop=='hide_ui'){ // UIを隠す処理
					ui[1].y=limit('ui[1].y',1000,13);
					for(i=0;i<4;i++){ui[i+2].x=limit(`ui[${i+2}].x`,-500,13);}
					for(i=0;i<4;i++){ui[i+6].x=limit(`ui[${i+6}].x`,1200,13);}
					for(i=0;i<8;i++){ui[i+10].y=limit(`ui[${i+10}].y`,1200,13);}
					mk[mk.length-1].y=limit(`mk[${mk.length-1}].y`,1200,13)
					sl.y=limit('sl.y',1000,13);
					rest.x=limit('rest.x',0,17);
					lv.y=limit('lv.y',350,15);
					rtry.y=limit('rtry.y',525,13);
					if(res_bgm_fl){result_bgm.play();res_bgm_fl=false;}
					if(lv.y<401){bg_stop='stay';}
				}
			}
			break;
		case 10: // モード処理
			if(level!='unnset'){
			tr.x=limit('tr.x',0,7);
			}else{
			for(i=0;i<2;i++){mode_ui[i].x=limit(`mode_ui[${i}].x`,350,10);}
			mode_ui[2].x=limit('mode_ui[2].x',90,10);
			for(i=0;i<mode_ui.length;i++){mode_ui[i].draw();}
			}
			if(tr.x>-1){tr.x=0;screen_flag++;}
			break;
		case 12:
			tr.x=limit('tr.x',1300,7);
			if(tr.x>1299){ftime=false;screen_flag=4;}
			break;
	}
}

function answer(){return parseInt(problem.answer,10).toString(2);} // デバッグ用コード(解答出力)

document.onkeydown=function(e){ // キーボードイベント
	if(e.keyCode==32){
		if(screen_flag==-1||screen_flag==2){
			if(screen_flag==2)se[1].play();
			screen_flag++;
		}else if(screen_flag==11){
			screen_flag++;
		}else if(screen_flag==10){
			level=mode_ui[2].y==325?'easy':'hard'; // ゲームモード確定
			console.log(level);
			se[1].play();
		}
	}
	if(e.keyCode==38||e.keyCode==40&&screen_flag==10){
		mode_ui[2].y=mode_ui[2].y==325?425:325; // ゲームモード選択
	}
	if(screen_flag==9&&time.lsc>0){ // セレクタ移動
		if(e.keyCode==39){
			if(select_x==7){
				select_x=0;
			}else{
				select_x++;
			}
		}
		if(e.keyCode==37){
			if(select_x==0){
				select_x=7;
			}else{
				select_x--;
			}
		}
		if(e.keyCode==38||e.keyCode==40){ // ビット反転 (swap 1<=>0)
			re[select_x]=(re[select_x]==1)?0:1;
			ui[select_x+10].image.src=`i_bit_${re[select_x]}_200x.png`;
		}
		if(e.keyCode==32){
			rs='';
			for(var j=0;j<8;j++){rs+=re[j]+'';}
			if(rs==('00000000'+parseInt(problem.answer,10).toString(2)).slice(-8)){ // 正誤判定処理
				for(i=0;i<8;i++){ui[i+10].image.src='i_bit_0_200x.png';}
				re=[0,0,0,0,0,0,0,0];
				clear_cnt++; // 背回数カウンター
				se[2].play();
				screen_flag=4;
				add_ui.push(new obj());
				add_ui[add_ui.length-1].set(1200,625,'good_msg_300x.png'); // 正解時のアニメーション
			}
		}
	}
};

setInterval(main, 10); // メイン関数の呼び出し