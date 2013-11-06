<%@ WebHandler Language="C#" Class="FilePreviw" %>

using System;
using System.Web;
using ifeng.SystemFramework;
using O2S.Components.PDFRender4NET;
using WebOS.PdfReader.Model.ResultData;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Collections;
using System.IO;
using System.Drawing.Imaging;
using System.Text;

public class FilePreviw : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/html";

        string pdfSourcePath = Config.ReadSetting("SourcePath", "");
        string pdfBakPath = Config.ReadSetting("PdfBakPath", "");
        string imgPath = Config.ReadSetting("ImgPath", "");
        string thumbnailsPath = Config.ReadSetting("ThumbnailsPath", "");
        var thumbnailsUrl = Config.ReadSetting("ThumbnailsUrl", "");
        
        var fullName = string.Empty;
        var uid = string.Empty;
        var index = string.Empty;
        var firstOr = string.Empty;
        var type = string.Empty;
        var msg = string.Empty;

        fullName = context.Request["fileId"];//"从原则到模式-635192683751445624";// 
        type = context.Request["type"]; //"rich";// 
        firstOr = context.Request["firstOr"]; //"true";//  
        index = context.Request["index"]; //"2";//   
        uid = context.Request["uid"]; //"BingGeGe";// 
        
        if (string.IsNullOrEmpty(fullName))
        {
            ResultDataMangr reData = new ResultDataMangr() { result = false, errCode = "文件名不能为空！" };
            OutPut(reData, context);
        }
        
        var pageIndexArr = new string[index.Length];
        if (!string.IsNullOrEmpty(index) && index.Contains(","))
        {
            pageIndexArr = index.Split(',');
        }
        else
        {
            pageIndexArr = new string[] { index};
        }
        var pdfName = pdfSourcePath + uid + "\\" + fullName+".pdf";
        if (type == "simple")
        {
            if (pageIndexArr!=null && pageIndexArr.Length>0)
            {
                var thumbnailsName = string.Empty;
                var thumbnailsUrlTemp=string.Empty;
                var pageCount = 0;
                Dictionary<int, string> dicPath = new Dictionary<int, string>();

                if(!File.Exists(pdfName))
                {
                    ResultDataMangr reData=new ResultDataMangr(){result=false,errCode="该PDF文件不存在！"};
                    OutPut(reData,context);
                }
                   
                for (int i = 0; i < pageIndexArr.Length; i++)
                {
                    thumbnailsName = thumbnailsPath + fullName + "_" + pageIndexArr[i].ToString() + ".jpeg";
                    thumbnailsUrlTemp = thumbnailsUrl  + fullName + "_" + pageIndexArr[i].ToString() + ".jpeg";//文件虚拟路径
                    if (!File.Exists(thumbnailsName))//不存在缩略图才重新创建
                    {
                        if (ImageTools.ConvertPDF2Thumbnails(pdfName, thumbnailsName, fullName, Convert.ToInt32(pageIndexArr[i]), Convert.ToInt32(pageIndexArr[i]),
                            ImageFormat.Jpeg, ImageTools.Definition.Two, out pageCount))//生成缩略图
                        {
                            msg = "图片已生成！";
                        }
                    }
                    else
                    {
                        pageCount = ImageTools.GetPDF2ImageCount(pdfName);
                    }
                    dicPath.Add(Convert.ToInt32(pageIndexArr[i]), thumbnailsUrlTemp);
                }
                
                   
                StringBuilder sb= DictionaryToStr(dicPath);
                sb.Remove(sb.Length - 2, 2);
                ResultDataMangr outData=null;
                if (firstOr == "true")
                {
                    outData = new ResultDataMangr() { result = true, index = index, title = "测试",allNumber=pageCount.ToString(),
                        author = "xia", pageContent = sb.ToString() };
                }
                else
                {
                    outData = new ResultDataMangr() { result = true, index = index, pageContent = sb.ToString() };
                }
                OutPut(outData, context);//输出
            }
        }
        else if (type == "rich")
        {
            if (pageIndexArr != null && pageIndexArr.Length > 0)
            {
                var thumbnailsName = string.Empty;
                byte[] list = null;
                var pageCount=0;
                Dictionary<int,byte[]> dicPath = new Dictionary<int, byte[]>();

                if(!File.Exists(pdfName))
                {
                    ResultDataMangr reData=new ResultDataMangr(){result=false,errCode="该PDF文件不存在！"};
                    OutPut(reData,context);
                }
                   
                for (int i = 0; i < pageIndexArr.Length; i++)
                {
                    if (ImageTools.ConvertPDF2Image(pdfName, Convert.ToInt32(pageIndexArr[i]), Convert.ToInt32(pageIndexArr[i]),
                        ImageFormat.Jpeg, ImageTools.Definition.Two, out list,out pageCount))//生成图片
                    {
                        dicPath.Add(Convert.ToInt32(pageIndexArr[i]), list);
                    }
                    else
                    {
                        msg = "生成图片错误！";
                        ApplicationLog.WriteError(msg);
                    }
                }

                StringBuilder sb = DictionaryToStr(dicPath);
                sb.Remove(sb.Length - 2, 2);//移除末尾的"&&"
                ResultDataMangr outData = null;
                if (firstOr == "true")
                {
                    outData = new ResultDataMangr()
                    {
                        result = true,
                        index = index,
                        allNumber = pageCount.ToString(),
                        title = fullName,
                        author = uid,
                        pageContent = sb.ToString()
                    };
                }
                else
                {
                    outData = new ResultDataMangr() { result = true, index = index, pageContent = sb.ToString() };
                }
                OutPut(outData, context);
            }
        }               
    }
 

    private string pdf2String(ResultDataMangr reData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        return serializer.Serialize(reData);
    }

    private void OutPut(ResultDataMangr reData, HttpContext context)
    {
        string result = pdf2String(reData);
        context.Response.ContentType = "text/html";
        context.Response.Write(result);
        context.Response.End();
    }


    private StringBuilder DictionaryToStr(Dictionary<int, byte[]> dic)
    {
        var result = new StringBuilder();
        string strHtml=string.Empty;
        var imgData = string.Empty;
        if (dic != null && dic.Keys.Count > 0)
        {
            foreach (var s in dic)
            {
                imgData = Convert.ToBase64String(s.Value);
                strHtml = string.Format("<img src='{0}{1}' /><span class='pageNumber'>{2}</span>", "data:image/jpg;base64,", imgData,s.Key );
                result.Append(strHtml);
                ApplicationLog.WriteInfo("图片span数目{2}:"+s.Key);
                result.Append("&&");
            }
        }
        return result;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="dic"></param>
    /// <returns></returns>
    private StringBuilder DictionaryToStr(Dictionary<int, string> dic)
    {
        var result = new StringBuilder();
        string strHtml = string.Empty;
        int i = 1;
        if (dic != null && dic.Keys.Count > 0)
        {
            foreach (var s in dic)
            {
                strHtml = string.Format("<img src='{0}' /><span class='pageNumber'>{1}</span>", s.Value, s.Key);
                ApplicationLog.WriteInfo("缩略图span数目{2}:" + s.Key);
                result.Append(strHtml);
                result.Append("&&");
            }
        }
        return result;
    }
    
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
 
}