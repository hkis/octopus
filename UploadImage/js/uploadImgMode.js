/**
*图片上传
*创建者 ： 赵亚兵
*创建日期 ： 2013.9.23
*修改人 ： XXX
*修改日期 ： XXXX.XX.XX
*/
var UpImg = {};
UpImg.init = function(){
    
}

/*
*图片格式检测
*参数格式 arg = {{url:'',allowTypes:''}  url：上传的图片路径 allowTypes：允许上传的图片格式，以空格连接
*当allowTypes为空时，则允许上传所有格式的文件
*输出 检测通过输出true，失败返回false 
*****/
UpImg.checkType = function(arg){
    arg = $.extend({url:'',allowTypes:''},arg);
    if(!arg.url){
        throw new Error('参数传输出错，图片上传路径属性不能为空');
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