using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using WebOS.PdfReader.Model.ResultData;
using WebOS.PdfReader.BLL;
using WebOS.PdfReader.Model.PdfFileMangr;
using ifeng.SystemFramework;
using System.IO;

public partial class UIInterface_uplod : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        var uID = string.Empty;
        var extName = string.Empty;
        var pdfPath = Config.ReadSetting("SourcePath", "");
        var fileName = string.Empty;


        if (Request.QueryString["uid"] == null && Request.QueryString["uid"] == "")
        {
            ResultDataMangr reData = new ResultDataMangr() { result = false, errCode = "用户名为空！" };
            OutPut(reData);
        }
        uID = Request.QueryString["uid"];
        var fileData = Request.Files["FileData"];
        ApplicationLog.WriteInfo("uid="+uID);
        if (fileData != null)
        {
            extName = fileData.FileName.Substring(fileData.FileName.LastIndexOf(".")).ToLower();
            var fileType = Config.ReadSetting("SourceFileter", "");

            if (!fileType.ToString().Contains(extName))
            {
                ResultDataMangr reData = new ResultDataMangr() { result = false, errCode = "文件类型错误，不支持该类型文件上传！" };
                OutPut(reData);
            }
            pdfPath = pdfPath + uID;
            ApplicationLog.WriteInfo("pdfPath:"+pdfPath);
            if (!Directory.Exists(pdfPath))
            {
                Directory.CreateDirectory(pdfPath);
            }
            //DirectoryInfo dirInfo = new DirectoryInfo(pdfPath);
            //dirInfo.CreateSubdirectory(uID);
            fileName = fileData.FileName.Substring(0,fileData.FileName.LastIndexOf("."))+ DateTime.Now.Ticks.ToString();
            fileData.SaveAs(pdfPath + "\\" + fileName + extName);//保存图片

            //往数据添加文件数据
            var msg=string.Empty;
            UserPdfFileInfo pdf = new UserPdfFileInfo();
            BllPdfFileInfoMangr bpfm = new BllPdfFileInfoMangr();

            pdf.pdfFileID = new Guid().ToString();
            pdf.pdfFileAuthor = uID;
            pdf.pdfUserName = uID;
            pdf.pdfFileName = fileName;
            pdf.createTime = DateTime.Now.ToString("yyyy-MM-dd");

            if (!bpfm.AddPdfFileInfo(pdf, out msg))
            {
                msg = "往数据库写数据失败！";
                ApplicationLog.WriteError(msg);
            }

            ResultDataMangr resultData=new ResultDataMangr(){result=true,title=fileName,author=uID,time=pdf.createTime};
            var strData=pdf2String(resultData);
            ApplicationLog.WriteInfo("上传成功，Info"+strData);
            var strHtml = "<script type=\"text/javascript\">window.parent.Bing.templateData='"+strData+"'</script>";
            Context.Response.Write(strHtml);
            Context.Response.End();
        }
        
    }


    private string pdf2String(ResultDataMangr reData)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        return serializer.Serialize(reData);
    }

    /// <summary>
    /// 输出
    /// </summary>
    /// <param name="reData"></param>
    private void OutPut(ResultDataMangr reData)
    { 
        JavaScriptSerializer serializer=new JavaScriptSerializer();
        string result = serializer.Serialize(reData);
        Response.ContentType = "text/html";
        Response.Write(result);
        Response.End();
    }
}