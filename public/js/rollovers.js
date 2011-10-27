var common_setting = function() {
	 // private util API method
	var os,ua,parameters,dom_event,minw_init = false;
	var initialize = function(){
		var u = navigator.userAgent.toLowerCase();
		var o = navigator.platform.toLowerCase();
		//os
		os = {};
		os.win = /win/.test(o)? true : false;
		os.mac = /mac/.test(o)? true : false;
		//navigator
		ua = {};
		ua.ie = /*@cc_on!@*/false ? parseFloat(u.replace(/^.*msie[^\d]*([\d\.]+).*$/,'$1')) : false;
		ua.iequirks = /BackCompat/i.test(document.compatMode) ? true : false;
		ua.webkit = /webkit/.test(u)? parseFloat(u.replace(/^.*webkit[^\d]*([\d\.]+).*$/,'$1')) : false;
		ua.opera = /opera/.test(u) ? parseFloat(u.replace(/^.*opera[^\d]*([\d\.]+).*$/,'$1')) : false;
		ua.nn = /netscape/.test(u) ? parseFloat(u.replace(/^.*netscape[^\d]*([\d\.]+).*$/,'$1')) : false;
		ua.ff = /firefox/.test(u) ? parseFloat(u.replace(/^.*firefox[^\d]*([\d\.]+).*$/,'$1')) : false;//ff+nn9.
	}();
	var getParameter = function() {
		if(!Array.prototype.pop) return;
		parameters = {};
		var s = document.getElementsByTagName('script');
		var p = s[s.length-1].getAttribute('src').split('?').pop().split('&');
		for(var i in p){
			if(/^.*=.*$/.test(p[i])){
				var o = p[i].split('=');
				parameters[o[0]] = o[1];
			}
		}
	}();

	var addEvent = function(elm,ftype,func,usecap) {
		try{
			elm.addEventListener(ftype,func,usecap);
		} catch(e){
			try {
				elm.attachEvent('on'+ ftype,func);
			} catch(e){
				return;
			}
		}
	}

	// load attach Event
	var initRollovers = function() {
		var tags = ['img','input'];
		var p_images = new Array();
		
		for(var i = 0; i < tags.length ; i++) {
			var elms = document.getElementsByTagName(tags[i]);
			for(var j = 0; j < elms.length;j++) {
				if(elms[j].className && String(elms[j].className).indexOf('imgover') >= 0) {
					var src = elms[j].getAttribute('src');
					var ftype = src.substring(src.lastIndexOf('.'), src.length);
					var hsrc = src.replace(ftype, '_on'+ftype);
		
					elms[j].setAttribute('hsrc', hsrc);
					
					p_images[p_images.length] = new Image();
					p_images[p_images.length - 1].src = hsrc;
					
					var target = elms[j];
					if(elms[j].parentNode.tagName.toLowerCase() == 'a'){
						target = elms[j].parentNode;
					}
					target.onmouseover = target.onfocus = function() {
						var _self = this;
						if(this.tagName.toLowerCase() == 'a') _self = this.getElementsByTagName('img')[0];
						_self.setAttribute('src', _self.getAttribute('hsrc'));
					};

					target.onmouseout = target.onblur = function() {
						var _self = this;
						if(this.tagName.toLowerCase() == 'a') _self = this.getElementsByTagName('img')[0];
						_self.setAttribute('src', _self.getAttribute('src').replace('_on', ''));
					};
					
				}
			}
		}
		
	}


	// onloadƒCƒxƒ“ƒg‚Í‚±‚±‚É’Ç‰Á
	var callLoadEvent = function() {
		initRollovers();
	}
	var addLoadEvent = function() {
		addEvent(window,"load",callLoadEvent,false);
	}();
}();



