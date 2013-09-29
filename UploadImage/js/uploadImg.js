/**
*图片上传
*创建者 ： 赵亚兵
*创建日期 ： 2013.9.22
*修改人 ： XXX
*修改日期 ： XXXX.XX.XX
*参数 : imgTypes（允许的图片格式，空格链接）
*********************/
var that;
//document.domain = 'smop.staff.ifeng.com';
function ImageUpLoad(imgTypes,cutPro,imgMinWidth){
    this.imgData = '';
    this.imgWidth = 300;                       //图片宽度
    this.imgHeight = 200;                      //图片高度
    this.imgTypes = imgTypes || 'png jpg jpeg';//允许上传的图片格式
    this.type = '';                            //当前上传图片的图片格式
    this.imgFrame = '';                        //图片外层框架div
    this.frameWidth = 0;                       //图片外层框架div 的宽度
    this.frameHeight = 0;                      //图片外层框架div 的高度
    this.imgLeft = 0;                          //图片坐标left
    this.imgTop = 0;                           //图片坐标 top
    this.cutDiv = '';                          //截取div元素
    this.cutWidth = 100;                       //截取框宽度
    this.cutHeight = 100;                      //截取高度
    this.cutPro = cutPro || 1;                 //截取图片的宽高比例
    this.cutLeft = 0;                          //截取div的坐标left
    this.cutTop = 0;                           //截取div的坐标top
    this.borderWidth = 0;                      //截图框的border
    this.cutMinWidth = imgMinWidth || 50;      //截取框的最小宽度
    this.submitButton;                         //截图完成后的提交按钮
    this.img;                                  //头像图片
    this.imgPro;                               //原始头像宽高比例
    this.timer;                                //setTimeout对象
}
ImageUpLoad.prototype = {
    constructor : ImageUpLoad,
    //初始执行操作函数
    init:function(imgUrl){
        var $this = that = this;
        $this.type = imgUrl.substring(imgUrl.lastIndexOf(".")+1).toLowerCase();
        if($this.imgTypes.indexOf($this.type)>-1){
            return true;
        }else{
            return false;
        }
    },
    //图片截图控制  参数： imgFrameDiv  图片框架div的id  
    imageControl:function(imgFrameDiv,data){
        data = $.parseJSON(data);
        var imgFrame = $(imgFrameDiv),img,$this = that;
        if(data){
            if(data.result){
                imgFrame.html('<img src="'+data.path+'" width='+data.width+' height='+data.height+' />');
                img = imgFrame.find('img');
            }else{
                var str ='',errorCode = data.errcode;
                if(errorCode == 'E01'){
                    str = '图片格式不正确';
                }else if(errorCode == 'E02'){
                    str = '图片大小超过4M';
                }else if(errorCode == 'E03'){
                    str = '图片读取失败';
                }
                alert(str);
            }
        }
        $this.img = img;
        $this.imgFrame = imgFrame;
        $this.imgWidth = img.width();
        $this.imgHeight = img.height();
        $this.frameWidth = imgFrame.width();
        $this.frameHeight = imgFrame.height();
        $this._imgWidthHeight(imgFrame.width(),imgFrame.height());
        $this.imgPro = $this.imgWidth / $this.imgHeight;
        img.css({'position':'absolute','display':'block','width':$this.imgWidth,'height':$this.imgHeight,'left':$this.imgLeft,'top':$this.imgTop});
        $this.imgFrame.append('<div id="cutDiv" style="width:'+$this.cutWidth+'px; height:'+$this.cutHeight+'px; left:'+$this.cutLeft+'px; top:'+$this.cutTop+'px">'
            +'<div id="top"></div><div id="right"></div><div id="bottom"></div><div id="left"></div><div id="top_left"></div><div id="top_right"></div><div id="bottom_right"></div><div id="bottom_left"></div>'
        +'<div id="center_x"></div><div id="center_y"></div></div>');
        $this.cutDiv = $('#cutDiv');
        $this.submitButton = $('#submit');
        img.mouseover(function(e){
            $this.bindScroll($(this),$this.scrollFun);
        });
        $('#cutDiv').mouseover(function(e){
            $this.bindScroll($(this),$this.scrollFun);
        });
        $this.fadeIn();
        $this.borderWidth = ($this.cutDiv.outerWidth() - $this.cutDiv.width());
        $this.cutMinWidth -= $this.borderWidth;
        $this.cutMinHeight = $this.borderHeight * $this.cutPro;
        if($this.cutWidth < $this.cutMinWidth || $this.cutHeight < $this.cutMinHeight){
            alert('图片太小了，建议选取大小规格符合的图片');
        }
        $this.submitButton.click(function(){
            var border = $this.borderWidth;
            var data = 'imgWidth=' + $this.imgWidth + '&imgHeight=' + $this.imgHeight +
                '&top=' + ($this.cutTop - $this.imgTop) + '&left=' + ($this.cutLeft - $this.imgLeft) +
                '&width=' + ($this.cutWidth + border) + '&height=' + (border + $this.cutHeight);
            $this.submitFun({url:'http://localhost/web_os/uploadImage/ok.php',data:data});
        });
        $(document).bind('selectstart',$this.clearSelect);
    },
    submitFun : function(obj){
        $.ajax({
            type:'post',
            url:obj.url,
            data:obj.data,
            success:function(data){
                console.log(data);
            }
        })
    },
    // 显示图片
    fadeIn : function(){
        var $this = that;
        $this.submitButton.fadeIn(50);
        $this.imgFrame.fadeIn(50,function(){
            $this.drag($this.cutDiv);
        });
    },
    // 图片显示大小位置调整，已使得图片能够完全居中显示 参数： width：框架宽度  height：框架高度
    _imgWidthHeight : function(width,height){   
        var $this = that;
        var por1 = width/height,
            por2 = $this.imgWidth/$this.imgHeight;
        if($this.imgHeight > height || $this.imgWidth > width){
        if(por1 > por2){
            $this.imgHeight = height;
            $this.imgWidth = parseInt(height * por2);
        }else{
            $this.imgWidth = width;
            $this.imgHeight = parseInt(width / por2);
        }}
        var width1 = $this.imgWidth , height1 = $this.imgHeight;
        $this.imgLeft = (width - width1)/2;
        $this.imgTop = (height - height1)/2;
        var _proportion = width1/height1;
        if(_proportion > $this.cutPro){
            $this.cutWidth = parseInt($this.imgHeight * 0.8 * $this.cutPro);
            $this.cutHeight = parseInt($this.imgHeight * 0.8);
        }else{
            $this.cutWidth = parseInt($this.imgWidth * 0.8);
            $this.cutHeight = parseInt($this.imgWidth * 0.8 / $this.cutPro);
        }
        $this.cutLeft = (width - $this.cutWidth)/2;
        $this.cutTop = (height - $this.cutHeight)/2;
    },
    //元素移动功能函数  参数  elementToDrag：鼠标点击移动元素起效的元素  moveNode：移动元素
    drag:function(elementToDrag,moveNode){
		var $this = that;
		$this.cutDiv = moveNode || elementToDrag;//如果没有需要移动的父标签，则默认的选取当前鼠标点击标签为移动对象
        var cutDiv = $this.cutDiv;
        var deltaX = deltaY = 0;
        var resizeStr = 'top left bottom right top_left top_right bottom_left bottom_right';
        elementToDrag.bind('mousedown',function(e){
            deltaX = e.clientX - cutDiv[0].offsetLeft;//初始化
            deltaY = e.clientY - cutDiv[0].offsetTop;//初始化
            if(resizeStr.indexOf(e.target.id) > -1){
                $(document).bind('mousemove',{dX:deltaX,dY:deltaY,iD:e.target.id,Width:$this.cutWidth,Height:$this.cutHeight},$this._resizeHandler);
                $(document).bind('mouseup',$this._resizeFinish);
            }else{
                $(document).bind('mousemove',{dX:deltaX,dY:deltaY},$this._moveHandler);
                $(document).bind('mouseup',$this._upHandler);
    			if(cutDiv[0].attachEvent){
    				cutDiv[0].setCapture();
    				cutDiv.bind('onlosecapture',$this._upHandler);
    			}
            }
            cutDiv.css({'opacity': 0.25,'filter':'alpha(opacity=25)'});
        });
	},
    _moveHandler:function(e){
        var $this = that,cutDiv = $this.cutDiv;
        var cutLeft = e.clientX-e.data.dX,cutTop = e.clientY-e.data.dY,
            imgLeft = $this.imgLeft,imgTop = $this.imgTop,imgWidth = $this.imgWidth,imgHeight = $this.imgHeight,cutWidth = $this.cutWidth,cutHeight = $this.cutHeight;
        var frameWidth = $this.frameWidth,frameHeight = $this.frameHeight,border = $this.borderWidth;
        var leftMax = imgLeft + imgWidth, //裁剪框坐标left最大值
            topMax = imgTop + imgHeight,  //裁剪框坐标top最大值
            leftMin = imgLeft,            //裁剪框坐标left最小值
            topMin = imgTop;              //裁剪框坐标top最小值
            
        leftMax = (leftMax > frameWidth) ? frameWidth : leftMax;// 和父层div框作比较，防止截取框超出可视区域
        topMax = (topMax > frameHeight) ? frameHeight : topMax;
        
        leftMin = (leftMin < 0) ? 0 : leftMin;// 和0作比较，防止截取框向左超出可视区域
        topMin = (topMin < 0) ? 0 : topMin;
        
        cutLeft = (cutLeft + cutWidth + border > leftMax) ? leftMax - cutWidth - border : cutLeft;
        cutTop = (cutTop + cutHeight + border > topMax) ? topMax - cutHeight - border : cutTop;
        
        cutLeft = (cutLeft < leftMin) ? leftMin : cutLeft;
        cutTop = (cutTop < topMin) ? topMin : cutTop;
        
        cutDiv.css({'left':cutLeft,'top':cutTop});
        $this.cutLeft = cutLeft;
        $this.cutTop = cutTop;
	},
    _upHandler:function(e){
		//移除所有事件
        var $this = that,cutDiv = $this.cutDiv;
		$(document).unbind('mousemove',$this._moveHandler);
		$(document).unbind('mouseup',$this._upHandler);
		if(cutDiv[0].detachEvent){
			cutDiv.unbind('onlosecapture',$this._upHandler);
			cutDiv[0].releaseCapture();
		}
        cutDiv.css({'opacity': 0.3,'filter':'alpha(opacity=30)'});
	},
    //避免拖动过程中选中
    clearSelect: function(e) {
        document.selection && document.selection.empty && ( document.selection.empty(), 1) || window.getSelection && window.getSelection().removeAllRanges();
        return false;
    },
    //重新调整截取框
    _resizeHandler : function(e){
        var $this = that,
            cutObj,
            cutDiv = $this.cutDiv,
            D = e.data,
            tarId = D.iD,
            cutLeftNow = e.clientX - D.dX,
            cutTopNow = e.clientY - D.dY;
            startWidth = D.Width;
            startHeight = D.Height;
        switch (tarId){
            case 'left':
                cutObj = $this._resizeLeft(cutLeftNow,cutTopNow,startWidth,startHeight);
                break;
            case 'right':
                cutObj = $this._resizeRight(cutLeftNow,cutTopNow,startWidth,startHeight);
                break;
            case 'top':
                cutObj = $this._resizeTop(cutLeftNow,cutTopNow,startWidth,startHeight);
                break;
            case 'bottom':
                cutObj = $this._resizeBottom(cutLeftNow,cutTopNow,startWidth,startHeight);
                break;
        }
        if($this._incaseHide(cutObj)){
            $this.resizeFrameFun();
        }
    },
    _resizeLeft : function(cutLeftNow,cutTopNow,startWidth,startHeight){
        var $this = that,cutObj = {};
        var leftStart = $this.cutLeft;
        cutObj.L = cutLeftNow;
        var changeW = leftStart - cutObj.L,changeH = $this.cutHeight;
        cutObj.W = $this.cutWidth + changeW;
        cutObj.H = parseInt(cutObj.W / $this.cutPro);
        changeH -= cutObj.H;
        cutObj.T = $this.cutTop + changeH/2;
        return cutObj;
    },
    _resizeRight : function(cutLeftNow,cutTopNow,startWidth,startHeight){
        var $this = that,cutObj = {};
        var leftStart = $this.cutLeft;
        var changeW = cutLeftNow - leftStart,changeH = $this.cutHeight;
        cutObj.W = changeW + startWidth;
        cutObj.H = parseInt(cutObj.W / $this.cutPro);
        changeH -= cutObj.H;
        cutObj.T = $this.cutTop + changeH/2;
        cutObj.L = $this.cutLeft;
        return cutObj;
    },
    _resizeTop : function(cutLeftNow,cutTopNow,startWidth,startHeight){
        var $this = that,cutObj = {};
        var topStart = $this.cutTop;
        cutObj.T = cutTopNow;
        var changeH = topStart - cutObj.T,changeW = $this.cutWidth;
        cutObj.H = $this.cutHeight + changeH;
        cutObj.W = parseInt(cutObj.H * $this.cutPro);
        changeW -= cutObj.W;
        cutObj.L = $this.cutLeft + changeW/2;
        return cutObj;
    },
    _resizeBottom : function(cutLeftNow,cutTopNow,startWidth,startHeight){
        var $this = that,cutObj = {};
        var topStart = $this.cutTop;
        var changeH = cutTopNow - topStart,changeW = $this.cutWidth;
        cutObj.H = changeH + startHeight;
        cutObj.W = parseInt(cutObj.H * $this.cutPro);
        changeW -= cutObj.W;
        cutObj.L = $this.cutLeft + changeW/2;
        cutObj.T = $this.cutTop;
        return cutObj;
    },
    _incaseHide : function(cutObj){
        var $this = that,borderWidth = $this.borderWidth;
        var imgLeft = $this.imgLeft,
            imgTop = $this.imgTop,
            imgWidth = $this.imgWidth,
            imgHeight = $this.imgHeight,
            frameWidth = $this.frameWidth,
            frameHeight = $this.frameHeight;
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
        if(cutObj.W + borderWidth + cutObj.L > maxLeft || cutObj.W < $this.cutMinWidth){
            return false;
        }
        if(cutObj.H + borderWidth + cutObj.T > maxTop || cutObj.H < $this.cutMinWidth / $this.cutPro){
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
        var $this = that,cutDiv = $this.cutDiv;
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
        $this.cutDiv.css({'left':$this.cutLeft,'top':$this.cutTop,'width':$this.cutWidth,'height':$this.cutHeight});
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
        var $this =that;
        if(e.detail){
            $this.scrollFun = function(e){
                $this.resizeImage(-e.detail / 3,$this.img,e);
            }
        }else{
            $this.scrollFun = function(e){
                $this.resizeImage(e.wheelDelta /120,$this.img,e);
            }
        }
        $this.scrollFun(e);
    },
    //调整图片坐标以及图片大小，已使得图片以鼠标为中心点进行缩放
    resizeImage : function(zoom,Ele,e){
        var $this = that;
        clearTimeout($this.timer);
        $this.timer = setTimeout(Resize,25);
        var min = false;
        var border = $this.borderWidth,
            cutWidth = $this.cutWidth,
            cutHeight = $this.cutHeight;
        function Resize(){
            var offset = $this.getParentOffset($this.img[0]);
            zoom = (zoom>0) ? 1.2 : 0.8;
            var width = $this.imgWidth,height = 0;
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
                $this.img.css({'left':$this.imgLeft,'top':$this.imgTop,'width':$this.imgWidth,'height':$this.imgHeight});
            }else{
                $this.img.css({'width':$this.imgWidth,'height':$this.imgHeight});
            }
            
            $this.cutLeft = $this.imgLeft + ($this.imgWidth - cutWidth) /2;
            $this.cutTop = $this.imgTop + ($this.imgHeight - cutHeight) / 2;
            
            $this.cutLeft = $this.cutLeft < 0 ? 0 : $this.cutLeft + cutWidth + border > $this.frameWidth ? $this.frameWidth - cutWidth - border : $this.cutLeft;
            $this.cutTop = $this.cutTop < 0 ? 0 : $this.cutTop + cutHeight + border > $this.frameHeight ? $this.frameHeight - cutHeight - border : $this.cutTop;
            $this.cutDiv.css({'left':$this.cutLeft,'top':$this.cutTop});
        }
    },
    getParentOffset : function(obj){
       var parObj = obj;    
       var left = obj.offsetLeft,top = obj.offsetTop;
       while(parObj = parObj.offsetParent){
           left += parObj.offsetLeft; 
           top += parObj.offsetTop;
       }       
       return {left:left,top:top};
    }
}