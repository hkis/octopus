var Bing = Bing || {};
if(!Bing.tools){//这里鉴定工具函数是否初始化，防止多次初始化浪费内存
    Bing.tools = new Bing.demo();   
};

(function(){
    /*
    *PDF阅读器
    ****************************/
    Bing.Pdf = function(arg){
        this.arg = $.extend({ uid: '', allowTypes: '', listUrl: '', loadImgUrl: '', officeToPdfUrl:'', pageSize: 8, parent: $('body') }, arg);
        if(!this.arg.loadImgUrl || !this.arg.listUrl){
            throw new Error('必须指定下载路径');
            return false;
        }
        this.tools = Bing.tools;
        
        this.search = this.listPdf = this.pdfReader = '';
        
        var urlObject = this.tools.parseURL(window.location.href.toLowerCase());
        this.urlObject = urlObject;
        this.navigationBar = $('<div class="navigationBar"><span class="logo">LOGO</span><span><a href="?pagetype=search">首页</a></span> <span><a href="?pagetype=list">列表页</a></span></div>');
        this.arg.parent.append(this.navigationBar);
        var $this  = this;
        this.navigationBar.find('a').click(function(){
            window.location.href = $(this).attr('href');
            $this.arg.parent.css({overflow:''});
            return false;
        });
        var thisPDF = this;
        if(!urlObject.pagetype || urlObject.pagetype === "search"){
            this.search = new Bing.Search({
                uid:this.arg.uid,
                parent: this.arg.parent,
                allowTypes: this.arg.allowTypes,
                officeToPdfUrl: this.arg.officeToPdfUrl
            });
        } else if (urlObject.pagetype === "list") {
            var currP = parseInt(urlObject.currentpage);
            this.listPdf = new Bing.PdfList({
                uid:this.arg.uid,
                listUrl:this.arg.listUrl,
                pageIndex: (currP) ? currP : 1,
                pageSize:this.arg.pageSize,
                parent:$('body')
            });
            var $this = thisPDF.listPdf;
            $this.nameSpace.click(function(e){
                var tar = e.target;
                if(tar.nodeName.toUpperCase() == "A"){
                    window.location.href = '?pagetype=mainread&fileid='+$(tar).attr('title')+'&filename='+$(tar).html();
                    return false;
                }
            });
        }else if(this.urlObject.filename && urlObject.pagetype === "mainread"){
            $(document).forbidSelect();
            $this.arg.parent.css({overflow:'hidden'});
            thisPDF.pdfReader = new Bing.PdfReader({ fileId: this.urlObject.fileid, fileName: this.urlObject.filename, uid: thisPDF.arg.uid, url: thisPDF.arg.loadImgUrl, parent: thisPDF.arg.parent });
        }else{
            this.arg.parent.append('<div class="error">地址栏信息出错了<div>');
        }
        
        //防止事件缓存，节约内存
        $(window).unload(function(){
            $('body').remove();
        });
    };
    (function(){
        Bing.Search = function(arg){
            this.arg = $.extend({uid:'',allowTypes:'',parent:$('body'),officeToPdfUrl:''},arg);
            this.tools = Bing.tools;
            this.nameSpace = $('<form action="" target="" class="search"></form>');
            this.searchInput = $('<input class="searchInput" type="text" maxlength="100" autocomplete="off" placeHolder="请输入你要查看的文件地址" />');
            this.submit = $('<input type="submit" class="submit" value="查看文件" />');
            this.sending = $('<label class="sending">处理中...</label>');
            this.init();
        };
        Bing.PdfList = function(arg){
            this.arg = $.extend({uid:'',listUrl:'',pageIndex:1,pageSize:8,parent:$('body')},arg);
            this.tools = Bing.tools;
            this.nameSpace = $('<div class="pdfList"></div>');
            this.tableList = $('<table cellspacing="0" cellpadding="0" width="100%"><tbody></tbody></table>');
            this.init();
        };
        Bing.Pages = function(arg){
            this.arg = $.extend({total:100,currentPage:1,parent:$('body'),size:10,href:''},arg);
            this.tools = Bing.tools;
            this.nameSpace = $('<ul class="pages"></ul>');
            this.init();
        };
        Bing.Search.prototype = {
            init : function(){
                this.nameSpace.append(this.searchInput,this.submit,this.sending);
                this.arg.parent.append(this.nameSpace);
                this.searchInput.focus();
                this.submitFun();
            },
            submitFun : function(){
                var $this = this;
                this.nameSpace.submit(function () {
                    var url = $this.searchInput.val().toLowerCase();
                    if(url.indexOf('http://') != 0){
                        url = "http://" + url;
                        $this.searchInput.val(url);
                    }
                    if($this.tools.isNeedFile({file:url,needFiles:$this.arg.allowTypes})){
                        $this.officeToPdf(url);
                    }else{
                        alert('只允许查看'+$this.arg.allowTypes+'类型的文件');
                    }
                    return false;
                });
            },
            officeToPdf : function (url) {
                ///^(http|https|ftp)\:\/\//i.test(url)
                var $this = this;
                $.ajax({
                    type:"POST",
                    contentType: "application/json; charset=utf-8",
                    dataType:"json",
                    beforeSend:function(){
                        $this.beforeSend();
                    },
                    url:$this.arg.officeToPdfUrl,
                    data:"{'documentURL':'"+url+"','uid':'"+$this.arg.uid+"'}",
                    success: function (d) {
                        d = $.parseJSON(d.d);
                        if (d.result) {
                            window.location.href = '?pagetype=mainread&fileId='+ d.fileID +'&filename=' + d.title;
                        } else {
                            $this.success();
                            alert(d.errCode);
                        }
                    }
                });
            },
            beforeSend : function(){
                var $this = this;
                this.submit.fadeOut(200,function(){
                    $this.sending.fadeIn(100);
                });
            },
            success : function(){
                var $this = this;
                this.sending.fadeOut(200,function(){
                    $this.submit.fadeIn(100);
                });
            }
        };
        Bing.PdfList.prototype = {
            init : function(){
                this.ajax(true);
            },
            ajax: function (firstOr) {
                var $this = this;
                $.ajax({
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    dataType:"json",
                    url: $this.arg.listUrl,
                    data: '{uid:"' + $this.arg.uid + '",pageSize:' + $this.arg.pageSize+',pageIndex:'+$this.arg.pageIndex+'}',
                    success: function (data) {
                        $this.tableList.append('<tr><th width="50%" class="title">标题</th><th width="30%" class="author">上传者</th><th width="20%"class="time">时间</th></tr>');
                        data = $.parseJSON(data.d);
                        if (data.IsError) {
                            alert(data.ErrorCode);
                            return ;
                        } else {
                            var item = data.Item, dataLength = data.PageCount, i = 0;
                            while (dataLength--) {
                                $this.addList(item[dataLength]);
                            }
                        }
                        $this.nameSpace.append($this.tableList);
                        $this.appendToDisplay();
                        $this.addPageNumer(data.PageCount, $this.arg.pageIndex);
                    }
                });
            },
            addList:function(data){
                if(data){
                    this.tableList.find('tr:first').after('<tr class="file-list"><td width="50%" class="title"><a href="#" title="'+data.fileID+'">'+data.title+'</a></td><td width="30%" class="author">'+data.author+'</td><td width="20%"class="time">'+data.time+'</td></tr>');
                }
            },
            addPageNumer : function(numberCount,currentPage){//分页效果，待添加
                numberCount = parseInt(numberCount);
                var pageCount = Math.ceil(numberCount/this.arg.pageSize);
                if(pageCount > 1){
                    new Bing.Pages({ total: pageCount, currentPage: currentPage, parent: this.arg.parent, size: 10, href: '?pagetype=list&currentPage=' });
                }
            },
            appendToDisplay : function(){
                this.arg.parent.append(this.nameSpace);
            },
            removeToHidden : function(){
                this.nameSpace.remove();
            }
        };
        Bing.Pages.prototype = {
            init : function(){
                var arg = this.arg, 
                    currP = arg.currentPage,
                    total = arg.total,
                    pageObj = this.tools.pasePages({total:total,currentPage:currP,size:arg.size}),
                    i = pageObj.start;
                if(currP > 1){
                    this.nameSpace.append('<li><a title="1" href="'+arg.href+'1">首页</a></li>');
                    this.nameSpace.append('<li><a title="'+(currP - 1)+'" href="'+arg.href+(currP - 1)+'"><<</a></li>');
                }else{
                    this.nameSpace.append('<li><span>首页</span></li>');
                    this.nameSpace.append('<li><span><<</span></li>');
                }
                for(; i <= pageObj.end; i++){
                    if(i != currP){
                        this.nameSpace.append('<li><a title="'+i+'" href="'+arg.href+i+'">'+i+'</a></li>');
                    }else{
                        this.nameSpace.append('<li><span class="current">'+i+'</span></li>');
                    }
                }
                if (currP < total) {
                    this.nameSpace.append('<li><a title="'+(currP + 1)+'" href="'+arg.href+(currP + 1)+'">>></a></li>');
                    this.nameSpace.append('<li><a title="'+total+'" href="'+arg.href+total+'">尾页</a></li>');
                }else{
                    this.nameSpace.append('<li><span>>></span></li>');
                    this.nameSpace.append('<li><span>尾页</span></li>');
                }
                this.nameSpace.append('<li>'+currP+'/'+total+'</li>');
                arg.parent.append(this.nameSpace);
            }
        }
    })();
    
    Bing.PdfReader = function(arg){
        this.arg = $.extend({uid:'',url:'',fileId:'',fileName:'',parent:$('body')},arg);
        if(!this.arg.url){
            throw new Error('必须指定文件下载路径');
            return false;
        }
        this.tools = Bing.tools;//主要工具函数
        this.screenMinWidth = 1050;
        this.nameSpace = $('<div class="pdf-main-body"></div>');//命名空间
        this.titleBar = $('<div class="titleBar"><span id="title"></span><span id="author"></span><span id="pages"><span>跳至:</span><input type="text" value="1" /><span id="sumPages"></span></span><span class="pageUpDown"><a href="#" class="pageUp">-</a><a href="#" class="pageDown">+</a></span></div>');
        this.loading = $('<span class="loading"></span>');
        this.titleBar.append(this.loading);
        this.mainHeight = 1122;
        this.thumbnailsHeight = 226;
        this.proportion = this.mainHeight/this.thumbnailsHeight;
        this.mainBody = $('<div class="mainBody"></div>');
        this.returnToTop = $('<div class="returnToTop" style="display:none"></div>');
        this.thumbnails = $('<div class="thumbnails"></div>');//判断是否需要显示缩略图
        this.init();
    };
    Bing.PdfReader.displayImg = function(arg){
        this.arg = $.extend({fileId:'',fileName:'',uid:'',url:'',parent:$('body'),success:function(){}},arg);
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
                this.appendToDisplay();
                this.titleBarHeight = this.titleBar.height();
                this.resizeScreen();
                this.resize();
                var mainBody = new Bing.PdfReader.displayImg({fileId:this.arg.fileId,fileName:this.arg.fileName,uid:this.arg.uid,url:this.arg.url,pageHeight:this.mainHeight,parent:this.mainBody,success:editTitleBar,main:this,type:'rich'});
                var thumbnails = new Bing.PdfReader.displayImg({fileId:this.arg.fileId,fileName:this.arg.fileName,uid:this.arg.uid,url:this.arg.url,pageHeight:this.thumbnailsHeight,parent:this.thumbnails,success:'',type:'simple'});
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
                    this.screenHeight = document.documentElement.clientHeight - 40;
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
            },
            appendToDisplay : function(){
                this.arg.parent.append(this.nameSpace);
            },
            removeToHidden : function(){
                this.nameSpace.remove();
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
                arg.scroll(function(e){
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
                });
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
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    dataType:"json",
                    data:'{"fileId":"'+$this.arg.fileId+'","uid":"'+$this.arg.uid+'","index":"'+indexS+'","firstOr":"'+firstOr+'","type":"'+$this.arg.type+'"}',
                    url:$this.arg.url,
                    beforeSend:function(){
                        if($this.arg.type == 'rich'){
                            $this.arg.main.loading.fadeIn('fast');
                        }
                    },
                    success: function (d) {
                        d = $.parseJSON(d.d);
                        if(d.result){
                            if(d){
                                if(!firstOr){//如果不是第一次请求，则返回简单的html
                                    $this.addPages(d);
                                }else{//如果不是返回格式为：{allNumber:,width:,height:,title:,author:,"pageContent":}
                                    var par = $this.nameSpace;
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
                        }else{
                            if($this.arg.type == 'rich'){
                                alert(d.errCode);
                            }
                            return false;
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