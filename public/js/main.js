$(function(){
  
  /*
   * Config
   */
  // 正規表現
  var imgUrlRegExp = { twitter   : /http:\/\/pic\.twitter\.com\/(.+)/gi,
                       twitpic   : /http:\/\/twitpic\.com\/(.+)/gi,
                       twipple   : /http:\/\/p\.twipple\.jp\/(.+)/gi,
                       yfrog     : /http:\/\/yfrog\.com\/(.+)/gi,
                       instagram : /http:\/\/instagr\.am\/p\/(.+)\//gi
                       };
  
  // URLのフォーマット
  var imgUrlFmt = { twitpic   : "http://twitpic.com/show/large/%s",
                    twipple   : "http://p.twipple.jp/show/large/%s",
                    yfrog     : "http://yfrog.com/%s:medium",
                    instagram : "http://instagr.am/p/%s//media/?size=m" };
  
  var restApiConf = { url   : "http://172.19.175.126/tdw2011/api/food",
                      dfltq : "#おいしいもの"
                      //dfltq : "jobs"
                       };
  
  var screenSize = { w :800, h : 600 };
  var fixImgSize = { w :550, h : 550 };
  var fltImgMinSize = 50;
  var fltImgMaxSize = 200;
  
  // float Obj
  var fltImgDivIdxArr = new Array();
  var fltImgDivMax = 15;
  
  // インターバルのID
  var moveImgItvId;

  // for Block
  var blockTweetId = {
    "128371239294210050" : 1
  };
  
  /*
   * for Barcode Page
   */
  var iptDataTmp = "";
  var iptData = "";
  
  var kEvt = {
    48 : 0,
    49 : 1,
    50 : 2,
    51 : 3,
    52 : 4,
    53 : 5,
    54 : 6,
    55 : 7,
    56 : 8,
    57 : 9
  };
  var kwdChg = {
    "0001" : "カレー",
    "0002" : "とんかつ",
    "0003" : "ラーメン",
    "0004" : "ハンバーグ",
    "0005" : "オムライス",
    "0006" : "焼き肉",
    "0007" : "ピザ",
    "0008" : "パスタ"
  };
  

  /*
   * Logic
   */
  
  // 背景用Div作成
  $( 'body' ).append( $( '<div>' ).addClass( 'pGalleryFrm' ) );
  $( 'div.pGalleryFrm' ).append($( '<div>' ).addClass( 'pGallery' ));
  $( 'div.pGallery' ).hide();
  $( 'div.pGalleryFrm' ).append($( '<div>' ).addClass( 'showTweets' ));
  
  // バーコード入力用作成
  $( 'div.pGalleryFrm' ).append($( '<input>' ).attr( "type", "text" ).attr( "id", "ipt01" ) );
  $( '#ipt01' ).css({ position : "absolute", width : "10px", left : "-20px" });
  $( '#ipt01' ).focus();
  setInterval( function(){ $( '#ipt01' ).focus(); }, 5000 );
  
  // キーボードイベント
  $("#ipt01").keypress( function( event ) {
    
    if( kEvt[ event.which ] !== undefined ){
      iptDataTmp += String( kEvt[ event.which ] );
    }
    if( event.which === 13 ){
      
      iptData = iptDataTmp;
      iptDataTmp = "";
      
      //console.log(kwdChg[ iptData ]);
      //doBcdEvt( kwdChg[ iptData ] );
      
      $( 'div.showTweets' ).hide();
      $( 'div.pGallery' ).show();
      $( 'div.pGallery' ).empty();
      var kwd = kwdChg[ iptData ]; 
      //kwd = restApiConf["dfltq"];
      getApiData( restApiConf[ "url" ], kwd );
      setTimeout( moveImg(),3000 );
      
      
    }
  });
  
  // 画像URL生成
  var exchgImg = function( iUrl ){
    var retUrl = "";
    for( var k in imgUrlRegExp ){
      if( iUrl.match( imgUrlRegExp[ k ] ) ){
        retUrl = imgUrlFmt[ k ].replace( "%s", RegExp.$1 );
        break;
      }
    }
    return retUrl;
  }
  
  // 画像サイズ変更
  var imgSizeFix = function( imgItem, fw, fh ){
    
    var w = imgItem.width();
    var h = imgItem.height();

    if ( w >= h ) {
      imgItem.width( fw );
    } else {
      imgItem.height( fh );
    }
  };
  
  // 画像サイズ取得
  var getFixedImgSize = function( imgItem, fw, fh ){
    var size = new Array();
    var w = imgItem.width();
    var h = imgItem.height();
    
    if ( w >= h ) {
      size["w"] = fw;
      size["h"] = parseInt( h * ( fw / w ) );
    } else {
      size["w"] = parseInt( w * ( fh / h ) );
      size["h"] = fh;
    }
    return size;
  };
  
  // 画像サイズ変更アニメーション
  var imgSizeFixAnm = function( imgItem, fw, fh ){
    var w = imgItem.width();
    var h = imgItem.height();
    if ( w >= h ) {
      imgItem.animate( { width : fw }, "slow" );
    } else {
      imgItem.animate( { height : fh }, "slow" );
    }
  };
  
  // 画像浮遊
  var floatImgs = function(){
    
    var dataLen = $( "div.floatImg" ).length;
    
    for( var i = 0; i < dataLen; i++ ){
      
      var selDiv = $( $( "div.floatImg" ).get( i ) );
      
      /*
      var rSize = fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) );
      imgSizeFix(
        selDiv.children("img"), 
        parseInt( rSize ),
        parseInt( rSize ) 
      );
      selDiv.children("img").css( { opacity : "0.5" } );
      
      selDiv
        .css( {
          top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
          left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
          display : "none",
          "z-index" : 100
        } )
        .delay( 3000 ).delay( parseInt( Math.random() * 1000 ) ).fadeIn();
      */
      
    }
    
  };
  
  // 画像移動
  var moveImg = function(){
    
    var moveIdx = fltImgDivIdxArr.shift();
    fltImgDivIdxArr.push( moveIdx );
    var selDiv = $( $( "div.floatImg" ).get( moveIdx ) );
    
    var fixedTmpImgSize = getFixedImgSize(selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"]);
    selDiv.fadeOut( "fast", function(){
      
      //console.log( fixedTmpImgSize );
      //imgSizeFix( selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"] );
      imgSizeFixAnm( selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"] );
      
      selDiv.children("img").css( { opacity : "0.8" } );
      
      var startPosition = [
        /*
         * 登場の効果
         */
        // 左
        { top  : $( "div.pGalleryFrm" ).height() / 2 - ( selDiv.children( "img" ).height() / 2 ),
          left : -( selDiv.children( "img" ).width() ), 
          display : "block", 
          "z-index" : 1000
        },
        // 下
        { top  : $( "div.pGalleryFrm" ).height(),
          left : $( "div.pGalleryFrm" ).width() / 2 - ( selDiv.children( "img" ).width() / 2 ), 
          display : "block", 
          "z-index" : 1000
        },
        // 上
        { top  : -( selDiv.children( "img" ).height() ),
          left : $( "div.pGalleryFrm" ).width() / 2 - ( selDiv.children( "img" ).width() / 2 ), 
          display : "block", 
          "z-index" : 1000
        },
        // 右
        { top  : $( "div.pGalleryFrm" ).height() / 2 - ( selDiv.children( "img" ).height() / 2 ),
          left : $( "div.pGalleryFrm" ).width(), 
          display : "block", 
          "z-index" : 1000
        },
        // 中心
        { top  : $( "div.pGalleryFrm" ).height() / 2 - ( selDiv.children( "img" ).height() / 2 ),
          left : $( "div.pGalleryFrm" ).width() / 2 - ( selDiv.children( "img" ).width() / 2 ), 
          display : "block", 
          "z-index" : 1000
        }
      ];
      
      // スタート位置
      selDiv.css( 
        startPosition[ parseInt( startPosition.length * Math.random() ) ]
      ).show();
      
      // センター
      selDiv.animate( 
        /*
        { top  : ( $( "div.pGalleryFrm" ).height() / 2 ) - ( selDiv.children( "img" ).height() / 2 ),
          left : ( $( "div.pGalleryFrm" ).width() / 2 ) - ( selDiv.children( "img" ).width() / 2 ) },
        */
        { top  : ( $( "div.pGalleryFrm" ).height() / 2 ) - ( fixedTmpImgSize["h"] / 2 ),
          left : ( $( "div.pGalleryFrm" ).width() / 2 )  - ( fixedTmpImgSize["w"] / 2 ) },
        { duration : "slow",
          easing   : "swing",
          queue    : "true",
          complete : function(){ 
            $(this).css( { "z-index" : 900 } );
            outImg( $(this) );
          }
        }
      );
    });

  };
  
  // 画像アウト
  var outImg = function( item ){
    
    var endPosition = [
      /*
       * 退出の効果
       */
      // 左
      { //top  : $( "div.pGalleryFrm" ).height() / 2 - ( $(this).children( "img" ).height() / 2 ),
        left : -( $(this).children( "img" ).width() )
      },
      // 下
      { top  : $( "div.pGalleryFrm" ).height()
        //left : $( "div.pGalleryFrm" ).width() / 2 - ( $(this).children( "img" ).width() / 2 )
      },
      // 上
      { top  : -( $(this).children( "img" ).height() )
        //left : $( "div.pGalleryFrm" ).width() / 2 - ( $(this).children( "img" ).width() / 2 )
      },
      // 右
      { //top  : $( "div.pGalleryFrm" ).height() / 2 - ( $(this).children( "img" ).height() / 2 ),
        left : $( "div.pGalleryFrm" ).width() 
      },
      // フェードアウト
      { opacity : 0 }
    ];
    
    item.delay( 3000 )
        /* // 右へ捌けていくような効果
        */
        .animate( 
          endPosition[ parseInt( endPosition.length * Math.random() ) ],
          { duration : "fast",
            easing   : "swing",
            queue    : "true",
            complete : function(){ 
              $(this).css( {
                top  : parseInt( Math.random() * ( 600 - 300 ) ),
                left : parseInt( Math.random() * ( 800 - 300 ) ),
                "z-index" : 100
              } );
              
              var rSize = fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) );
              imgSizeFix( $(this).children("img"), parseInt( rSize ), parseInt( rSize ) );
              $(this).children("img").css({ "opacity" : "0.5" } );
              
            }
          }
        );
        /*
        .fadeOut( 'slow', 'swing', function(){
          
          $(this).css( {
            top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
            left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
            display : "block",
            "z-index" : 100
          });
          
          var rSize = fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) );
          imgSizeFix( $(this).children("img"), parseInt( rSize ), parseInt( rSize ) );
          $(this).children("img").css({ "opacity" : "0.5" } );
      
        } );
        */
        
  };
  

  // Stream Data
  var socket = io.connect( "http://111.171.216.204/", {port: 8080} );
  socket.on( 'tweet', function( tweet ){
    
    
    if( fltImgDivMax ){
      
    }
    
    //新着追加分はprependする
    
    
    console.log( tweet.text );
    console.log( tweet.entities.urls[0].expanded_url );
    
    $('div.pGallery').prepend( 
      $('<div>').addClass('tweet')
      .append( $('<div>').addClass('icon').html( $('<img>').attr( {'src' : tweet.user.profile_image_url } ) ) )
      .append( $('<div>').addClass('text').text(tweet.text) )
    );
    
    /*
    $('div.pGallery').append( 
      $('<div>').addClass("floatImg").append( 
        $('<img>').attr( { "src" : exchgImg( tweet.entities.urls[0].expanded_url ), "alt" : "" } )
      ) 
    );
    fltImgDivIdxArr.push( ( fltImgDivIdxArr.length ) );
    */
   
  });
  /*
  */
  
  // APIからデータ取得 img
  var getApiData = function( aUrl, query ){
    $.ajax( { 
      url  : aUrl,
      type : "GET",
      data : {"q" : query },
      // Success
      success : function( data ){
        var i;
        var dataLen = data.length;
        for( i = 0; i < dataLen; i++ ){
        //for( i = 0; i < 3; i++ ){
          var dataObj  = data[i];
          var iconUrl  = dataObj.profile_image_url;
          var tweetId  = dataObj.id;
          var tweetStr = dataObj.text;
          var imgUrl   = exchgImg( dataObj.entities.urls[0].expanded_url );
          //console.log( dataObj );
          
          if( imgUrl !== "" ){ // imgUrlが存在する場合
            $('div.pGallery').append( 
              $('<div>').addClass("floatImg").append( 
                $('<img>')
                  .attr( { "src" : imgUrl, "alt" : "" } )
                  .load( function(){ 
                    //console.log( $( this ).attr("src") + " : " + $( this ).width() + " : " + $( this ).height() ) 
                    //imgSizeFix( $( this ), parseInt( 200 ), parseInt( 200 ) );
                    var rSize = fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) );
                    imgSizeFix( $(this), parseInt( rSize ), parseInt( rSize ) );
                    $(this).css( { opacity : "0.5" } );
                    
                    $(this).parent("div.floatImg")
                      .css( {
                        top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
                        left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
                        display : "none",
                        "z-index" : 100
                      } )
                      .delay( parseInt( Math.random() * 1000 ) ).fadeIn();
                    
                    
                  } )
                  //.load( function(){ /*console.log( $( this ) )*/ } )
              ) 
            );
            fltImgDivIdxArr.push( i );
          }
        }
        // 画面外に追いやる
        $('div.floatImg').css( {left : $( 'div.pGalleryFrm' ).css( "width" ) } );
        
        // Floatさせる
        //floatImgs();
        
        // 定期実行
        //moveImgItvId = setInterval( moveImg, 4000 );
      },
      // Error
      error : function(){
        console.log("データ取得が失敗しました");
      }
    } );
  }
  
    // APIからデータ取得 tweet
  var showTweetData = function( aUrl, query ){
    $.ajax( { 
      url  : aUrl,
      type : "GET",
      data : {"q" : query },
      // Success
      success : function( data ){
        var i;
        var dataLen = data.length;
        for( i = 0; i < dataLen; i++ ){
        //for( i = 0; i < 3; i++ ){
          var dataObj  = data[i];
          var iconUrl  = dataObj.profile_image_url;
          var tweetId  = dataObj.id;
          var tweetStr = dataObj.text;
          var imgUrl   = exchgImg( dataObj.entities.urls[0].expanded_url );
          //console.log( dataObj );
          
          if( imgUrl !== "" ){ // imgUrlが存在する場合
            $('div.showTweets').append( 
              $('<div>').addClass("tweet")
                .append( $('<div>').addClass("tweetIcon")
                  .append(  $('<img>').attr( { "src" : iconUrl, "alt" : tweetId } ) ) )
                .append( $('<div>').addClass("tweetData")
                  .append(  $('<p>').text( tweetStr ) ) ) );
                
          }
        }
      },
      // Error
      error : function(){
        console.log("データ取得が失敗しました");
      }
    } );
  }

  // Initial Logic
  showTweetData( restApiConf[ "url" ], restApiConf[ "dfltq" ] );
  

});
