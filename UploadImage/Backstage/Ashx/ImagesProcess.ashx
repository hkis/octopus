<%@ WebHandler Language="C#" Class="ImagesProcess" %>

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
                ResultData rData = new ResultData() { result=false,errCode="图片格式不正确！"};
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                
                result = serializer.Serialize(rData);
                context.Response.Write(result);
                context.Response.End();
            }

            filePath = Config.ReadSetting("filePath", "") + uid + ".jpg";
            fileData.SaveAs(context.Server.MapPath("../images/" + uid + ".jpg"));

            //保存图片
            strResult= UploadImg(context, uid, fileData);
        }
        else if (action.ToLower() == "cut")
        {
            int width = Convert.ToInt32(context.Request["width"]);
            int height = Convert.ToInt32(context.Request["height"]);
            int top =Convert.ToInt32(context.Request["top"]);
            int left =Convert.ToInt32(context.Request["left"]);
            uid=context.Request["uid"];
           
            var isZoom=context.Request["isZoom"];
            strResult = ImgCut(context, uid, width, height, top, left, isZoom);
        }
          
      
        
        context.Response.Write(strResult);
        //context.Response.Write("Hello World");
    }

    /// <summary>
    /// 图片切割
    /// </summary>
    /// <param name="context"></param>
    /// <param name="uid"></param>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <param name="top"></param>
    /// <param name="left"></param>
    /// <param name="isZoom"></param>
    /// <returns></returns>
    private string ImgCut(HttpContext context, string uid, int width, int height, int top, int left, string isZoom)
    {
        string filePath = string.Empty;
        string result = string.Empty;
        string strResult = string.Empty;

        Image img = null;
        Image imgCut = null;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        
        if (isZoom == "true")
        {
            try
            {
                using (img = Image.FromFile(context.Server.MapPath("../images/" + uid + ".jpg")))
                {
                    Size size = new Size();
                    ImageUtils imgUtilsMangr = new ImageUtils();
                    MongoHelper mongoHelper = new MongoHelper();

                    size.Height = Convert.ToInt32(context.Request["imgHeight"]);
                    size.Width = Convert.ToInt32(context.Request["imgWidth"]);
                    using (imgCut = imgUtilsMangr.ResizeImage(img, size))
                    {
                        ApplicationLog.WriteInfo("processing...缩放完成" + "width:" + width + "height:" + height + "top:" + top + "left:" + left);
                        using (Bitmap b = imgUtilsMangr.CutBitmap(imgCut, width, height, left, top))
                        {
                            byte[] byteImg = imgUtilsMangr.ImageToByte(b);
                            string ticks = DateTime.Now.Ticks.ToString();
                            uid = uid + "-" + ticks;//截图ID命名规则：用户ID+"-"+时间戳
                            
                            //将图片存入MongoDB
                            mongoHelper.SaveImgBJson(byteImg, uid);
                            //从MongoDB中取出图片并转化为Base64编码
                            
                            string imgData = Convert.ToBase64String(mongoHelper.GetImgBJson(uid));
                            imgData = "data:image/jpg;base64," + imgData;
                            //b.Save(context.Server.MapPath("../images/" + uid + "_cut.jpg"));
                            //filePath = "http://smop.staff.ifeng.com/images/" + uid + "_cut.jpg";
                            ApplicationLog.WriteInfo("processing...缩放后重新截图完成,filePath" + filePath);

                            ResultData curResultData = new ResultData() { result = true, width = width, height = height, path = imgData };
                            strResult = serializer.Serialize(curResultData);
                            ApplicationLog.WriteInfo("输出数据，data=" + strResult);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                string errMsg = ex.Message.ToString();
                ApplicationLog.WriteInfo(errMsg);
            }
        }
        else
        {
            try
            {
                using (img = Image.FromFile(context.Server.MapPath("../images/" + uid + ".jpg")))
                {
                    //判断截图尺寸是否大于原图
                    if (width > img.Width || height > img.Height)
                    {
                        ResultData rd = new ResultData() { result = false, errCode = "截图尺寸不能大于原图！" };
                        result = serializer.Serialize(rd);
                        strResult = @"<script type='text/javascript'>"
                                + "window.parent.Bing.imgData ='" + result + "';</script>";
                    }
                    ImageUtils imgUtils = new ImageUtils();
                    MongoHelper mongoHelper = new MongoHelper();
                    using (Bitmap bitMap = imgUtils.CutBitmap(img, width, height, left, top))
                    {
                        byte[] byteImg = imgUtils.ImageToByte(bitMap);

                        string ticks = DateTime.Now.Ticks.ToString();
                        uid = uid + "-" + ticks;//截图ID命名规则：用户ID+"-"+时间戳
                        //将图片存入MongoDB
                        mongoHelper.SaveImgBJson(byteImg, uid);
                        
                        //从MongoDB中取出图片并转化为Base64编码
                        string imgData=Convert.ToBase64String(mongoHelper.GetImgBJson(uid));
                        imgData = "data:image/jpg;base64," + imgData;
                        
                        //bitMap.Save(context.Server.MapPath("../images/" + uid + ".jpg"));
                        //filePath = "http://smop.staff.ifeng.com/images/" + uid + ".jpg";
                        ResultData cResultData = new ResultData() { result = true, path =imgData  };
                        result = serializer.Serialize(cResultData);
                        strResult = @"<script type='text/javascript'>"
                                + "window.parent.Bing.imgData ='" + result + "'</script>";
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
        
        return strResult;
    }
    
    
    

    #region MyRegion
    /// <summary>
    /// 保存图片
    /// </summary>
    /// <param name="context">上下文</param>
    /// <param name="uid"></param>
    /// <param name="fileData"></param>
    /// <returns></returns>
    private static string UploadImg(HttpContext context, string uid, HttpPostedFile fileData)
    {
        string strResult = string.Empty;
        string filePath = Config.ReadSetting("filePath", "") + uid + ".jpg";
        string result = string.Empty;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        
        
        using (Image img = Image.FromStream(fileData.InputStream))
        {
            try
            {
                System.IO.FileInfo f = null;
                if (!string.IsNullOrEmpty(filePath))
                {
                    f = new System.IO.FileInfo(context.Server.MapPath("../images/" + uid + ".jpg"));
                    if (f.Length > 4 * 1024 * 1000)
                    {
                        //strResult = "{\"result\":false,\"errCode\":E02,\"path\":'" + filePath + "'}";
                        ResultData reData = new ResultData() { result = false, errCode = "图片不能大于4M！", path = filePath };
                        result = serializer.Serialize(reData);
                        strResult = @"<script type='text/javascript'>"
                            + "window.parent.Bing.imgData ='" + result + "';</script>";
                        context.Response.Write(strResult);
                        context.Response.End();
                    }

                    ResultData rData = new ResultData() { result = true, size = f.Length, height = img.Height, width = img.Width, path = filePath };
                    result = serializer.Serialize(rData);
                    //{result:true,size:'" + f.Length + "',height:" + img.Height + ",width:" + img.Width + ",path:'" + filePath + "'}
                    strResult = @"<script type='text/javascript'>"
                            + "window.parent.Bing.imgData ='" + result + "';</script>";

                }
            }
            catch (Exception ex)
            {
                string errmsg = "读取文件失败,Info:" + ex.Message.ToString();
                //strResult = "{\"result\":false,\"errCode\":E03,\"path\":" + filePath + "}";
                ResultData reData = new ResultData() { result = false, errCode = "图片读取失败！", path = filePath };
                result = serializer.Serialize(reData);
                context.Response.Write(result);
                ApplicationLog.WriteError("获取图片大小失败,info:" + errmsg);
            }
        }

        return strResult;
    } 
    #endregion
 
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