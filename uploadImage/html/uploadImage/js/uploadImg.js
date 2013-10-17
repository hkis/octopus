var uploadUrlAshx = '../../Ashx/ImagesProcess.ashx';
$(document).ready(function(){
    $(document).forbidSelect();
    //使用的时候再加载
    $('head').addScriptEle({src:'js/Template.js',comFun:function(){
        var UpImg1 = new Bing.UpImg({
            uid:'userName1',                          //用户id
            allowTypes:'png,jpg,jpeg',                //图片允许的格式集合
            imgPro:0.9,                               //截图框的宽高比例
            size:4,                                   //显示图片大小最大为4M
            className:'uploadImg',                    //上传组件的class样式
            postUrl:uploadUrlAshx,                    //提交路径
            successFn:function(){                     //成功创建执行的函数
                console.log('图片上传组件成功创建1');
            },errorFn:function(){                     //创建失败执行的函数
                console.error('图片上传组件创建失败1');
            }
        });
        UpImg1.append($('body'));
        var UpImg2 = new Bing.UpImg({
            uid:'userName2',
            allowTypes:'png,jpg,jpeg',
            imgPro:1.1,
            size:4,
            postUrl:uploadUrlAshx,
            className:'uploadImg',
            successFn:function(){
                console.log('图片上传组件成功创建2');
            },
            errorFn:function(){
                console.error('图片上传组件创建失败2');
            }
        });
        UpImg2.append($('body'));
        var UpImg3 = new Bing.UpImg({
            uid:'userName3',
            allowTypes:'png,jpg,jpeg',
            imgPro:0.5,
            size:4,
            postUrl:uploadUrlAshx,
            className:'uploadImg',
            successFn:function(){
                console.log('图片上传组件成功创建3');
            },
            errorFn:function(){
                console.error('图片上传组件创建失败3');
            }
        });
        UpImg3.append($('body'));
        var UpImg4 = new Bing.UpImg({
            uid:'userName4',
            allowTypes:'png,jpg,jpeg',
            imgPro:1.5,
            size:4,
            postUrl:uploadUrlAshx,
            className:'uploadImg',
            successFn:function(){
                console.log('图片上传组件成功创建4');
            },
            errorFn:function(){
                console.error('图片上传组件创建失败4');
            }
        });
        UpImg4.append($('body'));
    }});
});