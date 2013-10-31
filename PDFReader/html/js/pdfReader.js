$(document).ready(function(e){
    $('head').addScriptEle({src:'js/Template-pdfReader.js',comFun:function(){
        var Pdf = new Bing.Pdf({
            uid:'BingGeGe',
            allowTypes:'pdf',
            uploadUrl:'upload.php',
            listUrl:'list.php',
            loadImgUrl:'loadImg.php',
            parent:$('body'),
            className:'pdf-main-body'
        });
    }});
})