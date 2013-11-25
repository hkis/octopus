using ifeng.SystemFramework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using WebOS.PdfReader.BLL;
using WebOS.PdfReader.DocToImage;
using WebOS.PdfReader.Model.PdfFileMangr;
using WebOS.PdfReader.Model.ResultData;

[WebService(Namespace = "http://v.ifeng.com")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class UploadDocument : System.Web.Services.WebService
{

    public UploadDocument() { }

    /// <summary>
    /// 上传Office文档，转化成PDF
    /// </summary>
    /// <param name="documentURL">Office文档URL地址</param>
    /// <param name="uid">用户名</param>
    /// <returns></returns>
    [WebMethod]
    public string Upload(string documentURL, string uid)
    {
        bool isParameterError = false;
        string errorMessage = string.Empty;

        if (String.IsNullOrEmpty(documentURL) || Helper.IsURL(documentURL) == false)
        {
            isParameterError = true;
            errorMessage = "文档地址不能为空，且必须是合法的URL格式";
        }

        if (String.IsNullOrEmpty(uid))
        {
            isParameterError = true;
            errorMessage = "请提供用户名";
        }

        if (Helper.GetDocType(documentURL) == EnumDocType.Other)
        {
            isParameterError = true;
            errorMessage = "只允许上传 .doc /.docx /.xls /.ppt /.pdf /.txt 文件";
        }

        if (isParameterError)
        {
            return resultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = errorMessage
            });
        }

        string GUID = System.Guid.NewGuid().ToString();
        string pdfPath = Config.ReadSetting("SourcePath", string.Empty);
        string sourceFileName = System.IO.Path.GetFileName(documentURL);
        string saveFileName = GUID + ".pdf";

        pdfPath = Server.MapPath("~/pdfFile/source/") + uid;
        if (!Directory.Exists(pdfPath)) Directory.CreateDirectory(pdfPath);

        // 存储pdf文件的名称
        string savePath = pdfPath + "\\" + saveFileName;

        // office文档转化成PDF并保存
        string convertErrorMsg = string.Empty;
        if (!DocToPDFFActory.DocToPDF(new ConvertParameter()
        {
            SourcePath = documentURL,
            IsAllPage = true,
            TargetPath = savePath,
            StartPage = 1,
            EndPage = 1
        }, out convertErrorMsg))
        {
            return resultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = convertErrorMsg //"转化成PDF时出现错误，请确认URL是Office文档并且可访问"
            });
            
        }

        // 添加文件信息到数据库
        UserPdfFileInfo pdf = new UserPdfFileInfo()
        {
            pdfFileID = GUID,
            pdfFileAuthor = uid,
            pdfUserName = uid,
            pdfFileName = System.IO.Path.GetFileName(documentURL),
            createTime = DateTime.Now,//时区
            pdfPath = savePath
        };

        string msg = string.Empty;
        if (!new BllPdfFileInfoMangr().AddPdfFileInfo(pdf, out msg))
        {
            ApplicationLog.WriteError("写入数据库错误:" + msg);
        }

        return resultData2String(new ResultDataMangr()
        {
            result = true,
            title = System.IO.Path.GetFileName(documentURL),
            fileID = pdf.pdfFileID,
            author = uid,
            time = pdf.createTime.ToString()
        });
    }



    /// <summary>
    /// 序列化对象为JSON
    /// </summary>
    /// <param name="resultData"></param>
    /// <returns></returns>
    private string resultData2String(object resultData)
    {
        return new JavaScriptSerializer().Serialize(resultData);
    }

}



