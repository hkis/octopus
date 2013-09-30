﻿<%@ WebHandler Language="C#" Class="ImagesProcess" %>

using System;
using System.Web;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Text;
using ifeng.SystemFramework;
using System.Web.Script.Serialization;

public class ImagesProcess : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/html";
        
        var action = string.Empty;
        var fileName = string.Empty;
        var uid = string.Empty;
        var strResult=string.Empty;
        var filePath=string.Empty;
        var result = string.Empty;
        var extName = string.Empty;
        var localPath=string.Empty;
        
        JavaScriptSerializer serializer = new JavaScriptSerializer();

        if (string.IsNullOrEmpty(context.Request["uid"]))
        {
            context.Response.Write("nolog");
            context.Response.End();
        }

        uid = context.Request["uid"];
        action = context.Request["action"];
        if (action.ToLower() == "upload")
        {
            var fileData = context.Request.Files["filedata"];
            localPath = fileData.FileName;
            extName = localPath.Substring(localPath.LastIndexOf(".")).ToLower();
            var fileType=Config.ReadSetting("fileType","");
            
            if(!Config.ReadSetting("fileType","").ToString().Contains(extName))
            {
                //strResult = "{\"result\":false,\"errCode\":'E01'}";
                ResultData rData = new ResultData() { result=false,errCode="E01"};
                
                result = serializer.Serialize(rData);
                context.Response.Write(result);
                context.Response.End();
            }

            filePath = "http://smop.staff.ifeng.com/images/"+ uid + ".jpg";
            fileData.SaveAs(context.Server.MapPath("../images/" + uid + ".jpg"));
            
            using (Image img = Image.FromStream(fileData.InputStream))
            { 
                System.IO.FileInfo f=null;
                try
                {
                    if(!string.IsNullOrEmpty(filePath))
                    {
                         f=new System.IO.FileInfo(context.Server.MapPath("../images/"+uid+".jpg"));
                         if (f.Length > 4 * 1024*1000)
                         {
                             //strResult = "{\"result\":false,\"errCode\":E02,\"path\":'" + filePath + "'}";
                             ResultData reData = new ResultData() { result=false,errCode="E02",path=filePath};
                             result= serializer.Serialize(reData);
                             context.Response.Write(result);
                             context.Response.End();
                         }
                         
                        ResultData rData = new ResultData() { result=true,size=f.Length,height=img.Height,width=img.Width,path=filePath};
                        result = serializer.Serialize(rData);
                        //{result:true,size:'" + f.Length + "',height:" + img.Height + ",width:" + img.Width + ",path:'" + filePath + "'}
                        strResult = @"<script type='text/javascript'>"
                                + "window.parent.imgData ='" + result + "';"
                                + "window.parent.loadFun();</script>";
                         
                    }
                }
                catch(Exception ex)
                {
                    string errmsg = "读取文件失败,Info:"+ex.Message.ToString();
                    strResult = "{\"result\":false,\"errCode\":E03,\"path\":" + filePath + "}";
                    ResultData reData = new ResultData() { result=false,errCode="E03",path=filePath};
                    result = serializer.Serialize(reData);
                    context.Response.Write(result);
                    ApplicationLog.WriteError("获取图片大小失败,info:"+errmsg);
                }
            }
        }
        else if (action.ToLower() == "cut")
        {
            int width = Convert.ToInt32(context.Request["width"]);
            int height = Convert.ToInt32(context.Request["height"]);
            int top =Convert.ToInt32(context.Request["top"]);
            int left =Convert.ToInt32(context.Request["left"]);
            uid=context.Request["uid"];
            //localPath = context.Request["path"];
            //extName = localPath.Substring(localPath.LastIndexOf("."));
            if (context.Request["isZoom"] == "false")
            {
                try
                {
                    //加载原图
                    using (Image oldImg = Image.FromFile(context.Server.MapPath("../images/" + uid + ".jpg")))
                    {
                        //判断截图尺寸是否大于原图
                        if (width > oldImg.Width || height > oldImg.Height)
                        {
                            ResultData rd = new ResultData() { result = false, errCode = "E04" };
                            result = serializer.Serialize(rd);
                            context.Response.Write(result);
                        }
                        ImageUtils imgUtils = new ImageUtils();
                        using (Bitmap bitMap = imgUtils.CutBitmap(oldImg, width, height, left, top))
                        {
                            bitMap.Save(context.Server.MapPath("../images/" + uid + ".jpg"));
                            filePath = "http://smop.staff.ifeng.com/images/" + uid + ".jpg";
                            ResultData cResultData = new ResultData() { result = true, path = filePath };
                            result = serializer.Serialize(cResultData);
                            strResult = @"<script type='text/javascript'>"
                                    + "window.parent.imgData ='" + result + "';"
                                    + "window.parent.loadFun();</script>";
                            ApplicationLog.WriteInfo("输出数据，data=" + strResult);
                        }
                    }
                }
                catch (Exception ex)
                {
                    string errMsg = ex.Message.ToString();
                    ApplicationLog.WriteInfo(errMsg);
                }
            }
            else if (context.Request["isZoom"] == "true")
            {
                try
                {
                    using (Image img = Image.FromFile(context.Server.MapPath("../images/" + uid + ".jpg")))
                    {
                        Size size = new Size();
                        ImageUtils imgUtilsMangr = new ImageUtils();

                        size.Height = Convert.ToInt32(context.Request["imgHeight"]);
                        size.Width = Convert.ToInt32(context.Request["imgWidth"]);
                        using (Image imgCut = imgUtilsMangr.ResizeImage(img, size))
                        {
                            ApplicationLog.WriteInfo("processing...缩放完成" + "width:" + width + "height:" + height + "top:" + top + "left:" + left);
                            using (Bitmap b = imgUtilsMangr.CutBitmap(imgCut, width, height, left, top))
                            {
                                b.Save(context.Server.MapPath("../images/" + uid + "_cut.jpg"));
                                filePath = "http://smop.staff.ifeng.com/images/" + uid + "_cut.jpg";
                                ApplicationLog.WriteInfo("processing...缩放后重新截图完成,filePath" + filePath);

                                ResultData curResultData = new ResultData() { result = true, width = width, height = height, path = filePath };
                                strResult = serializer.Serialize(curResultData);
                                ApplicationLog.WriteInfo("输出数据，data=" + strResult);
                            }
                        }

                    }
                }
                catch (Exception ex)
                {
                    string msg = ex.Message.ToString();
                    ApplicationLog.WriteError(msg);
                }
            }
        }
          
      
        
        context.Response.Write(strResult);
        //context.Response.Write("Hello World");
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }


    public class ResultData
    {
        public bool result { get; set; }
        public string errCode { get; set; }
        public float size { get; set; }
        public float height { get;set; }
        public float width { get; set; }
        public string path { get; set; }
    }

}