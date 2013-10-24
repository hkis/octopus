﻿$(document).ready(function(e){
    $(document).forbidSelect();
    var pdfReader1 = new Bing.PdfReader({
        uid:'BingGeGe',
        url:'loadImg.php',
        parent:$('body'),
        className:'pdf-main-body',
        thumbnails:true,//是否需要缩略图
        successFn:function(){
            console.log('pdf浏览器成功生成');
        },
        errorFn:function(){
            console.log('pdf浏览器生成失败');
        }
    });
})