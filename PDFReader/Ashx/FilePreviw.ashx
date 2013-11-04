<%@ WebHandler Language="C#" Class="FilePreviw" %>

using System;
using System.Web;
using ifeng.SystemFramework;
using O2S.Components.PDFRender4NET;
using WebOS.PdfReader.Model.ResultData;
using System.Web.Script.Serialization;
using System.Collections.Generic;
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
        
        fullName=context.Request.QueryString["fileId"];
        type=context.Request.QueryString["type"];
        firstOr=context.Request.QueryString["firstOr"];
        
        if(firstOr=="false")
        {
            if (string.IsNullOrEmpty(fullName))
            {
                ResultDataMangr reData = new ResultDataMangr() { result = false, errCode = "文件名不能为空！" };
                OutPut(reData, context);
            }
           var fileName=fullName.Substring(0,fullName.LastIndexOf(".")-1);
       
           var pdfName=pdfSourcePath+fullName;
           if (type == "simple")
           {
               if (!string.IsNullOrEmpty(index))
               {
                   var pageIndexArr = index.Split(',');
                   var thumbnailsName = string.Empty;
                   var thumbnailsUrlTemp=string.Empty;
                   Dictionary<int, string> dicPath = new Dictionary<int, string>();

                   if(File.Exists(fullName))
                   {
                        ResultDataMangr reData=new ResultDataMangr(){result=false,errCode="该PDF文件不存在！"};
                        OutPut(reData,context);
                   }
                   
                   for (int i = 0; i < pageIndexArr.Length; i++)
                   {
                       thumbnailsName = thumbnailsPath + fileName + "_" + pageIndexArr[i].ToString() + ".jpeg";
                       thumbnailsUrlTemp = thumbnailsUrl + fileName + "_" + pageIndexArr[i].ToString() + ".jpeg";//文件虚拟路径
                       if (!File.Exists(thumbnailsName))//不存在缩略图才重新创建
                       {
                           if (ImageTools.ConvertPDF2Thumbnails(pdfName, thumbnailsName, fileName, Convert.ToInt32(pageIndexArr[i]), Convert.ToInt32(pageIndexArr[i]),
                               ImageFormat.Jpeg, ImageTools.Definition.Two))//生成缩略图
                           {
                               msg = "图片已生成！";
                           }
                       }
                       dicPath.Add(i, thumbnailsUrlTemp);
                   }
                   
                   StringBuilder sb= DictionaryToStr(dicPath);
                   sb.Remove(sb.Length - 1, 2);
                   ResultDataMangr outData = new ResultDataMangr() {result=true,index=index,pageContent=sb.ToString()};
                   OutPut(outData, context);//输出
               }
           }
           else if (type == "rich")
           {
               if (!string.IsNullOrEmpty("index"))
               {
                   var pageIndexArr = index.Split(',');
                   var thumbnailsName = string.Empty;
                   List<byte[]> list=new List<byte[]>();
                   Dictionary<int, List<byte[]>> dicPath = new Dictionary<int, List<byte[]>>();

                   if(File.Exists(fullName))
                   {
                        ResultDataMangr reData=new ResultDataMangr(){result=false,errCode="该PDF文件不存在！"};
                        OutPut(reData,context);
                   }
                   
                   for (int i = 0; i < pageIndexArr.Length; i++)
                   {
                       if (ImageTools.ConvertPDF2Image(pdfName, Convert.ToInt32(pageIndexArr[i]), Convert.ToInt32(pageIndexArr[i]),
                           ImageFormat.Jpeg, ImageTools.Definition.Two, out list))//生成图片
                       {
                           dicPath.Add(i, list);
                       }
                       else
                       {
                           msg = "生成图片错误！";
                           ApplicationLog.WriteError(msg);
                       }
                   }

                   StringBuilder sb = DictionaryToStr(dicPath);
                   sb.Remove(sb.Length - 1, 2);//移除末尾的"&&"
                   ResultDataMangr outData = new ResultDataMangr() { result = true, index = index, pageContent = sb.ToString() };
                   OutPut(outData, context);
               }
           }
        }
        else
        {
            ResultDataMangr reData=new ResultDataMangr(){result=true,index="1,2",allNumber="2",title="测试",author="xia",pageContent="11.jpg"};
            OutPut(reData, context);
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


    private StringBuilder DictionaryToStr(Dictionary<int, List<byte[]>> dic)
    {
        var result = new StringBuilder();
        string strHtml=string.Empty;
        int i = 1; 
        if (dic != null && dic.Keys.Count > 0)
        {
            foreach (var s in dic)
            {
                strHtml = string.Format("<img src='{0}{1}' /><span class='pageNumber'>{2}</span>", "data:image/jpg;base64,", s, i++);
                result.Append(strHtml);
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
                strHtml = string.Format("<img src='{0}' /><span class='pageNumber'>{1}</span>", s, i++);
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