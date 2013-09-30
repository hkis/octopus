/**
*图片上传
*创建者 ： 赵亚兵
*创建日期 ： 2013.9.23
*修改人 ： XXX
*修改日期 ： XXXX.XX.XX
*/
var imgData,zoomOr = false;
var UpImg = {
    allowTypes : 'jpg jpeg png',
    cutPro : 0.9,
    siteUrl : '',
    borderWidth : 0
};
UpImg.init = function(){
    $(document).ready(function(){
        //首先屏蔽选中
        $(document).bind('selectstart',function(){
             document.selection && document.selection.empty && ( document.selection.empty(), 1) || window.getSelection && window.getSelection().removeAllRanges();
             return false;
        });
        $('#imgFile').change(function(e){
            var url = $('#imgFile')[0].value;
            if(url){
                if(UpImg.checkType({url:url,allowTypes:UpImg.allowTypes})){
                    $('#img_form').submit();
                    $('#loading').fadeIn(1);
                }else{
                    alert('允许上传的图片格式为jpg，jpeg，png');
                }
            }
        });
    })
}

/*
*图片格式检测
*参数格式 arg = {{url:'',allowTypes:''}  url：上传的图片路径 allowTypes：允许上传的图片格式，以空格连接
*当allowTypes为空时，则允许上传所有格式的文件
*输出 检测通过输出true，失败返回false 
*例：UpImg.checkType({url:'../img/xsxsa.jpg',allowTypes:'jpg jpeg png'})
****/
UpImg.checkType = function(arg){
    arg = $.extend({url:'',allowTypes:''},arg);
    if(!arg.url){
        throw new Error('传入参数出错，图片上传路径属性不能为空');
        return false;
    }
    if(arg.allowTypes){
        var url = arg.url,
            imgType = url.substring(url.lastIndexOf(".")+1).toLowerCase();
        return arg.allowTypes.indexOf(imgType) > -1 ? true : false;
    }else{
        return true;
    }
}

