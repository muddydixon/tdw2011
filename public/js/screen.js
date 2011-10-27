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
  
  var restApiConf = { url   : "http://111.171.216.204/tdw2011/api/food",
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
   * Logic
   */
  // 背景用Div作成
  $( 'body' ).append( $( '<div>' ).addClass( 'pGalleryFrm' ) );
  $( 'div.pGalleryFrm' ).append($( '<div>' ).addClass( 'pGallery' ));
  
  // 画像URL生成
  var exchgImg = function( dObj ){
    
    var retUrl = "";
    
    var iUrl = dObj.entities.urls[0].expanded_url;
    if( iUrl !== undefined ){
      for( var k in imgUrlRegExp ){
        if( iUrl.match( imgUrlRegExp[ k ] ) ){
          retUrl = imgUrlFmt[ k ].replace( "%s", RegExp.$1 );
          break;
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
      size["h"] = parseInt( h * ( fw / w ) );
    } else {
      size["w"] = parseInt( w * ( fh / h ) );
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
  var moveImg = function(){
    
    var moveIdx = fltImgDivIdxArr.shift();
    fltImgDivIdxArr.push( moveIdx );
    console.log( moveIdx );
    var selDiv = $( $( "div.floatImg" ).get( moveIdx ) );
    
    var fixedTmpImgSize = getFixedImgSize(selDiv.children( "img" ), fixImgSize["w"], fixImgSize["h"]);
    selDiv.fadeOut( "fast", function(){
      
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
      { left : -( item.children( "img" ).width() )
      },
      // 下
      { top  : $( "div.pGalleryFrm" ).height()
      },
      // 上
      { top  : -( item.children( "img" ).height() )
      },
      // 右
      { left : $( "div.pGalleryFrm" ).width() 
      }
    ];
    
    var anmTime = 4000;
    
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
              
            }
          }
        );
     
  };
  

  // APIからデータ取得 img
  var getApiData = function( aUrl, query ){
    $.ajax( { 
      url  : aUrl,
      type : "GET",
      data : {"q" : query },
      // Success
      success : function( data ){
        var i;
        var dataLen = 0;
        if( fltImgDivMax < data.length ){
          dataLen = fltImgDivMax;
        } else {
          dataLen = data.length;
        }
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
                    var rSize = parseInt( fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) ) );
                    imgSizeFix( $(this), rSize, rSize );
                    $(this).css( { opacity : "0.5" } );
                    
                    $(this).parent("div.floatImg")
                      .css( {
                        top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
                        left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
                        display : "none",
                        "z-index" : 100
                      } )
                      .fadeIn();
                    
                  } )
              ) 
            );
            fltImgDivIdxArr.push( i );
          }
        }
        // 画面外に追いやる
        $('div.floatImg').css( {left : $( 'div.pGalleryFrm' ).css( "width" ) } );

        // 定期実行
        moveImgItvId = setInterval( moveImg, 6000 );
      },
      // Error
      error : function(){
        console.log("データ取得が失敗しました");
      }
    } );
  }
  
  // Initial Logic
  getApiData( restApiConf[ "url" ], restApiConf[ "dfltq" ] );
  
  // Stream Data
  var socket = io.connect( "http://111.171.216.204/", {port: 8080} );
  socket.on( 'tweet', function( tweet ){
    
    var addImgUrl = exchgImg( tweet );
    
    if( addImgUrl ){
      
      //新着追加分はprependする
      $('div.pGallery').prepend( 
        $('<div>')
        .addClass("floatImg")
        .css( {left : $( 'div.pGalleryFrm' ).css( "width" ) } )
        .append( 
          $('<img>').attr( { "src" : addImgUrl, "alt" : "" } )
          .load( function(){ 
                      var rSize = parseInt( fltImgMinSize + ( Math.random() * ( fltImgMaxSize - fltImgMinSize ) ) );
                      imgSizeFix( $(this), rSize, rSize );
                      $(this).css( { opacity : "0.5" } );
                      
                      $(this).parent("div.floatImg")
                        .css( {
                          top  : parseInt( Math.random() * ( screenSize["h"] - fltImgMaxSize ) ),
                          left : parseInt( Math.random() * ( screenSize["w"] - fltImgMaxSize ) ),
                          display : "none",
                          "z-index" : 100
                        } )
                        .fadeIn();
                      
                    } )
        )
        
      );

    }
  });
  

});
