$(function(){
  
  /*
   * Config
   */
  
  var appUrl = "http://" + location.hostname;
  
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
                    instagram : "http://instagr.am/p/%s/media/?size=m" };
    
  var restApiConf = { url   : "http://search.twitter.com/search.json",
                      dfltq : "#おいしいもの twitter OR twitpic OR plixi OR twipple OR yfrog OR instagr -RT -QT"
                    };
                      
  
  var screenSize = { w :800, h : 600 };
  var fixImgSize = { w :550, h : 550 };
  var fltImgMinSize = 50;
  var fltImgMaxSize = 200;
  
  // float Obj
  var fltImgDivIdxArr = new Array();
  var fltImgDivMax = 15;

  var tweetDivMax = 10;
  
  // インターバルのID
  var moveImgItvId;

  // moveImgが立っているか
  var moveImgFlg = 0;
  
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
    "0006" : "寿司 OR すし",
    "0007" : "ピザ",
    "0008" : "パスタ"
  };
  
  /*
   * Logic
   */
  
  // 背景用Div作成
  $( '#contents' ).append( $( '<div>' ).addClass( 'pGalleryFrm' ) );
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
      
      var kwd = "";
      kwd = kwdChg[ iptData ]; 
      if( kwd !== undefined ){
        
        getApiData( restApiConf[ "url" ], kwd );
        
        // ツイートのDiv非表示
        $( 'div.showTweets' ).hide();
        
        // 画像ギャラリー表示
        $( 'div.pGallery' ).show();
        $( 'div.pGallery' ).empty();
        
      }
    }
  });
  
  // 画像URL生成
  var exchgImg = function( dObj ){
    var retUrl = "";
    if( dObj.entities ){
	    if( dObj.entities.media ) {
	      retUrl = dObj.entities.media[0].media_url;
	    } else if( dObj.entities.urls ){
	      var iUrl = dObj.entities.urls[0].expanded_url;
        for( var k in imgUrlRegExp ){
          if( iUrl.match( imgUrlRegExp[ k ] ) ){
            retUrl = imgUrlFmt[ k ].replace( "%s", RegExp.$1 );
            break;
          }
        }
	    }
    }
    return retUrl;
  }
    
  // 画像サイズ取得
  var getFixedImgSize = function( imgItem, fw, fh ){
    var size = new Array();
    var w = imgItem.width();
    var h = imgItem.height();
    
    if ( w >= h ) {
      size["w"] = fw;
      size["h"] = ( h * ( fw / w ) );
    } else {
      size["w"] = ( w * ( fh / h ) );
      size["h"] = fh;
    }
    return size;
  };
  
  // 画像サイズ変更
  var imgSizeFix = function( imgItem, fw, fh ){
    var size = getFixedImgSize( imgItem, fw, fh );
    imgItem.width( size["w"] );
    imgItem.height( size["h"] );
  };
  
  // 画像サイズ変更アニメーション
  var imgSizeFixAnm = function( imgItem, fw, fh ){
    var size = getFixedImgSize( imgItem, fw, fh );
    imgItem.animate( { width : size[ "w" ], height : size[ "h" ] }, "slow" );
  };
  
  // 画像移動
  var moveImgDish = function( idx ){
    
    var selDiv = $( $( "div.floatImg" ).get( idx ) );
    
    var fixedTmpImgSize = getFixedImgSize(selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"]);
    selDiv.fadeOut( "fast", function(){
      
      imgSizeFixAnm( selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"] );
      
      selDiv.children("img").css( { opacity : "1.0" } );
      
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
      { left : -( item.children( "img" ).width() ) },
      // 下
      { top  : $( "div.pGalleryFrm" ).height() },
      // 上
      { top  : -( item.children( "img" ).height() ) },
      // 右
      { left : $( "div.pGalleryFrm" ).width() }
    ];
    
    var anmTime = 8000;
    
    var maxImgSize = getFixedImgSize( item.children( "img" ), $( "div.pGalleryFrm" ).width(), $( "div.pGalleryFrm" ).height() );
    item.children( "img" ).animate( { height : maxImgSize["h"], 
                                      width  : maxImgSize["w"] } ,anmTime );
                                      
    item.animate( { //top  : 0,
                top  : ( $( "div.pGalleryFrm" ).height() / 2 ) - ( maxImgSize["h"] / 2 ),
                left : ( $( "div.pGalleryFrm" ).width() / 2 ) - ( maxImgSize["w"] / 2 ) } ,anmTime )
        .animate( 
          endPosition[ parseInt( endPosition.length * Math.random() ) ],
          { duration : "fast",
            easing   : "swing",
            queue    : "true",
            complete : function(){
              
              $(this).css( {
                top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
                left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
                "z-index" : 100
              } );
              
              var rSize = parseInt( fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) ) );
              imgSizeFix( $(this).children("img"), rSize, rSize );
              $(this).css({ "opacity" : "1" } );
              $(this).children("img").css({ "opacity" : "0.5" } );
              
              if( fltImgDivMax < $( "div.pGallery div.floatImg" ).length ){
                var maxDelIdx = $( "div.pGallery div.floatImg" ).length - fltImgDivMax;
                // 削除処理
                for( var i = 0; i < maxDelIdx; i++ ){
                  $( "div.pGallery div.floatImg:last-child" ).remove();
                }
                // 配列初期化
                fltImgDivIdxArr = [];
                for( var i = 0; i < $( "div.pGallery div.floatImg").length; i++ ){
                  fltImgDivIdxArr.push( i );
                }
              }
              $( 'div.pGallery' ).fadeOut().empty();
              $( 'div.showTweets' ).fadeIn();
            }
          }
        );
    
    /*
    .delay( 8000 ).fadeOut( 'slow', 'swing', function(){
      
      $(this).css( {
        top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
        left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
        display : "block",
        "z-index" : 100
      });
      
      $( 'div.pGallery' ).hide();
      $( 'div.pGallery' ).empty();
      $( 'div.showTweets' ).show();
  
    } );
    */
  };
  

  // APIからデータ取得 img
  var getApiData = function( aUrl, query ){
    $.ajax( { 
      url  : aUrl,
      type : "GET",
      dataType : 'jsonp',
      //data : {"q" : query },
      data : {"q" : query + " twitter OR twitpic OR plixi OR twipple OR yfrog OR instagr -RT -QT",
              "include_entities" : 1,
              "lang" : "ja",
              "rpp"  : "20"
       },
      // Success
      success : function( json ){
        var data = json.results;
        var i;
        var dataLen;
        if( data.length < fltImgDivMax ){
          dataLen = data.length;
        } else {
          dataLen = fltImgDivMax;
        }
        var moveImgIdx = parseInt( Math.random() * dataLen );
        for( i = 0; i < dataLen; i++ ){
          var dataObj  = data[i];
          var iconUrl  = dataObj.profile_image_url;
          var tweetId  = dataObj.id;
          var tweetStr = dataObj.text;
          var imgUrl   = exchgImg( dataObj );
          
          if( imgUrl !== "" ){ // imgUrlが存在する場合
            $('div.pGallery').append( 
              $('<div>').addClass("floatImg").append( 
                $('<img>')
                  .attr( { "src" : imgUrl, "alt" : "" } )
                  .load( function(){
                    
                    var rSize = fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) );
                    imgSizeFix( $( this ), parseInt( rSize ), parseInt( rSize ) );
                    $( this ).css( { opacity : "0.5" } );
                    
                    $( this ).parent("div.floatImg")
                      .css( {
                        top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
                        left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
                        display : "none",
                        "z-index" : 100
                      } )
                      .fadeIn();
                    
                    if( moveImgIdx === $(this).parent("div.floatImg").index() ){
                      //setTimeout( moveImgDish( moveImgIdx ), 13000 );
                      moveImgDish( moveImgIdx );
                    }
                   
                  } )
              ) 
            );
          } else {
            //console.log( dataObj );
          }
        }
        // 画面外に追いやる
        $('div.floatImg').css( {left : $( 'div.pGalleryFrm' ).css( "width" ) } );
      },
      // Error
      error : function(){
        //console.log("データ取得が失敗しました");
      }
    } );
  }
  
    // APIからデータ取得 tweet
  var showTweetData = function( aUrl, query ){
    $.ajax( { 
      url  : aUrl,
      type : "GET",
      //data : {"q" : query },
      data : {"q" : query,
              "include_entities" : 1,
              "lang" : "ja",
              "rpp"  : "20"
       },
      dataType : 'jsonp',
      // Success
      success : function( json ){
        var data = json.results;
        var i;
        var dataLen = 0;
        if( data.length < tweetDivMax ){
          dataLen = data.length;
        } else {
          dataLen = tweetDivMax;
        }
        for( i = 0; i < dataLen; i++ ){
        //for( i = 0; i < 3; i++ ){
          var dataObj  = data[i];
          var iconUrl  = dataObj.profile_image_url;
          var tweetId  = dataObj.id;
          var tweetStr = dataObj.text;
          var imgUrl   = exchgImg( dataObj );
          
          $('div.showTweets').append( 
            $('<div>').addClass("tweet")
              .append( $('<div>').addClass("tweetIcon")
                .append(  $('<img>').attr( { "src" : iconUrl, "alt" : tweetId } ) ) )
              .append( $('<div>').addClass("tweetData")
                .append(  $('<p>').text( tweetStr ) ) ) );
                
        }
      },
      // Error
      error : function(){
        //console.log("データ取得が失敗しました");
      }
    } );
  }

  // Initial Logic
  showTweetData( restApiConf[ "url" ], restApiConf[ "dfltq" ] );
  
  // Stream Data
  var socket = io.connect( appUrl + "/", {port: 8080} );
  socket.on( 'tweet', function( tweet ){
    
    if( tweetDivMax <= $( "div.showTweets div.tweet" ).length ){
      var maxDelIdx = $( "div.showTweets div.tweet" ).length - tweetDivMax;
      // 削除処理
      for( var i = 0; i <= maxDelIdx; i++ ){
        $( "div.showTweets div.tweet:last-child" ).remove();
      }
    }
    
    //新着追加分はprependする
    $('div.showTweets').prepend( 
      $('<div>').addClass("tweet")
        .append( $('<div>').addClass("tweetIcon")
          .append(  $('<img>').attr( { "src" :  tweet.user.profile_image_url, "alt" : "" } ) ) )
        .append( $('<div>').addClass("tweetData")
          .append(  $('<p>').text( tweet.text ) ) ) );
    
  });

});
