//编辑器展示页面内容解析，加载资源工具
//by zhanyi
function uParse(selector,opt){
    //需要的工具方法
    var ie = !!window.ActiveXObject,
        cssRule = ie ? function(key,style,doc){
            var indexList,index;
            doc = doc || document;
            if(doc.indexList){
                indexList = doc.indexList;
            }else{
                indexList = doc.indexList =  {};
            }
            var sheetStyle;
            if(!indexList[key]){
                if(style === undefined){
                    return ''
                }
                sheetStyle = doc.createStyleSheet('',index = doc.styleSheets.length);
                indexList[key] = index;
            }else{
                sheetStyle = doc.styleSheets[indexList[key]];
            }
            if(style === undefined){
                return sheetStyle.cssText
            }
            sheetStyle.cssText = sheetStyle.cssText + '\n' + (style || '')
        } : function(key,style,doc){
            doc = doc || document;
            var head = doc.getElementsByTagName('head')[0],node;
            if(!(node = doc.getElementById(key))){
                if(style === undefined){
                    return ''
                }
                node = doc.createElement('style');
                node.id = key;
                head.appendChild(node)
            }
            if(style === undefined){
                return node.innerHTML
            }
            if(style !== ''){
                node.innerHTML = node.innerHTML + '\n' + style;
            }else{
                head.removeChild(node)
            }
        },
        domReady = function (onready) {
            var doc = window.document;
            if (doc.readyState === "complete") {
                onready();
            }else{
                if (ie) {
                    (function () {
                        if (doc.isReady) return;
                        try {
                            doc.documentElement.doScroll("left");
                        } catch (error) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        onready();
                    })();
                    window.attachEvent('onload', function(){
                        onready()
                    });
                } else {
                    doc.addEventListener("DOMContentLoaded", function () {
                        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
                        onready();
                    }, false);
                    window.addEventListener('load', function(){onready()}, false);
                }
            }

        },
        _each = function(obj, iterator, context) {
            if (obj == null) return;
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if(iterator.call(context, obj[i], i, obj) === false)
                        return false;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if(iterator.call(context, obj[key], key, obj) === false)
                            return false;
                    }
                }
            }
        },
        inArray = function(arr,item){
            var index = -1;
            _each(arr,function(v,i){
                if(v === item){
                    index = i;
                    return false;
                }
            });
            return index;
        },
        pushItem = function(arr,item){
            if(inArray(arr,item)==-1){
                arr.push(item)
            }
        },
        loadFile = function () {
            var tmpList = [];
            function getItem(doc,obj){
                try{
                    for(var i= 0,ci;ci=tmpList[i++];){
                        if(ci.doc === doc && ci.url == (obj.src || obj.href)){
                            return ci;
                        }
                    }
                }catch(e){
                    return null;
                }

            }
            return function (doc, obj, fn) {
                var item = getItem(doc,obj);
                if (item) {
                    if(item.ready){
                        fn && fn();
                    }else{
                        item.funs.push(fn)
                    }
                    return;
                }
                tmpList.push({
                    doc:doc,
                    url:obj.src||obj.href,
                    funs:[fn]
                });
                if (!doc.body) {
                    var html = [];
                    for(var p in obj){
                        if(p == 'tag')continue;
                        html.push(p + '="' + obj[p] + '"')
                    }
                    doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></'+obj.tag+'>');
                    return;
                }
                if (obj.id && doc.getElementById(obj.id)) {
                    return;
                }
                var element = doc.createElement(obj.tag);
                delete obj.tag;
                for (var p in obj) {
                    element.setAttribute(p, obj[p]);
                }
                element.onload = element.onreadystatechange = function () {
                    if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                        item = getItem(doc,obj);
                        if (item.funs.length > 0) {
                            item.ready = 1;
                            for (var fi; fi = item.funs.pop();) {
                                fi();
                            }
                        }
                        element.onload = element.onreadystatechange = null;
                    }
                };
                element.onerror = function(){
                    throw Error('The load '+(obj.href||obj.src)+' fails,check the url')
                };
                doc.getElementsByTagName("head")[0].appendChild(element);
            }
        }();


    //默认的配置项目
    var defaultOption ={
        liiconpath : 'http://bs.baidu.com/listicon/',
        listDefaultPaddingLeft : '20',
        'highlightJsUrl':'',
        'highlightCssUrl':''
    };
    if(opt){
        for(var p in opt){
            defaultOption[p] = opt[p]
        }
    }
    domReady(function(){
        //处理容器
        var contents;
        if(document.querySelectorAll){
            contents = document.querySelectorAll(selector)
        }else{
            if(/^#/.test(selector)){
                contents = [document.getElementById(selector)]
            }else if(/^\./.test(selector)){
                contents = document.getElementsByClassName(selector)
            }else{
                contents = document.getElementsByTagName(selector)
            }
        }
        _each(contents,function(content){
            if(content.tagName.toLowerCase() == 'textarea'){
                var tmpNode = document.createElement('div');
                if(/^#/.test(selector)){
                    tmpNode.id = selector.replace(/^#/,'')
                }else if(/^\./.test(selector)){
                    tmpNode.className = selector.replace(/^\./,'')
                }
                content.parentNode.insertBefore(tmpNode,content);
                tmpNode.innerHTML = content.value;
                content.parentNode.removeChild(content);
                content = tmpNode;
            }

            function checkList(nodes){
                var customCss = [],
                    customStyle = {
                        'cn'    :   'cn-1-',
                        'cn1'   :   'cn-2-',
                        'cn2'   :   'cn-3-',
                        'num'   :   'num-1-',
                        'num1'  :   'num-2-',
                        'num2'  :   'num-3-',
                        'dash'  :   'dash',
                        'dot'   :   'dot'
                    };
                _each(nodes,function(list){
                    if(list.className && /custom_/i.test(list.className)){
                        var listStyle = list.className.match(/custom_(\w+)/)[1];
                        if(listStyle == 'dash' || listStyle == 'dot'){
                            pushItem(customCss,selector +' li.list-' + customStyle[listStyle] + '{background-image:url(' + defaultOption.liiconpath +customStyle[listStyle]+'.gif)}');
                            pushItem(customCss,selector +' ul.custom_'+listStyle+'{list-style:none;} '+ selector +' ul.custom_'+listStyle+' li{background-position:0 3px;background-repeat:no-repeat}');

                        }else{
                            var index = 1;
                            _each(list.childNodes,function(li){
                                if(li.tagName == 'LI'){
                                    pushItem(customCss,selector + ' li.list-' + customStyle[listStyle] + index + '{background-image:url(' + defaultOption.liiconpath  + 'list-'+customStyle[listStyle] +index + '.gif)}');
                                    index++;
                                }
                            });
                            pushItem(customCss,selector + ' ol.custom_'+listStyle+'{list-style:none;}'+selector+' ol.custom_'+listStyle+' li{background-position:0 3px;background-repeat:no-repeat}');
                        }
                        switch(listStyle){
                            case 'cn':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-1{padding-left:25px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-2{padding-left:40px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-3{padding-left:55px}');
                                break;
                            case 'cn1':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-1{padding-left:30px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-2{padding-left:40px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-3{padding-left:55px}');
                                break;
                            case 'cn2':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-1{padding-left:40px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-2{padding-left:55px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-3{padding-left:68px}');
                                break;
                            case 'num':
                            case 'num1':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-1{padding-left:25px}');
                                break;
                            case 'num2':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-1{padding-left:35px}');
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft-2{padding-left:40px}');
                                break;
                            case 'dash':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft{padding-left:35px}');
                                break;
                            case 'dot':
                                pushItem(customCss,selector + ' li.list-'+listStyle+'-paddingleft{padding-left:20px}');
                        }
                    }
                });

                customCss.push(selector +' .list-paddingleft-1{padding-left:0}');
                customCss.push(selector +' .list-paddingleft-2{padding-left:'+defaultOption.listDefaultPaddingLeft+'px}');
                customCss.push(selector +' .list-paddingleft-3{padding-left:'+defaultOption.listDefaultPaddingLeft*2+'px}');
                //如果不给宽度会在自定应样式里出现滚动条
                cssRule('list', selector +' ol,'+selector +' ul{margin:0;pading:0;}li{clear:both;}'+customCss.join('\n'), document);
            }
            //解析内容
            var needParseTagName = {
                'table' : function(){
                    cssRule('table',
                        selector +' table.noBorderTable td,'+selector+' table.noBorderTable th,'+selector+' table.noBorderTable caption{border:1px dashed #ddd !important}' +
                            //插入的表格的默认样式
                            selector +' table{margin-bottom:10px;border-collapse:collapse;display:table;}' +
                            selector +' td,'+selector+' th{ background:white; padding: 5px 10px;border: 1px solid #DDD;}' +
                            selector +' caption{border:1px dashed #DDD;border-bottom:0;padding:3px;text-align:center;}' +
                            selector +' th{border-top:2px solid #BBB;background:#F7F7F7;}' +
                            selector +' td p{margin:0;padding:0;}',
                        document);
                },
                'ol' : checkList,
                'ul' : checkList,
                'pre': function(nodes){
                    //避免重复加载高亮文件
                    if(typeof XRegExp == "undefined"){
                        loadFile(document,{
                            id : "syntaxhighlighter_js",
                            src : defaultOption.highlightJsUrl,
                            tag : "script",
                            type : "text/javascript",
                            defer : "defer"
                        },function(){
                            _each(nodes,function(pi){
                                if(/brush/i.test(pi.className)){
                                    SyntaxHighlighter.highlight(pi);
                                }
                            });
                        });
                    }
                    if(!document.getElementById("syntaxhighlighter_css")){
                        loadFile(document,{
                            id : "syntaxhighlighter_css",
                            tag : "link",
                            rel : "stylesheet",
                            type : "text/css",
                            href : defaultOption.highlightCssUrl
                        });
                    }

                }
            };
            //先插入默认的属性

            for(var tag in needParseTagName){
                var nodes = content.getElementsByTagName(tag);
                if(nodes.length){
                    needParseTagName[tag](nodes)
                }
            }
        })


    })
}