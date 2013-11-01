$(document).ready(function(e){
    $('head').addScriptEle({src:'js/Template-pdfReader.js',comFun:function(){
        var Pdf = new Bing.Pdf({
            uid:'BingGeGe',
            allowTypes:'pdf',
            uploadUrl:'upload.php',//上传动态文件路径
            listUrl:'list.php',//类表页读取路径
            loadImgUrl:'loadImg.php',//主页面图片读取路径
            parent:$('body'),
            className:'pdf-main-body'
        });
    }});
})