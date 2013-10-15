var Bing = Bing || {};

(function(){
    Bing.demo = function(){};
    Bing.demo.prototype = {
        isNeedFile : function(arg){//文件格式检测
            arg = $.extend({file:'',needFiles:''},arg);
            if(arg.needFiles){
                var file = arg.file,fileType = file.substring(file.lastIndexOf(".")+1).toLowerCase();
                return arg.needFiles.indexOf(fileType) > -1 ? true : false;
            }
            return true;
        },
        isHave : function(arg){// 检查字符串str是否包含于parStr
            arg = $.extend({str:'',parStr:''},arg);
            if(arg.parStr){
                return arg.parStr.indexOf(arg.str) > -1;
            }
            return true;
        },
        fitSpecification : function(arg){
            arg = $.extend({childWidth:100,childHeight:100,screenWidth:100,screenHeight:100},arg);
            var imgWidth = arg.childWidth,//元素宽度
                imgHeight = arg.childHeight,//元素高度
                maxWidth = arg.screenWidth,//可视区域宽度
                maxHeight = arg.screenHeight;//可视区域高度
            if(!maxWidth * maxHeight){
                throw new Error('可视区域应该制定宽度和高度');
                return false;
            }
            var por1 = maxWidth / maxHeight,
                por2 = imgWidth / imgHeight;
            if(imgHeight > maxHeight || imgWidth > maxWidth){
                if(por1 > por2){
                    imgHeight = maxHeight;
                    imgWidth = maxHeight * por2;
                }else{
                    imgWidth = maxWidth;
                    imgHeight = maxWidth / por2;
                }
            }
            var imgLeft = (maxWidth - imgWidth)/2,
                imgTop = (maxHeight - imgHeight)/2;
            try{
                return {left:imgLeft,top:imgTop,width:imgWidth,height:imgHeight};
            }catch(e){}finally{
                imgWidth = imgHeight = maxWidth = maxHeight = imgLeft = imgTop = null;
            }
        },
        addSmallDiv : function(arg){
            arg = $.extend({zoom:0.9,cutPro:0.9,width:200,height:300,left:0,top:0},arg);
            var imgWidth = arg.width,//元素宽度
                imgHeight = arg.height,//元素高度
                imgLeft = arg.left,//元素坐标left
                imgTop = arg.top,//元素坐标top
                cutPro = arg.cutPro,//截取框比例
                zoom = arg.zoom,//截图框初始缩放比例
                cutWidth = cutHeight = cutLeft = cutTop = 0;//截取框宽度和高度以及坐标初始化
            arg = null;
            if(imgWidth / imgHeight > cutPro){
                cutWidth = imgHeight * zoom * cutPro;
                cutHeight = imgHeight * zoom;
            }else{
                cutWidth = imgWidth * zoom;
                cutHeight = imgWidth * zoom / cutPro;
            }
            cutLeft = (imgWidth - cutWidth)/2 + imgLeft;
            cutTop = (imgHeight - cutHeight)/2 + imgTop;
            return {left:cutLeft,top:cutTop,width:cutWidth,height:cutHeight};
        },
        ajax : function(arg){
            arg = $.extend({type:'post',url:'',data:'',success:function(){alert('Submit Success')},error:function(){alert('Submit Failer')}},arg)
            if(!arg.url){
                throw new Error('请指定ajax提交路径');
                return false;
            }
            $.ajax(arg);
        },
        incaseOut : function(arg){
            arg = $.extend({imgLeft:0,imgTop:0,imgWidth:100,imgHeight:100,cutWidth:80,cutHeight:80,cutLeft:0,cutTop:0,frameWidth:100,frameHeight:100},arg);
            var leftMin = arg.imgLeft,            //裁剪框坐标left最小值
                topMin = arg.imgTop,              //裁剪框坐标top最小值
                leftMax = leftMin + arg.imgWidth, //裁剪框坐标left最大值
                topMax = topMin + arg.imgHeight,  //裁剪框坐标top最大值
                cutWidth = arg.cutWidth,
                cutHeight = arg.cutHeight,
                frameWidth = arg.frameWidth,
                frameHeight = arg.frameHeight,
                cutLeft = arg.cutLeft,
                cutTop = arg.cutTop;
      
            leftMax = (leftMax > frameWidth) ? frameWidth : leftMax;// 和父层div框作比较，防止截取框超出可视区域
            topMax = (topMax > frameHeight) ? frameHeight : topMax;
            
            leftMin = (leftMin < 0) ? 0 : leftMin;// 和0作比较，防止截取框向左超出可视区域
            topMin = (topMin < 0) ? 0 : topMin;
            
            cutLeft = (cutLeft + cutWidth > leftMax) ? leftMax - cutWidth : cutLeft;
            cutTop = (cutTop + cutHeight > topMax) ? topMax - cutHeight : cutTop;
            
            cutLeft = (cutLeft < leftMin) ? leftMin : cutLeft;
            cutTop = (cutTop < topMin) ? topMin : cutTop;
            return {'left':cutLeft,'top':cutTop};
        },
        incaseHide : function(arg){
            arg = $.extend({imgLeft:0,imgTop:0,imgWidth:100,imgHeight:100,frameWidth:100,frameHeight:100,border:0,cutObj:{}},arg);
            var minLeft = (arg.imgLeft < 0) ? 0 : arg.imgLeft,
                minTop = (arg.imgTop < 0) ? 0 : arg.imgTop,
                maxLeft = (arg.frameWidth > arg.imgLeft + arg.imgWidth + arg.border) ? arg.imgLeft + arg.imgWidth  : arg.frameWidth,
                maxTop = (arg.frameHeight > arg.imgTop + arg.imgHeight + arg.border) ? arg.imgTop + arg.imgHeight : arg.frameHeight,
                cutObj = arg.cutObj;
            if(cutObj.T < minTop || cutObj.L < minLeft || cutObj.W + arg.border + cutObj.L > maxLeft || cutObj.W <= 10 || cutObj.H + arg.border + cutObj.T > maxTop || cutObj.H <= 10){
                return false;
            }
            return cutObj;
        },
        resizeImg : function(arg){
            arg = $.extend({cutWidth:80,cutHeight:80,border:0,imgOffset:{},mouseE:'',zoom:0.8,width:100,height:100,imgPro:1},arg);
            var widthYu = heightYu = 0,min = false,
                cutWidth = arg.cutWidth,
                cutHeight = arg.cutHeight,
                imgLeft = arg.imgLeft,
                imgTop = arg.imgTop,
                border = arg.border,
                imgOffset = arg.imgOffset,
                mouseE = arg.mouseE,
                zoom = arg.zoom,
                width = arg.width,
                height = arg.height,
                imgPro = arg.imgPro;
            if(width < cutWidth + border){
                width = cutWidth + border;
                height = (width - border) / imgPro + border;
                widthYu = cutWidth + border - width;
                min = true;
            }
            if(height < cutHeight + border){
                height = cutHeight + border;
                width = (height - border) * imgPro + border;
                heightYu = cutHeight + border - height;
                min = true;
            }
            if(imgLeft + width < cutWidth){
                imgLeft += cutWidth - imgLeft - width;
            }
            if(imgTop + height < cutHeight){
                imgTop += cutHeight - imgTop - height;
            }
            if(!min){
                var left = mouseE.clientX - imgOffset.left,top = mouseE.clientY - imgOffset.top;
                imgLeft -= (left * zoom -left + widthYu/2);
                imgTop -= (top * zoom -top + heightYu/2);
            }
            if(imgLeft > cutLeft){
                imgLeft -= imgLeft - cutLeft;
            }
            if(imgTop > cutTop){
                imgTop -= imgTop - cutTop;
            }
            return {left:imgLeft,top:imgTop,width:width,height:height};
        }
    }
})();
//扩展避免选中的接口
$.fn.extend({
    //禁止选中
    forbidSelect: function(){
        $(this).bind('selectstart',function(){
             document.selection && document.selection.empty && ( document.selection.empty(), 1) || window.getSelection && window.getSelection().removeAllRanges();
             return false;
        });
    },
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