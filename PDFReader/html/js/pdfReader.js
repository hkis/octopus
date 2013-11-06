$(document).ready(function(e){
    $('head').addScriptEle({src:'js/Template-pdfReader.js',comFun:function(){
        var Pdf = new Bing.Pdf({
            uid:'BingGeGe',
            allowTypes:'pdf',
            uploadUrl:'../UIInterface/uplod.aspx',//上传动态文件路径
            listUrl:'../Ashx/filelist.ashx',//类表页读取路径
            loadImgUrl:'../Ashx/FilePreviw.ashx',//主页面图片读取路径
            pageSize : 10,//每一页显示的条数
            parent:$('body'),
            className:'pdf-main-body'
        });
    }});
})