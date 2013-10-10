/**
*图片上传
*创建者 ： 赵亚兵
*创建日期 ： 2013.9.23
*修改人 ： XXX
*修改日期 ： XXXX.XX.XX
*/
var Bing = Bing || {};
(function(){
    /*****私有静态变量************/
    var B = Bing;
    /*****私有静态变量结束************/
    
    /*****公有静态方法************/
    //获得元素相对于浏览器窗口的坐标
    B.getParentOffset = function(arg){
       var parObj = $(arg)[0];
       var left = parObj.offsetLeft,top = parObj.offsetTop;
       while(parObj = parObj.offsetParent){
           left += parObj.offsetLeft;
           top += parObj.offsetTop;
       }
       return {left:left,top:top};
    }
    //屏蔽页面，避免选中
    B.forbidSelect = function(){
        $(document).bind('selectstart',function(){
             document.selection && document.selection.empty && ( document.selection.empty(), 1) || window.getSelection && window.getSelection().removeAllRanges();
             return false;
        });
    }
    /*****公有静态方法结束************/
    
    /*****公有接口************/
    /*
    *文件上传
    *参数格式 arg = {allowTypes:'',fileEle:'',fn:''}  allowTypes：允许上传的文件格式，以空格连接 fileEle: file元素id，fn: 上传成功后执行的函数
    *成功提交，运行fn,如果不符合要求弹出错误
    *例：B.UpImg({allowTypes:'',fileEle:'',fn:''})
    ****/
    B.UpImg = function(arg){        
        arg = $.extend({allowTypes:'',fileEle:'',fn:''},arg);
        
        //私有变量
        var $this = this;
        
        this.allowTypes = arg.allowTypes || '';// 允许上传的图片格式
        this.fileEle = arg.fileEle || '';//监听change事件的file元素
        this.fn = arg.fn || '';//上传前需要执行的操作
        
        init();//执行默认执行的操作
        
        function init(){
            var that = $this;
            $(that.fileEle).change(function(e){
                var url = $(this)[0].value;
                if(url){
                    if(B.checkFileType({url:url,allowTypes:that.allowTypes})){
                        $(this).parents('form').submit();
                        if(that.fn){that.fn();}
                    }else{
                        alert('允许上传的图片格式为'+that.allowTypes);
                    }
                }
            });
        }
        /*
        *将图片添加入标签中
        *参数格式 {parEle:$('body'),fn:'',data:''}  parEle：图片添加进去的父标签 默认为body标签  fn：添加进去后的操作 data:成功后显示的文件参数
        *data格式：'{"result":true,"size":300,errCode:E01,"height":200,"width":300,"path":"http://localhost/photos/ka11.jpg"}'  json字符串格式
        *****/
        this._append  = function(arg){
            arg = $.extend({parEle:$('body'),fn:'',data:''},arg);
            var that = this;
            var data = $.parseJSON(arg.data);
            if(data){
                if(data.result){
                    var width = data.width,height = data.height,parEle = arg.parEle;
                    parEle.html('<img src="'+data.path+'" width="'+width+'" height="'+height+'" ondragstart="return false" />');
                    if(arg.fn){
                        arg.fn({width:width,height:height,parEle:parEle});
                        width = height = parEle = null;
                    }
                }else{
                    var str ='',errorCode = data.errCode;
                    if(errorCode == 'E01'){
                        str = '图片格式不正确';
                    }else if(errorCode == 'E02'){
                        str = '图片大小超过4M';
                    }else if(errorCode == 'E03'){
                        str = '图片读取失败';
                    }
                    try{
                        alert(str);
                    }catch(e){}finally{
                        str = errorCode = null;
                    }
                }
            }
        }
    }
    /*
    *文件格式检测
    *参数格式 arg = {{url:'',allowTypes:''}  url：上传的文件路径 allowTypes：允许上传的文件格式，以空格连接
    *当allowTypes为空时，则允许上传所有格式的文件
    *输出 检测通过输出true，失败返回false 
    *例：UpImg.checkType({url:'../img/xsxsa.jpg',allowTypes:'jpg jpeg png'})
    ****/
    B.checkFileType = function(arg){
        arg = $.extend({url:'',allowTypes:''},arg);
        if(!arg.url){
            throw new Error('传入参数出错，图片上传路径属性不能为空');
            return false;
        }
        if(arg.allowTypes){
            var url = arg.url,imgType = url.substring(url.lastIndexOf(".")+1).toLowerCase();
            return arg.allowTypes.indexOf(imgType) > -1 ? true : false;
        }else{
            return true;
        }
    }
    /*
    *元素大小调整，使其在可视区域内完全显示
    *参数格式 arg={width:100,height:200,parWidth:50,parHeight:100}
    ***/
    B.ImgSizing = function(arg){
        arg = $.extend({width:100,height:200,parWidth:50,parHeight:100},arg);
        this.arg = arg;
        if(!arg.parEle){
            throw new Error('参数应该指定可视区域');
            return false;
        }
        var $this = this;
        // 图片规格，包括大小，坐标
        this.imgSpecification = (function(){
            var arg = $this.arg,
                imgWidth = arg.width,//元素宽度
                imgHeight = arg.height,//元素高度
                maxWidth = arg.parEle.width(),//可视区域宽度
                maxHeight = arg.parEle.height();//可视区域高度
            if(!maxWidth * maxHeight){
                throw new Error('可视区域应该制定宽度和高度');
                return false;
            }
            var por1 = maxWidth / maxHeight,
                por2 = imgWidth / imgHeight;
                
            if(imgHeight > maxHeight || imgWidth > maxWidth){
                if(por1 > por2){
                    imgHeight = maxHeight;
                    imgWidth = parseInt(maxHeight * por2);
                }else{
                    imgWidth = maxWidth;
                    imgHeight = parseInt(maxWidth / por2);
                }
            }
            var imgLeft = (maxWidth - imgWidth)/2,
                imgTop = (maxHeight - imgHeight)/2;
            return {left:imgLeft,top:imgTop,width:imgWidth,height:imgHeight};
        })();
        try{
            return this.imgSpecification;
        }catch(e){}finally{
            $this = this.imgSpecification = null;
        }
        
    }
    /*
    *截取框实例
    *参数格式  arg={cutPro:0.9,width:200,height:300,imgLeft:0,imgTop:0,fn:function(){}}
    * cutPro ： 截取框宽高比例
    * width ：所要截取的图片宽度
    * height：所要截取的图片高度
    * imgLeft：图片左坐标
    * imgTop：图片top坐标
    * fn：截图框添加完后执行的操作
    ****/
    B.CutImg = function(arg){
        arg = $.extend({cutPro:0.9,width:200,height:300,imgLeft:0,imgTop:0,fn:function(){}},arg)
        this.arg = arg;
        this.cutPro = arg.cutPro;
        var $this = this;
        // 截取框规格，包括大小，坐标
        this.cutSpecification = (function(){
            var arg = $this.arg,
                imgWidth = arg.width,//元素宽度
                imgHeight = arg.height,//元素高度
                cutPro = $this.cutPro,//截取框比例
                cutWidth = cutHeight = cutLeft = cutTop = 0;//截取框宽度和高度以及坐标初始化
            if(imgWidth / imgHeight > cutPro){
                cutWidth = parseInt(imgHeight * 0.8 * cutPro);
                cutHeight = parseInt(imgHeight * 0.8);
            }else{
                cutWidth = parseInt(imgWidth * 0.8);
                cutHeight = parseInt(imgWidth * 0.8 / cutPro);
            }
            cutLeft = (imgWidth - cutWidth)/2 + arg.imgLeft;
            cutTop = (imgHeight - cutHeight)/2 + arg.imgTop;
            return {parEle:arg.parEle,left:cutLeft,top:cutTop,width:cutWidth,height:cutHeight};
        })();
    }
    //将截图框添加进去
    B.CutImg.prototype.addCutDiv = function(arg){
        var cutS = arg;
        arg = arg || {};
        if(arg.parEle){
            arg.parEle.append(
                '<div id="cutDiv" style="width:'+cutS.width+'px; height:'+cutS.height+'px; left:'+cutS.left+'px; top:'+cutS.top+'px">'
                +'<div id="top"></div><div id="right"></div><div id="bottom"></div><div id="left"></div><div id="top_left"></div><div id="top_right"></div><div id="bottom_right"></div><div id="bottom_left"></div>'
                +'<div id="center_x"></div><div id="center_y"></div></div>'
            );
            arg.parEle.fadeIn(50);
            var cutDiv = arg.parEle.find('#cutDiv'),borderWidth = cutDiv.outerWidth() - cutDiv.width();
            if(borderWidth > 0){
                this.borderWidth = borderWidth;
                cutDiv.css({width:cutS.width - borderWidth,height:cutS.height - borderWidth});
            }
            if(this.arg.fn){
                this.arg.fn();
            }
        }else{
            throw new Error('传入参数出错，请指定截取框所要添加的标签');
            return false;
        }
    }
    //提交截图数据，包括图片大小，截图坐标和截图区域大小
    B.CutImg.prototype.submitCutData = function(arg){
        var arg = arg || {};
        if(!arg.parEle || !arg.cutDiv || !arg.url){
            throw new Error('传入参数出错，请指定截取框所要元素以及提交路径');
            return false;
        }
        var parEle = arg.parEle,
            cutDiv = arg.cutDiv;
        var data = 'imgWidth=' + parEle.width() + '&imgHeight=' + parEle.height() +
            '&top=' + parseInt(parseInt(cutDiv.css('top')) - parseInt(parEle.css('top'))) + '&left=' + parseInt(parseInt(cutDiv.css('left')) - parseInt(parEle.css('left'))) +
            '&width=' + cutDiv.outerWidth() + '&height=' + cutDiv.outerHeight() + '&action=cut&uid='+arg.uid+'&isZoom=true';
        parEle = cutDiv = null;
        console.log(data);
        $.ajax({
            type:'post',
            url:arg.url,
            data:data,
            success:function(data){
                data = $.parseJSON(data);
                arg.parentEle.html('<img src='+data.path+' width='+data.width+' height='+data.height+' style="display:relative; margin:0 auto;" />');
                if('fu' in arg){arg.fu();}
            }
        })
    }
    /*
    *拖动功能
    *参数格式 arg={pro:0.9,moveBar:$('#cutDiv'),imgEle:$('#preview img'),parEle:$('#preview'),moveBarIds:'top left bottom right top_left top_right bottom_left bottom_right'}
    *其中pro：比例，moveBar是鼠标按下后能实现拖动的标签，moveContent是一定的标签，如果为空则与moveBar相同
    *imgEle，parEle必须同时存在或者同时不存在，这里是为截图限制区域添加的属性，如果只是为了拖动，只需要前两个或者第一个属性
    *moveBarIds:调整大小的id总和
    *具体实现参看功能实现实例
    ****/
    B.Drag = function (arg){
        this.arg = arg;
        this.img = arg.imgEle;
        this.moveBar = '';
        
        var $this = this;
        (function($$this){
            var $this = $$this;
            if(!$this.arg.moveBar){
                throw new Error('传入参数出错，必须最少指定moveBar参数');
                return false;
            }
            var elementToDrag = $this.arg.moveBar;
            var deltaX = deltaY = 0;
            var resizeStr = $this.arg.moveBarIds;
            $this.moveBar = elementToDrag;
            elementToDrag.bind('mousedown',function(e){
                deltaX = e.clientX - elementToDrag[0].offsetLeft;//初始化
                deltaY = e.clientY - elementToDrag[0].offsetTop;//初始化
                var offset = B.getParentOffset($this.img.selector);//获取元素相对于浏览器窗口的坐标
                
                $this.startLeft = parseInt(elementToDrag.css('left'));
                $this.startTop = parseInt(elementToDrag.css('top'));
                $this.startWidth = elementToDrag.width();
                $this.startHeight = elementToDrag.height();
                $this.clientX = e.clientX;
                $this.clientY = e.clientY;
                $this.pro = $this.arg.pro;
                
                if(resizeStr.indexOf(e.target.id) > -1){
                    $(document).bind('mousemove',{
                        iD:e.target.id,
                        imgEle:$this.arg.imgEle,
                        moveNode:elementToDrag,
                        parEle:$this.arg.parEle
                    },_resizeHandler);
                    $(document).bind('mouseup',_resizeFinish);
                }else{
                    $(document).bind('mousemove',{dX:deltaX,dY:deltaY,moveNode:elementToDrag,imgEle:$this.arg.imgEle,parEle:$this.arg.parEle},_moveHandler);
                    $(document).bind('mouseup',{moveBar:elementToDrag},_upHandler);
        			if(elementToDrag[0].attachEvent){
        				elementToDrag[0].setCapture();
        				elementToDrag.bind('onlosecapture',{moveBar:elementToDrag},_upHandler);
        			}
                }
                elementToDrag.css({'opacity': 0.25,'filter':'alpha(opacity=25)'});
            });
        })($this);
        
        function _moveHandler(e){
            var data = e.data;
            var cutLeft = e.clientX-data.dX,cutTop = e.clientY-data.dY,cutDiv = data.moveNode;
            var imgEle = data.imgEle || '', parEle = data.parEle || '';
            if(imgEle && parEle){
                var imgLeft = parseInt(imgEle.css('left')),
                    imgTop = parseInt(imgEle.css('top')),
                    imgWidth = imgEle.width(),
                    imgHeight = imgEle.height(),
                    cutWidth = cutDiv.outerWidth(),
                    cutHeight = cutDiv.outerHeight(),
                    frameWidth = parEle.width(),
                    frameHeight = parEle.height();
                var leftMax = imgLeft + imgWidth, //裁剪框坐标left最大值
                    topMax = imgTop + imgHeight,  //裁剪框坐标top最大值
                    leftMin = imgLeft,            //裁剪框坐标left最小值
                    topMin = imgTop;              //裁剪框坐标top最小值
                    
                leftMax = (leftMax > frameWidth) ? frameWidth : leftMax;// 和父层div框作比较，防止截取框超出可视区域
                topMax = (topMax > frameHeight) ? frameHeight : topMax;
                
                leftMin = (leftMin < 0) ? 0 : leftMin;// 和0作比较，防止截取框向左超出可视区域
                topMin = (topMin < 0) ? 0 : topMin;
                
                cutLeft = (cutLeft + cutWidth > leftMax) ? leftMax - cutWidth : cutLeft;
                cutTop = (cutTop + cutHeight > topMax) ? topMax - cutHeight : cutTop;
                
                cutLeft = (cutLeft < leftMin) ? leftMin : cutLeft;
                cutTop = (cutTop < topMin) ? topMin : cutTop;
            }
            
            cutDiv.css({'left':cutLeft,'top':cutTop});
    	}
        function _upHandler(e){
    		//移除所有事件
            var cutDiv = $this.moveBar;
    		$(document).unbind('mousemove',_moveHandler);
    		$(document).unbind('mouseup',_upHandler);
            var elementToDrag = e.data.moveBar;
    		if(elementToDrag[0].detachEvent){
    			elementToDrag.unbind('onlosecapture',_upHandler);
    			elementToDrag[0].releaseCapture();
    		}
            elementToDrag.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
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
            if(imgEle && parEle && _incaseHide(cutObj,imgEle,parEle,cutDiv)){
                resizeFrameFun(cutDiv);
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
            cutObj.H = parseInt(cutObj.W / $this.pro);
            changeH -= cutObj.H;
            cutObj.T = $this.startTop + changeH/2;
            moveBar = null;
            return cutObj;
        }
        function _resizeRight(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            var changeH = startHeight;
            cutObj.W = leftC + startWidth;
            cutObj.H = parseInt(cutObj.W / $this.pro);
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
            cutObj.W = parseInt(cutObj.H * $this.pro);
            changeW -= cutObj.W;
            cutObj.L = $this.startLeft + changeW/2;
            moveBar = null;
            return cutObj;
        }
        function _resizeBottom(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            var changeW = startWidth;
            cutObj.H = topC + startHeight;
            cutObj.W = parseInt(cutObj.H * $this.pro);
            changeW -= cutObj.W;
            cutObj.L = $this.startLeft + changeW/2;
            cutObj.T = $this.startTop;
            moveBar = null;
            return cutObj;
        }
        function _resizeBottom_right(leftC,topC,startWidth,startHeight,cutDiv){
             var cutObj = {},moveBar = cutDiv;
             cutObj.W = startWidth + leftC;
             cutObj.H = parseInt(cutObj.W / $this.pro);
             cutObj.L = $this.startLeft;
             cutObj.T = $this.startTop;
             return cutObj;
        }
        function _resizeBottom_left(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth - leftC;
            cutObj.H = parseInt(cutObj.W / $this.pro);
            cutObj.L = $this.startLeft + leftC;
            cutObj.T = $this.startTop;
            return cutObj;
        }
        function _resizeTop_right(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth + leftC;
            cutObj.H = parseInt(cutObj.W / $this.pro);
            var changeH = cutObj.H - startHeight;
            cutObj.L = $this.startLeft;
            cutObj.T = $this.startTop - changeH;
            return cutObj;
        }
        function _resizeTop_left(leftC,topC,startWidth,startHeight,cutDiv){
            var cutObj = {},moveBar = cutDiv;
            cutObj.W = startWidth - leftC;
            cutObj.H = parseInt(cutObj.W / $this.pro);
            var changeH = cutObj.H - startHeight;
            cutObj.L = $this.startLeft + leftC;
            cutObj.T = $this.startTop - changeH;
            return cutObj;
        }
        function _incaseHide(cutObj,imgEle,parEle,cutDiv){
            var borderWidth = cutDiv.outerWidth() - cutDiv.width();
            var imgLeft = parseInt(imgEle.css('left')),
                imgTop = parseInt(imgEle.css('top')),
                imgWidth = imgEle.width(),
                imgHeight = imgEle.height(),
                frameWidth = parEle.width(),
                frameHeight = parEle.height();
            var minLeft = (imgLeft < 0) ? 0 : imgLeft,
                minTop = (imgTop < 0) ? 0 : imgTop,
                maxLeft = (frameWidth > imgLeft + imgWidth + borderWidth ) ? imgLeft + imgWidth + borderWidth : frameWidth,
                maxTop = (frameHeight > imgTop + imgHeight + borderWidth) ? imgTop + imgHeight + borderWidth : frameHeight;
            if(cutObj.T < minTop){
                return false;
            }
            if(cutObj.L < minLeft){
                return false;
            }
            if(cutObj.W + borderWidth + cutObj.L > maxLeft || cutObj.W <= 10){
                return false;
            }
            if(cutObj.H + borderWidth + cutObj.T > maxTop || cutObj.H <= 10){
                return false;
            }
            $this.cutLeft = cutObj.L;
            $this.cutTop = cutObj.T;
            $this.cutWidth = cutObj.W;
            $this.cutHeight = cutObj.H;
            return true;
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
        }
        function resizeFrameFun(cutDiv){
            cutDiv.css({'left':$this.cutLeft,'top':$this.cutTop,'width':$this.cutWidth,'height':$this.cutHeight});
        }
    }
    /*
    *鼠标中轴滚动变化图片大小，如果图片中有截图框的话，调整截图框的坐标
    *参数格式  arg = {eventEle:[$('#preview img'),$('#cutDiv')],parEle:$('#preview')}； 
    *参数说明，第一个参数为一个数组，数组长度为二，第一个是图片，也就是缩放的元素，第二个为截图框，第二个参数为可视区域
    *********************/
    B.Scroll = function(arg){
        this.arg = arg;
        this.bindScroll = function(Ele,fn){
            Ele.unbind('mousewheel',fn);
            Ele.unbind('DOMMouseScroll',fn);
            Ele.bind('mousewheel',fn);
            Ele.bind('DOMMouseScroll',fn);
        }
        var $this = this;
        (function($this){
            var $$this = $this;
            var eles = $$this.arg.eventEle;
            var parEle = $$this.arg.parEle
            for(var i = 0,j = eles.length; i < j; i++){
                eles[i].mouseover(function(e){
                    $$this.moveBar = eles[1];
                    $$this.imgPro = eles[0].width() / eles[0].height();//图片原始比例
                    $$this.imgLeft = parseFloat(eles[0].css('left'));
                    $$this.imgTop = parseFloat(eles[0].css('top'));
                    $$this.img = eles[0];
                    if($$this.arg.parEle){
                        $$this.frameWidth = parEle.width();
                        $$this.frameHeight = parEle.height();
                    }
                    $$this.bindScroll($(this),scrollFun);
                });
            }
        })($this);
        //惰性函数，避免打开页面后，每次执行该函数都要有浏览器能力检测
        function scrollFun(e){
            'preventDefault' in e ? e.preventDefault() : e.returnValue = false;
            if(e.detail){
                $this.scrollFun = function(e){
                    resizeImage(-e.detail / 3,e);
                }
            }else{
                $this.scrollFun = function(e){
                    resizeImage(e.wheelDelta /120,e);
                }
            }
            $this.scrollFun(e);
        }
        //调整图片坐标以及图片大小，已使得图片以鼠标为中心点进行缩放
        function resizeImage(zoom,e){
            clearTimeout($this.timer);
            $this.timer = setTimeout(Resize,25);
            var min = false;
            if($this.moveBar){
                var border = $this.moveBar.outerWidth() - $this.moveBar.width(),
                    cutWidth = $this.moveBar.width(),
                    cutHeight = $this.moveBar.height();
            }
            function Resize(){
                var img = $this.img;
                var offset = B.getParentOffset(img.selector);
                zoom = (zoom>0) ? 1.2 : 0.8;
                var width = img.width(),height = 0;
                width = parseInt(width * zoom);
                height = parseInt(width / $this.imgPro);
                var widthYu = heightYu = 0;
                if(width < cutWidth + border){
                    width = cutWidth + border * 2;
                    height = parseInt((width - border * 2) / $this.imgPro) + border * 2;
                    widthYu = cutWidth + border - width;
                    min = true;
                }else if(height < cutHeight + border){
                    height = cutHeight + border * 2;
                    width = parseInt((height - border * 2) * $this.imgPro) + border * 2;
                    heightYu = cutHeight + border - height;
                    min = true;
                }
                if($this.imgLeft + width < cutWidth){
                    $this.imgLeft += cutWidth - $this.imgLeft - width;
                }
                if($this.imgTop + height < cutHeight){
                    $this.imgTop += cutHeight - $this.imgTop - height;
                }
                $this.imgWidth = width; $this.imgHeight = height;
                if(!min){
                    var left = e.clientX - offset.left,top = e.clientY - offset.top;
                    $this.imgLeft -= (parseInt(left * zoom) -left + widthYu/2);
                    $this.imgTop -= (parseInt(top * zoom) -top + heightYu/2);   
                }
                if($this.imgLeft > $this.cutLeft){
                    $this.imgLeft -= $this.imgLeft - $this.cutLeft;
                }
                if($this.imgTop > $this.cutTop){
                    $this.imgTop -= $this.imgTop - $this.cutTop;
                }
                img.css({'left':$this.imgLeft,'top':$this.imgTop,'width':$this.imgWidth,'height':$this.imgHeight});
                if($this.moveBar){
                    $this.cutLeft = $this.imgLeft + ($this.imgWidth - cutWidth) / 2;
                    $this.cutTop = $this.imgTop + ($this.imgHeight - cutHeight) / 2;
                    if($this.frameWidth * $this.frameHeight){
                        $this.cutLeft = $this.cutLeft < 0 ? 0 : $this.cutLeft + cutWidth + border > $this.frameWidth ? $this.frameWidth - cutWidth - border : $this.cutLeft;
                        $this.cutTop = $this.cutTop < 0 ? 0 : $this.cutTop + cutHeight + border > $this.frameHeight ? $this.frameHeight - cutHeight - border : $this.cutTop;
                    }
                    $this.moveBar.css({'left':$this.cutLeft,'top':$this.cutTop});
                }
            }
        }
    }
    /*****公有接口结束************/
})()