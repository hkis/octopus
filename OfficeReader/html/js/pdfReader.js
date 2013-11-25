$(document).ready(function(e){
    $('head').addScriptEle({src:'js/Template-pdfReader.js',comFun:function(){
        var Pdf = new Bing.Pdf({
            uid:'cacard',
            allowTypes:'pdf,doc,docx,xls,ppt,txt,xml,xlsx',
            listUrl: '/listdocument.asmx/FileList',//类表页读取路径
            loadImgUrl: '/ProcessPDF.asmx/GenerateImages',//主页面图片读取路径
            officeToPdfUrl:'/uploaddocument.asmx/upload',
            pageSize : 8,//每一页显示的条数
            parent:$('body')
        });
    }});
})