/*
*将图片添加入标签中
*参数格式 {parEle:$('body'),fn:''}  parEle：图片添加进去的父标签 默认为body标签  fn：添加进去后的操作
*****/
UpImg.append = function(arg){
    arg = $.extend({parEle:$('body'),fn:''},arg);
    var data = $.parseJSON(imgData);
    if(data){
        if(data.result){
            var width = data.width,height = data.height,parEle = arg.parEle;
            parEle.html('<img src="'+data.path+'" width="'+width+'" height="'+height+'" ondragstart="return false" />');
            if(arg.fn){
                arg.fn({width:width,height:height,parWidth:parEle.width(),parHeight:parEle.height()});
                width = height = parEle = null;
            }
        }else{
            var str ='',errorCode = data.errcode;
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

/*
*元素大小调整，使其在可视区域内完全显示
*参数格式 arg={width:100,height:200,parWidth:50,parHeight:100}
***/
UpImg.imgSizing = function(arg){
    this.arg = arg;
    this.imgSpecification = this.init();// 图片规格，包括大小，坐标
}
UpImg.imgSizing.prototype.init = function(){
    var arg = this.arg,
        imgWidth = arg.width,//元素宽度
        imgHeight = arg.height,//元素高度
        maxWidth = arg.parWidth,//可视区域宽度
        maxHeight = arg.parHeight;//可视区域高度

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
        zoomOr = true;
    }
    var imgLeft = (maxWidth - imgWidth)/2,
        imgTop = (maxHeight - imgHeight)/2;
    return {left:imgLeft,top:imgTop,width:imgWidth,height:imgHeight};
}
/*
*截取框实例
*参数格式  arg={cutPro:0.9,width:200,height:300}
* cutPro ： 截取框宽高比例
* width ：所要截取的图片宽度
* height：所要截取的图片高度
****/
UpImg.cutImg = function(arg){
    this.arg = arg;
    this.cutPro = arg.cutPro;
    this.cutSpecification = this.init();// 截取框规格，包括大小，坐标
}
UpImg.cutImg.prototype.init = function(){
    var arg = this.arg,
        imgWidth = arg.width,//元素宽度
        imgHeight = arg.height,//元素高度
        cutPro = this.cutPro,//截取框比例
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
    this.addCutDiv({parEle:arg.parEle,left:cutLeft,top:cutTop,width:cutWidth,height:cutHeight});
}
//将截图框添加进去
UpImg.cutImg.prototype.addCutDiv = function(arg){
    var cutS = arg;
    arg = arg || {};
    if(arg.parEle){
        arg.parEle.append(
            '<div id="cutDiv" style="width:'+cutS.width+'px; height:'+cutS.height+'px; left:'+cutS.left+'px; top:'+cutS.top+'px">'
            +'<div id="top"></div><div id="right"></div><div id="bottom"></div><div id="left"></div><div id="top_left"></div><div id="top_right"></div><div id="bottom_right"></div><div id="bottom_left"></div>'
            +'<div id="center_x"></div><div id="center_y"></div></div>'
        );
        arg.parEle.fadeIn(50);
        var cutDiv = $('#cutDiv'),borderWidth = cutDiv.outerWidth() - cutDiv.width();
        if(borderWidth > 0){
            UpImg.borderWidth = borderWidth;
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
UpImg.cutImg.prototype.submitCutData = function(arg){
    var arg = arg || {};
    if(!arg.parEle || !arg.cutDiv || !arg.url){
        throw new Error('传入参数出错，请指定截取框所要元素以及提交路径');
        return false;
    }
    var parEle = arg.parEle,
        cutDiv = arg.cutDiv;

    var data = 'imgWidth=' + parEle.width() + '&imgHeight=' + parEle.height() +
        '&top=' + parseInt(parseInt(cutDiv.css('top')) - parseInt(parEle.css('top'))) + '&left=' + parseInt(parseInt(cutDiv.css('left')) - parseInt(parEle.css('left'))) +
        '&width=' + cutDiv.outerWidth() + '&height=' + cutDiv.outerHeight() + '&action=cut&uid=binggege&isZoom='+zoomOr;
    parEle = cutDiv = null;
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
*参数格式 arg={pro:0.9,moveBar:$('#cutDiv'),moveContent:'',imgEle:$('#preview img'),parEle:$('#preview'),moveBarIds:'top left bottom right top_left top_right bottom_left bottom_right'}
*其中pro：比例，moveBar是鼠标按下后能实现拖动的标签，moveContent是一定的标签，如果为空则与moveBar相同
*imgEle，parEle必须同时存在或者同时不存在，这里是为截图限制区域添加的属性，如果只是为了拖动，只需要前两个或者第一个属性
*moveBarIds:调整大小的id总和
*具体实现参看功能实现实例
****/
UpImg.drag = function (arg){
    this.arg = arg;
    this.img = arg.imgEle;
    this.init();//获取截图框的坐标
}

UpImg.drag.prototype = {
    constructor : UpImg.drag,
    init : function(){
        var $this = this;
        that = $this;
        if(!this.arg.moveBar){
            throw new Error('传入参数出错，必须最少指定moveBar参数');
            return false;
        }
        var elementToDrag = this.arg.moveBar,
            moveNode = this.arg.moveContent || elementToDrag;//如果没有需要移动的父标签，则默认的选取当前鼠标点击标签为移动对象
        var deltaX = deltaY = 0;
        var resizeStr = $this.arg.moveBarIds;
        $this.moveBar = moveNode;
        elementToDrag.bind('mousedown',function(e){
            
            $this.startLeft = parseInt(moveNode.css('left'));
            $this.startTop = parseInt(moveNode.css('top'));
            $this.startWidth = moveNode.width();
            $this.startHeight = moveNode.height();
            $this.clientX = e.clientX;
            $this.clientY = e.clientY;
            
            deltaX = e.clientX - elementToDrag[0].offsetLeft;//初始化
            deltaY = e.clientY - elementToDrag[0].offsetTop;//初始化
            var offset = $this.img.getParentOffset();
            if(resizeStr.indexOf(e.target.id) > -1){
                $(document).bind('mousemove',{iD:e.target.id,imgEle:$this.arg.imgEle,parEle:$this.arg.parEle},$this._resizeHandler);
                $(document).bind('mouseup',$this._resizeFinish);
            }else{
                $(document).bind('mousemove',{dX:deltaX,dY:deltaY,moveNode:moveNode,imgEle:$this.arg.imgEle,parEle:$this.arg.parEle},$this._moveHandler);
                $(document).bind('mouseup',{moveBar:elementToDrag},$this._upHandler);
    			if(elementToDrag[0].attachEvent){
    				elementToDrag[0].setCapture();
    				elementToDrag.bind('onlosecapture',{moveBar:elementToDrag},$this._upHandler);
    			}
            }
            elementToDrag.css({'opacity': 0.25,'filter':'alpha(opacity=25)'});
        });
    },
    _moveHandler:function(e){
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
	},
    _upHandler:function(e){
		//移除所有事件
        var $this = UpImg.drag,cutDiv = $this.cutDiv;
		$(document).unbind('mousemove',$this._moveHandler);
		$(document).unbind('mouseup',$this._upHandler);
        var elementToDrag = e.data.moveBar;
		if(elementToDrag[0].detachEvent){
			elementToDrag.unbind('onlosecapture',$this._upHandler);
			elementToDrag[0].releaseCapture();
		}
        elementToDrag.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
	},
    //重新调整截取框
    _resizeHandler : function(e){
        var $this = that,
            cutObj,
            D = e.data,
            tarId = D.iD,
            leftC = e.clientX - $this.clientX,
            topC = e.clientY - $this.clientY,
            startWidth = $this.startWidth,
            startHeight = $this.startHeight,
            imgEle = D.imgEle || '', 
            parEle = D.parEle || '',
            borderWidth = $this.moveBar.outerWidth() - $this.moveBar.width();
        switch (tarId){
            case 'left':
                cutObj = $this._resizeLeft(leftC,topC,startWidth,startHeight);
                break;
            case 'right':
                cutObj = $this._resizeRight(leftC,topC,startWidth,startHeight);
                break;
            case 'top':
                cutObj = $this._resizeTop(leftC,topC,startWidth,startHeight);
                break;
            case 'bottom':
                cutObj = $this._resizeBottom(leftC,topC,startWidth,startHeight);
                break;
            case 'bottom_right':
                cutObj = $this._resizeBottom_right(leftC,topC,startWidth,startHeight);
                break;
            case 'bottom_left':
                cutObj = $this._resizeBottom_left(leftC,topC,startWidth,startHeight);
                break;
            case 'top_right':
                cutObj = $this._resizeTop_right(leftC,topC,startWidth,startHeight);
                break;
            case 'top_left':
                cutObj = $this._resizeTop_left(leftC,topC,startWidth,startHeight);
                break;
        }
        if(imgEle && parEle && $this._incaseHide(cutObj,imgEle,parEle)){
            $this.resizeFrameFun();
        }
        if(!imgEle && !parEle){
            $this.moveBar.css({'left':cutObj.L,'top':cutObj.T,'width':cutObj.W - borderWidth,'height':cutObj.H - borderWidth});
        }
        imgEle = parEle = null;
    },
    _resizeLeft : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        cutObj.L = $this.startLeft + leftC;
        var changeH = startHeight;
        cutObj.W = startWidth - leftC;
        cutObj.H = parseInt(cutObj.W / $this.arg.pro);
        changeH -= cutObj.H;
        cutObj.T = $this.startTop + changeH/2;
        moveBar = null;
        return cutObj;
    },
    _resizeRight : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        var changeH = startHeight;
        cutObj.W = leftC + startWidth;
        cutObj.H = parseInt(cutObj.W / $this.arg.pro);
        changeH -= cutObj.H;
        cutObj.T = $this.startTop + changeH/2;
        cutObj.L = $this.startLeft;
        moveBar = null;
        return cutObj;
    },
    _resizeTop : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        cutObj.T = $this.startTop + topC;
        var changeW = startWidth;
        cutObj.H = startHeight - topC;
        cutObj.W = parseInt(cutObj.H * $this.arg.pro);
        changeW -= cutObj.W;
        cutObj.L = $this.startLeft + changeW/2;
        moveBar = null;
        return cutObj;
    },
    _resizeBottom : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        var changeW = startWidth;
        cutObj.H = topC + startHeight;
        cutObj.W = parseInt(cutObj.H * $this.arg.pro);
        changeW -= cutObj.W;
        cutObj.L = $this.startLeft + changeW/2;
        cutObj.T = $this.startTop;
        moveBar = null;
        return cutObj;
    },
    _resizeBottom_right : function(leftC,topC,startWidth,startHeight){
         var $this = that,cutObj = {},moveBar = $this.moveBar;
         cutObj.W = startWidth + leftC;
         cutObj.H = parseInt(cutObj.W / $this.arg.pro);
         cutObj.L = $this.startLeft;
         cutObj.T = $this.startTop;
         return cutObj;
    },
    _resizeBottom_left : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        cutObj.W = startWidth - leftC;
        cutObj.H = parseInt(cutObj.W / $this.arg.pro);
        cutObj.L = $this.startLeft + leftC;
        cutObj.T = $this.startTop;
        return cutObj;
    },
    _resizeTop_right : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        cutObj.W = startWidth + leftC;
        cutObj.H = parseInt(cutObj.W / $this.arg.pro);
        var changeH = cutObj.H - startHeight;
        cutObj.L = $this.startLeft;
        cutObj.T = $this.startTop - changeH;
        return cutObj;
    },
    _resizeTop_left : function(leftC,topC,startWidth,startHeight){
        var $this = that,cutObj = {},moveBar = $this.moveBar;
        cutObj.W = startWidth - leftC;
        cutObj.H = parseInt(cutObj.W / $this.arg.pro);
        var changeH = cutObj.H - startHeight;
        cutObj.L = $this.startLeft + leftC;
        cutObj.T = $this.startTop - changeH;
        return cutObj;
    },
    _incaseHide : function(cutObj,imgEle,parEle){
        var $this = that,borderWidth = $this.moveBar.outerWidth() - $this.moveBar.width();
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
        if(cutObj.W + borderWidth + cutObj.L > maxLeft || cutObj.W <= 50){
            return false;
        }
        if(cutObj.H + borderWidth + cutObj.T > maxTop || cutObj.H <= 50){
            return false;
        }
        $this.cutLeft = cutObj.L;
        $this.cutTop = cutObj.T;
        $this.cutWidth = cutObj.W;
        $this.cutHeight = cutObj.H;
        return true;
    },
    _resizeFinish : function(){
        //移除所有事件
        var $this = that,cutDiv = $this.moveBar;
		$(document).unbind('mousemove',$this._resizeHandler);
		$(document).unbind('mouseup',$this._resizeFinish);
		if(cutDiv[0].detachEvent){
			cutDiv.unbind('onlosecapture',$this._resizeFinish);
			cutDiv[0].releaseCapture();
		}
        cutDiv.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
    },
    resizeFrameFun : function(){
        var $this = that;
        $this.moveBar.css({'left':$this.cutLeft,'top':$this.cutTop,'width':$this.cutWidth,'height':$this.cutHeight});
    }
}

