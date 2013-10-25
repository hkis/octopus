var Bing = Bing || {};
if(!Bing.tools){//这里鉴定工具函数是否初始化，防止多次初始化浪费内存
    Bing.tools = new Bing.demo();   
}

(function(){
    /*
    *PDF阅读器
    ****************************/
    Bing.PdfReader = function(arg){
        this.arg = $.extend({uid:'',url:'',parent:$('body'),className:'',thumbnails:true,successFn:function(){},errorFn:function(){}},arg);
        if(!this.arg.url){
            throw new Error('必须指定文件下载路径');
            return false;
        }
        this.tools = Bing.tools;//主要工具函数
        this.screenMinWidth = 1050;
        this.nameSpace = $('<div class="'+this.arg.className+'"></div>');//命名空间
        this.titleBar = $('<div class="titleBar"><span id="title"></span><span id="author"></span><span id="pages"><span>跳至:</span><input type="text" value="1" /><span id="sumPages"></span></span><span class="pageUpDown"><a href="#" class="pageUp">-</a><a href="#" class="pageDown">+</a></span></div>');
        this.loading = $('<span class="loading"></span>');
        this.titleBar.append(this.loading);
        this.mainHeight = 1122;
        this.thumbnailsHeight = 226;
        this.proportion = this.mainHeight/this.thumbnailsHeight;
        this.mainBody = $('<div class="mainBody"></div>');
        this.returnToTop = $('<div class="returnToTop" style="display:none"></div>');
        this.thumbnails = (this.arg.thumbnails) ? $('<div class="thumbnails"></div>') : '';//判断是否需要显示缩略图
        this.init();
    };
    Bing.PdfReader.displayImg = function(arg){
        this.arg = $.extend({uid:'',url:'',parent:$('body'),success:function(){}},arg);
        this.tools = Bing.tools;//主要工具函数
        this.nameSpace = $('<ul ondragstart="return false;"></ul>');//父标签
        this.loadImgs = [];
        this.displayPages = {topPage:1,endPage:2};
        this.defaultHeight = this.arg.pageHeight;
        this.author = '这是文章的作者';
        this.title = '这是文章的标题';
        this.allNumber = 100;//这是总页数
        this.loadIndex = '&&';
        this.loading = $('<div class="loading"></div>');
        this.init();//默认执行的函数
    };
    (function(){
        Bing.PdfReader.prototype = {
            constructor : Bing.PdfReader,
            init : function(){
                this.nameSpace.append(this.titleBar,this.thumbnails,this.mainBody);
                this.arg.parent.append(this.nameSpace);
                this.titleBarHeight = this.titleBar.height();
                this.resizeScreen();
                this.resize();
                var mainBody = new Bing.PdfReader.displayImg({uid:this.arg.uid,url:this.arg.url,pageHeight:this.mainHeight,parent:this.mainBody,success:editTitleBar,main:this,type:'rich'});
                var thumbnails = new Bing.PdfReader.displayImg({uid:this.arg.uid,url:this.arg.url,pageHeight:this.thumbnailsHeight,parent:this.thumbnails,success:'',type:'simple'});
                var $this = this;
                thumbnails.nameSpace.click(function(e){
                    var tar = e.target;
                    var target = (tar.nodeName.toUpperCase() == "IMG") ? $(tar).parent() : $(tar);
                    mainBody.scrollToPage(target.index(),$this.mainHeight,$this.mainBody);
                });
                this.titleBar.find('#pages input').mouseup(function(){
                    $(this).select();
                });
                function editTitleBar(d){
                    var titleBar = $this.titleBar;
                    titleBar.find('#title').text(d.title);
                    titleBar.find('#author').text(d.author);
                    titleBar.find('#sumPages').text('/'+d.allNumber);
                }
                this.titleBar.find('.pageUpDown').click(function(e){
                    var tar = e.target,val = parseInt($this.titleBar.find('#pages input').val())-1;
                    if(tar.className =="pageDown"){
                        mainBody.scrollToPage(val+1,$this.mainHeight,$this.mainBody);
                    }else if(tar.className =="pageUp"){
                        mainBody.scrollToPage(val-1,$this.mainHeight,$this.mainBody);
                    }
                    return false;
                });
            },
            resizeScreen : function(){
                if(this.arg.parent.selector == 'body'){
                    this.screenWidth = document.documentElement.clientWidth;
                    this.screenHeight = document.documentElement.clientHeight;
                }else{
                    this.screenWidth = this.arg.parent.outerWidth();
                    this.screenHeight = this.arg.parent.outerHeight();
                }
                this.screenWidth = this.screenWidth > this.screenMinWidth ? this.screenWidth : this.screenMinWidth;
                this.nameSpace.css({height:this.screenHeight,width:this.screenWidth});
                this.mainBody.css({height:this.screenHeight - this.titleBar.outerHeight(),width:this.screenWidth - this.thumbnails.outerWidth()});
                this.thumbnails.css('height',this.screenHeight - this.titleBar.outerHeight());
            },
            resize : function(){
                var $this = this,resizeBody = this.arg.parent;
                if(this.arg.parent.selector == 'body'){
                    resizeBody = $(window);
                }
                resizeBody.resize(function(){
                    $this.resizeScreen();
                });
            }
        };
        Bing.PdfReader.displayImg.prototype = {
            constructor : Bing.PdfReader.displayImg,
            init : function(){
                var parent = this.arg.parent;
                var screenFa = this.returnClient(parent);
                var screenHeight = this.screenHeight = screenFa.height;
                var screenWidth = this.screenWidth = screenFa.width;
                this.scrollBody = parent;
                this.displayPages = this.tools.displayPages(screenHeight,this.defaultHeight,this.scrollBody.scrollTop());
                this.checkImgExist(this.displayPages,true);
                parent.append(this.nameSpace);
                if(this.arg.type == 'rich'){
                    this.nameSpace.append(this.arg.main.returnToTop);
                    var $this = this;
                    this.arg.main.returnToTop.click(function(){
                        $this.scrollBody.scrollTop(0);
                    });
                    this.jumpToPage(this.arg.main.titleBar.find('#pages input'),$this.scrollBody);
                    this.movePage({downBody:this.nameSpace,scrollBody:this.scrollBody});
                }
                this.scrollEvent(this.scrollBody);
            },
            scrollEvent : function(arg){
                var $this = this;
                $this.timer = '';
                arg[0].onscroll = function(e){//这里使用原生监听，是因为IE8-不支持在修改scrollTop的情况下触发jquery的scroll事件
                    e = e || window.event;
                    var scrollTop = $this.scrollBody.scrollTop();
                    var parMain = $this.arg.main;
                    if($this.arg.type == 'rich'){
                        parMain.returnToTop.css('display','none');
                    }
                    clearTimeout($this.timer);
                    $this.timer = setTimeout(loadImg,100);
                    function loadImg(){
                        var arg = $this.arg;
                        screenHeight = $this.screenHeight = $this.returnClient(arg.parent).height;
                        $this.displayPages = $this.tools.displayPages(screenHeight,$this.defaultHeight,scrollTop);
                        $this.checkImgExist($this.displayPages,false);
                        if(arg.type == 'rich'){
                            parMain.titleBar.find('input').val($this.displayPages.topPage + 1).select();
                            parMain.thumbnails.scrollTop(scrollTop/parMain.proportion-250);
                            parMain.nameSpace.find('li.hover').removeClass('hover');
                            parMain.nameSpace.find('li:eq('+$this.displayPages.topPage+')').addClass('hover');
                            if(scrollTop>0){
                                parMain.returnToTop.css({top:scrollTop + screenHeight* 0.9}).fadeIn('fast');
                            }
                        }
                    }
                }
            },
            returnClient : function(arg){
                arg = arg || $('body');
                if(arg[0] != document.body){
                    return {width:arg[0].clientWidth,height:arg[0].clientHeight}
                }else{
                    return {width:document.documentElement.clientWidth,height:document.documentElement.clientHeight}
                }
            },
            checkImgExist : function(arg,firstOr){
                var indexS = '';
                var par = this.nameSpace,loading = this.loading;
                for(var i = arg.topPage,j = arg.endPage;i<=j;i++){
                    if(this.loadIndex.indexOf('&&'+i+'&&') < 0 || par.find('li').length == 0){
                        indexS +=(i+1)+',';
                        this.loadIndex += (i+'&&');
                    }
                };
                indexS = indexS.substring(0,indexS.length-1);
                if(indexS){
                    this.ajaxImg(indexS,firstOr);
                }
            },
            ajaxImg : function(indexS,firstOr){
                var $this = this;
                $.ajax({
                    type:'POST',
                    data:'uid='+$this.arg.uid+'&index='+indexS+'&firstOr='+firstOr+'&type='+$this.arg.type,
                    url:this.arg.url,
                    beforeSend:function(){
                        if($this.arg.type == 'rich'){
                            $this.arg.main.loading.fadeIn('fast');
                        }
                    },
                    success:function(d){
                        d = $.parseJSON(d);
                        if(d){
                            if(!firstOr){//如果不是第一次请求，则返回简单的html
                                $this.addPages(d);
                            }else{//如果不是返回格式为：{allNumber:,width:,height:,title:,author:,"pageContent":}
                                var par = $this.nameSpace;
                                $this.author = d.author;
                                $this.title = d.title;
                                $this.allNumber = d.allNumber;
                                var liSum = '',numSum = d.allNumber;
                                while(numSum--){
                                    liSum += "<li></li>";
                                }
                                par.append(liSum);
                                $this.addPages(d);
                                if($this.arg.type == 'rich'){
                                    $this.arg.success(d);
                                }
                            }
                        }
                        if($this.arg.type == 'rich'){
                            $this.loading.remove();
                            $this.arg.main.loading.fadeOut('fast');
                        }
                    }
                });
            },
            addPages : function(d){
                var index = d.index.split(','),
                    d = d.pageContent.split('&&');
                for(var i=0,j=index.length;i<j;i++){
                    if(d[i]){
                        this.nameSpace.find('li:eq('+(parseInt(index[i]) - 1)+')').append(d[i]);
                    }
                }
            },
            jumpToPage : function(eventEle,scrollEle){
                var $this = this;
                eventEle.keydown(function(e){
                    if(e.keyCode == 13){
                        $this.scrollToPage($(this).val() - 1,$this.defaultHeight,scrollEle);
                    }
                })
            },
            scrollToPage : function(val,pageHeight,scrollEle){
                if(typeof val == 'number'){
                    if(val > this.allNumber){
                        val = this.allNumber-1;
                    }
                    scrollEle.scrollTop(val * pageHeight);
                }
            },
            movePage: function(arg){
                arg = $.extend({downBody:'',scrollBody:''},arg);
                arg.downBody.mousedown(function(e){
                    if(e.target.nodeName.toLowerCase() == 'img'){
                        $(this).bind('mousemove',{yClient:e.clientY,scrollTop:arg.scrollBody.scrollTop()},movePage);
                    }
                });
                arg.downBody.mouseup(function(e){
                    $(this).unbind('mousemove',movePage);
                });
                function movePage(E){
                    arg.scrollBody.scrollTop(E.data.scrollTop - E.clientY + E.data.yClient);
                }
            }
        };
    })();
})();