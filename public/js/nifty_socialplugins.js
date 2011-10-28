// -*- coding:utf-8 -*-
(function(window){
    var version = '0.0.1',
    document = window.document,
    location = document.location,
    targets = (function(){
        var _targets = [];
        if(document.querySelectorAll){
            _targets = document.querySelectorAll('div.socialplugins');
        }else if(document.getElementsByClassName){
            _targets = document.getElementsByClassName('socialplugins');
        }else{
            var divs = document.getElementsByTagName('div'), i, l;
            for(i = 0, l = divs.length; i < l; i++){
                if(divs[i] && divs[i].className && divs[i].className.match(/socialplugins/)){
                    _targets.push(divs[i]);
                }
            }
        }
        return _targets;
    }()),
    escapeHTML = (function(){
        var escapeChars = {
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
            '&#39;':'\''
        };
        return function(string){
            if(typeof string === 'string'){
                return string.replace(/[\"<>]/, function(c){return escapeChars[c];});
            }
            return string;
        };}()),
    usePlugins = {},
    appendPlugins = function(target, tu, ap, t, d, opt){
        ap = ap.split(',');
        var definition = {
            twitter : '<a href="http://twitter.com/share" class="twitter-share-button" data-count="horizontal" data-lang="ja" data-url="'+tu+'" '+(t ? 'data-text="'+t+'" ' : '')+(opt && opt.twitter && opt.twitter.related ? 'data-related="'+opt.twitter.related+'" ' : '')+'>ツイートする</a>',
            mixi : '<a href="http://mixi.jp/share.pl" class="mixi-check-button" data-url="'+tu+'"'+(opt && opt.mixi && opt.mixi.apikey ? ' data-key="'+opt.mixi.apikey+'"' : '')+(opt && opt.mixi && opt.mixi.button ? ' data-button="'+opt.mixi.button+'"' : '')+'>mixiチェック</a>',
            gree : '<iframe src="http://share.gree.jp/share?url='+tu+'&type=0&height=20" scrolling="no" frameborder="0" marginwidth="0" marginheight="0" style="border:none; overflow:hidden; width:70px; height:20px;" allowTransparency="true"></iframe>',
            facebook : '<iframe src="http://www.facebook.com/plugins/like.php?href='+tu+'&amp;layout=button_count&amp;show_faces=true&amp;width=100&amp;action=like&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe>',
            microsoft : '<a target="_blank" href="http://profile.live.com/badge?url='+tu+(t ? '&title='+t : '' )+(d ? '&description='+d : '')+'" title="Windows Live メッセンジャーで共有"><img style="border-style:none; vertical-align:middle; margin-right:4px" src="http://www.nifty.com/pubc0m/img/windowslive/80_20_02.png" alt="Windows Live メッセンジャーで共有" /></a>'
        }, i, l;
        for(i = 0, l = ap.length; i < l; i++){
            if(definition.hasOwnProperty(ap[i])){
                var li = document.createElement('li');
                li.className = 'nifty-socialplugins-'+ap[i].toLocaleLowerCase();
                li.innerHTML = definition[ap[i].toLocaleLowerCase()];
                target.appendChild(li);
            }
        }
        return;
    },
    createTargetUL = function(target){var ul = document.createElement('ul'); target.appendChild(ul); return ul;},
    i, l;

    for(i = 0, l = targets.length; i < l; i++){
        if(!targets[i].getAttribute('data-nifty-socialplugins-mixi-apikey') || targets[i].getAttribute('data-nifty-socialplugins-mixi-apikey') === ''){
            continue;
        }
        var applys = targets[i].getAttribute('data-nifty-socialplugins-apply') || 'mixi,gree,facebook',
        url = targets[i].getAttribute('data-nifty-socialplugins-url')
            || location.protocol+'//'+location.hostname+location.pathname+(location.search ? '?'+encodeURIComponent(location.search.substr(1)).replace(/%3D/g, '=') : ''),
        title = escapeHTML(targets[i].getAttribute('data-nifty-socialplugins-title')) || null,
        description = escapeHTML(targets[i].getAttribute('data-nifty-socialplugins-description')) || null,
        opt = {
            twitter : {
                related : escapeHTML(targets[i].getAttribute('data-nifty-socialplugins-twitter-related')) || null
            },
            mixi : {
                apikey : targets[i].getAttribute('data-nifty-socialplugins-mixi-apikey'),
                button : targets[i].getAttribute('data-nifty-socialplugins-mixi-button') || null
            }
        },
        targetUl = (targets[i].getElementsByTagName('ul') && targets[i].getElementsByTagName('ul').length > 0 ?
                    targets[i].getElementsByTagName('ul')[0] :
                    createTargetUL(targets[i]));
        
        if(/mixi/.test(applys)){ usePlugins.mixi = true; }
        if(/twitter/.test(applys)){ usePlugins.twitter = true; }
        appendPlugins(targetUl, url, applys, title, description, opt);
    }

    var scriptsSrc = {mixi: 'http://static.mixi.jp/js/share.js', twitter: 'http://platform.twitter.com/widgets.js'}, plugin;
    for(plugin in usePlugins){
        if(usePlugins.hasOwnProperty(plugin)){
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', scriptsSrc[plugin]+'?rflg='+(0|Math.random()*1000000));
            script.setAttribute('charset', 'utf-8');
            document.body.insertBefore(script, null);
        }
    }
}(this));
