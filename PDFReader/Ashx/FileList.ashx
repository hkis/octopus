<%@ WebHandler Language="C#" Class="FileList" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Text;
using System.Web.Script.Serialization;
using WebOS.PdfReader.Model.ResultData;
using WebOS.PdfReader.BLL;
using WebOS.PdfReader.Model.PdfFileMangr;


public class FileList : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";

        var uid = string.Empty;
        var msg=string.Empty;
        var pageSize = 10;
        var pageIndex = 1;
        var pageCount = 0;

        if (context.Request.QueryString["uid"] != null && context.Request.QueryString["uid"] != "")
        {
            uid = context.Request.QueryString["uid"].ToString();
            if (string.IsNullOrEmpty(uid))
            {
                ResultDataMangr reData = new ResultDataMangr() { result = false, errCode = "用户名不能为空！" };
                OutPut(reData, context);
            }
        }
        if (context.Request.QueryString["pageIndex"] != null)
        {
            pageIndex = Convert.ToInt32(context.Request.QueryString["pageIndex"]);
        }
        if (context.Request.QueryString["pageSize"]!=null)
        {
            pageSize = Convert.ToInt32(context.Request.QueryString["pageSize"]);
        }

        
        List<UserPdfFileInfo> List=new List<UserPdfFileInfo>();
        BllPdfFileInfoMangr bpfm = new BllPdfFileInfoMangr();
        StringBuilder sb=new StringBuilder();
        var strJoin="&&";
        
        if(bpfm.GetPdfFileByUserID(uid,pageSize,pageIndex,out List,out pageCount,out msg))
        {
            if (List == null && List.Count ==0)
            {
                context.Response.Write("");
                context.Response.End();
                
            }
            ResultDataMangr result = new ResultDataMangr();
            foreach (var pdf in List)
            {
                result.result = true;
                result.title = pdf.pdfFileName;
                result.author = pdf.pdfFileAuthor;
                result.time= pdf.createTime;
                sb.Append(pdf2String(result));
                sb.Append(strJoin);    
            }
            sb.Append(pageCount);
        }

        context.Response.Write(sb.ToString());
        context.Response.End();
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
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}