/*
*鼠标中轴滚动变化图片大小，如果图片中有截图框的话，调整截图框的坐标
*参数格式  arg = {eventEle:[$('#preview img'),$('#cutDiv')],parEle:$('#preview')}； 
*参数说明，第一个参数为一个数组，数组长度为二，第一个是图片，也就是缩放的元素，第二个为截图框，第二个参数为可视区域
*********************/
UpImg.scroll = function(arg){
    this.arg = arg;
    this.init();//初始化
}

UpImg.scroll.prototype = {
    constructor : UpImg.scroll,
    init : function(){
        $$this = this;
        var eles = this.arg.eventEle;
        $$this.moveBar = eles[1];
        $$this.imgPro = eles[0].width() / eles[0].height();//图片原始比例
        $$this.imgLeft = parseFloat(eles[0].css('left'));
        $$this.imgTop = parseFloat(eles[0].css('top'));
        if($$this.arg.parEle){
            $$this.frameWidth = $$this.arg.parEle.width();
            $$this.frameHeight = $$this.arg.parEle.height();
        }
        for(var i = 0,j = eles.length; i < j; i++){
            eles[i].mouseover(function(e){
                $$this.bindScroll($(this),$$this.scrollFun);
            });
        }
    },
    bindScroll : function(Ele,fn){
        Ele.unbind('mousewheel',fn);
        Ele.unbind('DOMMouseScroll',fn);
        Ele.bind('mousewheel',fn);
        Ele.bind('DOMMouseScroll',fn);
    },
    //惰性函数，避免打开页面后，每次执行该函数都要有浏览器能力检测
    scrollFun : function(e){
        'preventDefault' in e ? e.preventDefault() : e.returnValue = false;
        var $this =$$this;
        if(e.detail){
            $this.scrollFun = function(e){
                $this.resizeImage(-e.detail / 3,e);
            }
        }else{
            $this.scrollFun = function(e){
                $this.resizeImage(e.wheelDelta /120,e);
            }
        }
        $this.scrollFun(e);
    },
    //调整图片坐标以及图片大小，已使得图片以鼠标为中心点进行缩放
    resizeImage : function(zoom,e){
        var $this = $$this;
        clearTimeout($this.timer);
        $this.timer = setTimeout(Resize,25);
        var min = false;
        if($this.moveBar){
            var border = $this.moveBar.outerWidth() - $this.moveBar.width(),
                cutWidth = $this.moveBar.width(),
                cutHeight = $this.moveBar.height();
        }
        function Resize(){
            var img = $this.arg.eventEle[0];
            var offset = $(img).getParentOffset();
            zoom = (zoom>0) ? 1.2 : 0.8;
            var width = img.width(),height = 0;
            width = parseInt(width * zoom);
            height = parseInt(width / $this.imgPro);
            if(width < cutWidth + border){
                width = cutWidth + border * 2;
                height = parseInt((width - border * 2) / $this.imgPro) + border * 2;
                min = true;
            }else if(height < cutHeight + border){
                height = cutHeight + border * 2;
                width = parseInt((height - border * 2) * $this.imgPro) + border * 2;
                min = true;
            }
            $this.imgWidth = width; $this.imgHeight = height;
            if(!min){
                var left = e.clientX - offset.left,top = e.clientY - offset.top;
                $this.imgLeft -= (parseInt(left * zoom) -left);
                $this.imgTop -= (parseInt(top * zoom) -top);
                img.css({'left':$this.imgLeft,'top':$this.imgTop,'width':$this.imgWidth,'height':$this.imgHeight});
            }else{
                img.css({'width':$this.imgWidth,'height':$this.imgHeight});
            }
            if($this.moveBar){
                $this.cutLeft = $this.imgLeft + ($this.imgWidth - cutWidth) / 2;
                $this.cutTop = $this.imgTop + ($this.imgHeight - cutHeight) / 2;
                if($$this.frameWidth * $$this.frameHeight){
                    $this.cutLeft = $this.cutLeft < 0 ? 0 : $this.cutLeft + cutWidth + border > $this.frameWidth ? $this.frameWidth - cutWidth - border : $this.cutLeft;
                    $this.cutTop = $this.cutTop < 0 ? 0 : $this.cutTop + cutHeight + border > $this.frameHeight ? $this.frameHeight - cutHeight - border : $this.cutTop;
                }
                $this.moveBar.css({'left':$this.cutLeft,'top':$this.cutTop});
            }
        }
    }
}
//扩展避免选中的接口
$.fn.extend({
    //获取当前标签相对于浏览器框的左右坐标
    getParentOffset : function(){
       var parObj = $(this)[0];    
       var left = parObj.offsetLeft,top = parObj.offsetTop;
       while(parObj = parObj.offsetParent){
           left += parObj.offsetLeft; 
           top += parObj.offsetTop;
       }       
       return {left:left,top:top};
    }
});