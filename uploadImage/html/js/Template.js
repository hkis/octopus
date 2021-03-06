﻿var Bing = Bing || {};
if(!Bing.tools){//这里鉴定工具函数是否初始化，防止多次初始化浪费内存
    Bing.tools = new Bing.demo();   
}

(function(){
    Bing.UpImg = function(arg){
        this.arg = $.extend({uid:'',allowTypes:'png,jpg,jpeg',imgPro:0.9,size:8,className:'uploadImg',postUrl:'',successFn:function(){},errorFn:function(){}},arg);
        this.tools = Bing.tools;//主要工具函数
        this.nameSpace = $('<div class="'+this.arg.className+'"></div>');//父标签
        this._init();//默认执行的函数
    };
    Bing.UpImg.prototype = {
        _init : function(){
            var Space = this.nameSpace;
            var iframe = $('#iframe_hidden');//这里寻找页面中的iframe元素，为图片的“异步”提交做准备
            if(iframe.length == 0){
               $('body').append('<iframe name="ifr" id="iframe_hidden" style="display:none"></iframe>');
            }
            iframe = null;
            Space.append('<form enctype="multipart/form-data" action="'+this.arg.postUrl+'" target="ifr" method="post" ><input type="hidden" name="uid" value="'+this.arg.uid+'" /><input type="hidden" name="action" value="upload" /><label id="action">请上传格式为'+this.arg.allowTypes+'的图片</label></form>');
            
            var fileEle = $('<input type="file" name="filedata" />'),
                imgContent = $('<div id="preview"></div>'),
                submitButton = $('<input type="button" value="提交" id="submit" style="display:none" />'),
                loading = $('<span id="loading" style="display:none;">图片上传中</span>');
           
            Space.find('form').append(fileEle);
            Space.append(imgContent,submitButton,loading);
            
            this.fileEle = fileEle;
            this.imgContent = imgContent;
            this.submitButton = submitButton;
            this.loading = loading;
            
            var $this = this;
            fileEle.change(function(){
                var fileUrl = $(this).val();
                if(fileUrl){
                    if($this.tools.isNeedFile({file:fileUrl,needFiles:$this.arg.allowTypes})){
                        Bing.imgData = '';//这里新建一个全局变量，为了获取iframe中返回的数据，稍后会删除，不会影响其他用户变量
                        $(this).parents('form').submit();
                        $this.loadFun();
                        $this.loading.html('图片上传中').fadeIn(2);
                    }else{
                        alert('允许上传的图片格式为: '+$this.arg.allowTypes);
                    }
                }
                fileUrl = null;
            });
            fileEle = imgContent = submitButton = loading = null;
        },
        append : function(arg){
            arg.append(this.nameSpace);
            if(this.arg.successFn){this.arg.successFn();}
        },
        loadFun : function(){
            var $this = this,
                timer = setInterval(auto,100);
            function auto(){
                var data = Bing.imgData;//这里不好，imgData是全局变量
                if(!data){return;}
                clearInterval(timer);
                data = $.parseJSON(data);//c#返回的数据格式都是json
                if(data.result){
                    var width = data.width,
                        height = data.height,
                        parEle = $this.imgContent;
                    //这里为了避免图片缓存，在图片地址后面添加了随机数
                    parEle.html('<img src="'+data.path+'?'+Math.random()+'" width="'+width+'" height="'+height+'" ondragstart="return false" />');
                    //对象包括图片格式和外层可视区域的格式,这里要求图片不能超出可视区域的大小,超出后等比例缩放
                    var imgSpecification = {childWidth:width,childHeight:height,screenWidth:parEle.width(),screenHeight:parEle.height()};
                    //调整图片规格
                    imgSpecification = $this.tools.fitSpecification(imgSpecification);
                    parEle.fadeIn().find('img').css(imgSpecification);
                    //下一步要添加截图框，所以要添加截图框宽高比例以及父标签
                    imgSpecification.cutPro = $this.arg.imgPro;//截图框比例
                    imgSpecification.parEle = parEle;//父标签
                    //添加截图框div
                    $this.createCutDiv(imgSpecification);
                    imgSpecification = null;
                }else{
                    alert(data.errCode);
                }
                $this.loading.html('上传成功').fadeOut();
                delete Bing.imgData;//删除临时添加的全局变量
             }
        },
        createCutDiv : function(arg){
            arg = $.extend({parEle : $('body'),cutPro:0.9,width:200,height:300,left:0,top:0},arg);
            arg.zoom = 0.9;
            var parEle = arg.parEle;delete arg.parEle;
            //这里
            var cutDivSpe = this.tools.addSmallDiv(arg);

            var cutDiv = $('<div id="cutDiv" style="width:'+cutDivSpe.width+'px; height:'+cutDivSpe.height+'px; left:'+cutDivSpe.left+'px; top:'+cutDivSpe.top+'px">'
                +'<div id="top"></div><div id="right"></div><div id="bottom"></div><div id="left"></div><div id="top_left"></div><div id="top_right"></div><div id="bottom_right"></div><div id="bottom_left"></div>'
                +'<div id="center_x"></div><div id="center_y"></div></div>'
            );
            parEle.append(cutDiv);
            var borderWidth = cutDiv.outerWidth() - cutDiv.width();
            if(borderWidth > 0){
                cutDiv.css({width:cutDivSpe.width - borderWidth,height:cutDivSpe.height - borderWidth});
            }
            this.submitButton.fadeIn();
            var $this = this;
            this.submitButton.one('click',function(){
                $this.submitCutData({
                    parEle:parEle.find('img'),
                    cutDiv:cutDiv,
                    url:uploadUrlAshx,
                    uid:$this.arg.uid,
                    fu:function(){
                        $this.submitButton.fadeOut();
                    }
                });
            });
            //拖动，调整大小
            new Bing.Drag({
                pro:$this.arg.imgPro,
                moveBar:cutDiv,
                imgEle:parEle.find('img'),
                parEle:$this.imgContent,
                moveBarIds:'top left bottom right top_left top_right bottom_left bottom_right'
            });
            //鼠标中州控制缩放
            new Bing.Scroll({
                eventEle:[parEle.find('img'),cutDiv],
                parEle:$this.imgContent
            });
        },
        submitCutData : function(arg){
            var arg = $.extend({parEle:'',cutDiv:'',url:'',uid:''},arg);
            var parEle = arg.parEle,
                cutDiv = arg.cutDiv,
                url = arg.url,
                uid = arg.uid;
            if(!parEle || !cutDiv || !url){
                throw new Error('传入参数出错，请指定截取框，所截元素以及提交路径');
                return false;
            }
            var data = 'imgWidth=' + parEle.width() + '&imgHeight=' + parEle.height() +
                '&top=' + parseInt(parseInt(cutDiv.css('top')) - parseInt(parEle.css('top'))) + '&left=' + parseInt(parseInt(cutDiv.css('left')) - parseInt(parEle.css('left'))) +
                '&width=' + cutDiv.outerWidth() + '&height=' + cutDiv.outerHeight() + '&action=cut&uid='+uid+'&isZoom=true';
            data = {type:'post',url:url,data:data,success:successSubmit,error:errorSubmit};
            this.tools.ajax(data);
            function successSubmit(data){
                data = $.parseJSON(data);
                if(data.result && data.path){
                    parEle.parent().html('<img src="'+data.path+'" width="'+data.width+'" height="'+data.height+'" style="display:relative; margin:0 auto;" />');
                    if('fu' in arg){arg.fu();}
                }else{
                    console.error(data);
                    throw new Error('远程返回参数出错');
                    return false;
                }
            }
            function errorSubmit(){
                alert('提交失败');
            }
        }
    }
    Bing.Drag = function(arg){
        this.arg = $.extend({pro:0.9,moveBar:'',imgEle:'',parEle:'',moveBarIds:''},arg);
        this.img = arg.imgEle;
        this.moveBar = '';
        this.tools = Bing.tools;
        var $this = this;
        (function($this){
            if(!$this.arg.moveBar){
                throw new Error('传入参数出错，必须指定拖动元素参数');
                return false;
            }
            var elementToDrag = $this.arg.moveBar,
                deltaX = deltaY = 0;
            $this.moveBar = elementToDrag;
            elementToDrag.bind('mousedown',function(e){
                var dragEle = $(this);
                deltaX = e.clientX - dragEle[0].offsetLeft;//初始化
                deltaY = e.clientY - dragEle[0].offsetTop;//初始化
                
                $this.startLeft = parseFloat(dragEle.css('left'));
                $this.startTop = parseFloat(dragEle.css('top'));
                $this.startWidth = dragEle.width();
                $this.startHeight = dragEle.height();
                $this.clientX = e.clientX;
                $this.clientY = e.clientY;
                $this.pro = $this.arg.pro;
                
                if($this.arg.moveBarIds.indexOf(e.target.id) > -1){
                    $(document).bind('mousemove',{
                        iD:e.target.id,
                        imgEle:$this.arg.imgEle,
                        moveNode:dragEle,
                        parEle:$this.arg.parEle
                    },_resizeHandler);
                    $(document).bind('mouseup',_resizeFinish);
                }else{
                    $(document).bind('mousemove',{dX:deltaX,dY:deltaY,moveNode:dragEle,imgEle:$this.arg.imgEle,parEle:$this.arg.parEle},_moveHandler);
                    $(document).bind('mouseup',{moveBar:dragEle},_upHandler);
        			if(dragEle[0].attachEvent){
        				dragEle[0].setCapture();
        				dragEle.bind('onlosecapture',{moveBar:dragEle},_upHandler);
        			}
                }
                dragEle.css({'opacity': 0.25,'filter':'alpha(opacity=25)'});
                dragEle = null;
            });
            elementToDrag = null;
        })($this);
        
        function _moveHandler(e){
            var data = e.data;
            var cutDiv = data.moveNode,cutLeft = e.clientX-data.dX,cutTop = e.clientY-data.dY;
            var imgEle = data.imgEle || '', parEle = data.parEle || '';
            if(imgEle && parEle){
                var data = {
                    imgLeft:parseFloat(imgEle.css('left')),
                    imgTop:parseFloat(imgEle.css('top')),
                    imgWidth:imgEle.width(),
                    imgHeight:imgEle.height(),
                    cutWidth:cutDiv.outerWidth(),
                    cutHeight:cutDiv.outerHeight(),
                    cutLeft:cutLeft,
                    cutTop:cutTop,
                    frameWidth:parEle.width(),
                    frameHeight:parEle.height()
                };
                var cutAccor = $this.tools.incaseOut(data);
                data = null;
                cutLeft = cutAccor.left;
                cutTop = cutAccor.top;
            }
            cutDiv.css({'left':cutLeft,'top':cutTop});
    	}
        function _upHandler(e){
    		//移除所有事件
    		$(document).unbind('mousemove',_moveHandler);
    		$(document).unbind('mouseup',_upHandler);
            var elementToDrag = e.data.moveBar;
    		if(elementToDrag[0].detachEvent){
    			elementToDrag.unbind('onlosecapture',_upHandler);
    			elementToDrag[0].releaseCapture();
    		}
            elementToDrag.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
            elementToDrag = null;
    	}
        //重新调整截取框
        function _resizeHandler(e){
            var cutObj,
                D = e.data,
                tarId = D.iD,
                leftC = e.clientX - $this.clientX,
                topC = e.clientY - $this.clientY,
                startWidth = $this.startWidth,
                startHeight = $this.startHeight,
                cutDiv = D.moveNode,
                imgEle = D.imgEle || '',
                parEle = D.parEle || '',
                borderWidth = cutDiv.outerWidth() - cutDiv.width();
            switch (tarId){
                case 'left':
                    cutObj = _resizeLeft(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'right':
                    cutObj = _resizeRight(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'top':
                    cutObj = _resizeTop(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'bottom':
                    cutObj = _resizeBottom(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'bottom_right':
                    cutObj = _resizeBottom_right(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'bottom_left':
                    cutObj = _resizeBottom_left(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'top_right':
                    cutObj = _resizeTop_right(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
                case 'top_left':
                    cutObj = _resizeTop_left(leftC,topC,startWidth,startHeight,cutDiv);
                    break;
            }
            if(imgEle && parEle){
                var coor = _incaseHide(cutObj,imgEle,parEle,cutDiv);
                if(coor){
                    resizeFrameFun(coor);
                }
            }
            if(!imgEle && !parEle){
                cutDiv.css({'left':cutObj.L,'top':cutObj.T,'width':cutObj.W - borderWidth,'height':cutObj.H - borderWidth});
            }
            imgEle = parEle = null;
        }
        function _resizeLeft(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.L = $this.startLeft + leftC;
            var changeH = startHeight;
            cutObj.W = startWidth - leftC;
            cutObj.H = parseFloat(cutObj.W / $this.pro);
            changeH -= cutObj.H;
            cutObj.T = $this.startTop + changeH/2;
            moveBar = null;
            return cutObj;
        }
        function _resizeRight(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            var changeH = startHeight;
            cutObj.W = leftC + startWidth;
            cutObj.H = parseFloat(cutObj.W / $this.pro);
            changeH -= cutObj.H;
            cutObj.T = $this.startTop + changeH/2;
            cutObj.L = $this.startLeft;
            moveBar = null;
            return cutObj;
        }
        function _resizeTop(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.T = $this.startTop + topC;
            var changeW = startWidth;
            cutObj.H = startHeight - topC;
            cutObj.W = parseFloat(cutObj.H * $this.pro);
            changeW -= cutObj.W;
            cutObj.L = $this.startLeft + changeW/2;
            moveBar = null;
            return cutObj;
        }
        function _resizeBottom(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            var changeW = startWidth;
            cutObj.H = topC + startHeight;
            cutObj.W = parseFloat(cutObj.H * $this.pro);
            changeW -= cutObj.W;
            cutObj.L = $this.startLeft + changeW/2;
            cutObj.T = $this.startTop;
            moveBar = null;
            return cutObj;
        }
        function _resizeBottom_right(leftC,topC,startWidth,startHeight,cutDiv){
             var cutObj = {},moveBar = cutDiv;
             cutObj.W = startWidth + leftC;
             cutObj.H = parseFloat(cutObj.W / $this.pro);
             cutObj.L = $this.startLeft;
             cutObj.T = $this.startTop;
             return cutObj;
        }
        function _resizeBottom_left(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth - leftC;
            cutObj.H = parseFloat(cutObj.W / $this.pro);
            cutObj.L = $this.startLeft + leftC;
            cutObj.T = $this.startTop;
            return cutObj;
        }
        function _resizeTop_right(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth + leftC;
            cutObj.H = parseFloat(cutObj.W / $this.pro);
            var changeH = cutObj.H - startHeight;
            cutObj.L = $this.startLeft;
            cutObj.T = $this.startTop - changeH;
            return cutObj;
        }
        function _resizeTop_left(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth - leftC;
            cutObj.H = parseFloat(cutObj.W / $this.pro);
            var changeH = cutObj.H - startHeight;
            cutObj.L = $this.startLeft + leftC;
            cutObj.T = $this.startTop - changeH;
            return cutObj;
        }
        function _incaseHide(cutObj,imgEle,parEle,cutDiv){
            var data = {
                imgLeft:parseFloat(imgEle.css('left')),
                imgTop:parseFloat(imgEle.css('top')),
                imgWidth:imgEle.width(),
                imgHeight:imgEle.height(),
                frameWidth:parEle.width(),
                frameHeight:parEle.height(),
                border:cutDiv.outerWidth() - cutDiv.width(),
                cutObj:cutObj
            };
            var cutCoor = $this.tools.incaseHide(data);
            if(!cutCoor){return false;}
            return cutCoor;
        }
        function _resizeFinish(){
            //移除所有事件
            var cutDiv = $this.moveBar;
    		$(document).unbind('mousemove',_resizeHandler);
    		$(document).unbind('mouseup',_resizeFinish);
    		if(cutDiv[0].detachEvent){
    			cutDiv.unbind('onlosecapture',_resizeFinish);
    			cutDiv[0].releaseCapture();
    		}
            cutDiv.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
            cutDiv = null;
        }
        function resizeFrameFun(arg){
            $this.moveBar.css({'left':arg.L,'top':arg.T,'width':arg.W,'height':arg.H});
        }
    }
    Bing.Scroll = function(arg){
        this.arg = arg;
        this.tools = Bing.tools;
        this.bindScroll = function(Ele,fn){
            Ele.unbind('mousewheel',fn);
            Ele.unbind('DOMMouseScroll',fn);
            Ele.bind('mousewheel',fn);
            Ele.bind('DOMMouseScroll',fn);
        }
        var $this = this;
        (function($this){
            var eles = $this.arg.eventEle;
            var parEle = $this.arg.parEle;
            var eles0 = eles[0],eles1 = eles[1];
            $this.moveBar = eles1;
            $this.imgPro = eles0.width() / eles0.height();//图片原始比例
            $this.img = eles0;
            if(parEle){
                $this.frameWidth = parEle.width();
                $this.frameHeight = parEle.height();
            }
            parEle = null;
            for(var i = 0,j = eles.length; i < j; i++){
                eles[i].mouseover(function(e){
                    $this.bindScroll($(this),scrollFun);
                });
            }
        })($this);
        //惰性函数，避免打开页面后，每次执行该函数都要有浏览器能力检测
        function scrollFun(e){
            'preventDefault' in e ? e.preventDefault() : e.returnValue = false;//阻止滚动
            if(e.detail){
                scrollFun = function(e){
                    resizeImage(-e.detail / 3,e);
                }
            }else{
                scrollFun = function(e){
                    resizeImage(e.wheelDelta /120,e);
                }
            }
            scrollFun(e);
        }
        //调整图片坐标以及图片大小，已使得图片以鼠标为中心点进行缩放
        function resizeImage(zoom,e){
            clearTimeout($this.timer);
            $this.timer = setTimeout(Resize,25);
            if($this.moveBar){
                var border = $this.moveBar.outerWidth() - $this.moveBar.width(),
                    cutWidth = $this.moveBar.width(),
                    cutHeight = $this.moveBar.height();
            }
            function Resize(){
                var img = $this.img;
                var offset = $(img).getParentOffset();
                zoom = (zoom>0) ? 1.2 : 0.8;
                var width = img.width(),height = 0;
                width = width * zoom;
                height = width / $this.imgPro;
                var data = {
                    cutWidth:cutWidth,
                    cutHeight:cutHeight,
                    imgLeft:parseFloat(img.css('left')),
                    imgTop:parseFloat(img.css('top')),
                    border:border,
                    imgOffset:offset,
                    mouseE:e,
                    zoom:zoom,
                    width:width,
                    height:height,
                    imgPro:$this.imgPro
                }
                var imgCoor = $this.tools.resizeImg(data);
                img.css(imgCoor);
                if($this.moveBar){
                    $this.cutLeft = imgCoor.left + (imgCoor.width - cutWidth) / 2;
                    $this.cutTop = imgCoor.top + (imgCoor.height - cutHeight) / 2;
                    if($this.frameWidth * $this.frameHeight){
                        $this.cutLeft = $this.cutLeft < 0 ? 0 : $this.cutLeft + cutWidth + border > $this.frameWidth ? $this.frameWidth - cutWidth - border : $this.cutLeft;
                        $this.cutTop = $this.cutTop < 0 ? 0 : $this.cutTop + cutHeight + border > $this.frameHeight ? $this.frameHeight - cutHeight - border : $this.cutTop;
                    }
                    $this.moveBar.css({'left':$this.cutLeft,'top':$this.cutTop});
                }
            }
        }
    }
})();