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
using System.Linq;

/// <summary>
/// 列表页调用
/// </summary>
[WebService(Namespace = "http://v.ifeng.com")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class ListDocument : System.Web.Services.WebService {

    public ListDocument () {}

    /// <summary>
    /// 获取用户文件列表
    /// </summary>
    /// <param name="uid"></param>
    /// <param name="pageSize"></param>
    /// <param name="pageIndex"></param>
    /// <returns></returns>
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public string FileList(string uid, int pageSize, int pageIndex)
    {
        ResultDataMangr result = new ResultDataMangr();
        if (string.IsNullOrEmpty(uid))
        {
            return resultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = "用户ID不能为空!"
            });
        }

        if (pageSize <= 0)
        {
            pageSize = 10;
        }
        if (pageIndex <= 0)
        {
            pageIndex = 1;
        }

        List<UserPdfFileInfo> list = new List<UserPdfFileInfo>();
        long pageCount = 0;
        var msg = string.Empty;
        List<ResultDataMangr> items = new List<ResultDataMangr>();

        if (new BllPdfFileInfoMangr().GetPdfFileByUserID(uid, pageSize, pageIndex, out list, out pageCount, out msg))
        {
            if (list == null || list.Count == 0)
            {
                return resultData2String(new ResultWrapper()
                {
                    ErrorCode = "该用户还未上传任何文件！",
                    IsError = true,
                    Item = null,
                    PageCount = 0
                });
            }


            foreach (var file in list)
            {
                ResultDataMangr reData = new ResultDataMangr();
                reData.result = true;
                reData.fileID = file.pdfFileID;
                reData.title = file.pdfFileName;
                reData.time = file.createTime.ToLocalTime().ToString();
                reData.author = file.pdfFileAuthor;
                items.Add(reData);
            }
        }
        else
        {
            return resultData2String(new ResultWrapper()
            {
                ErrorCode = "获取该用户数据出错！",
                IsError = true,
                Item = null,
                PageCount = 0
            });
        }

        return resultData2String(new ResultWrapper()
        {
            ErrorCode = string.Empty,
            IsError = false,
            Item = items,
            PageCount = Convert.ToInt32(pageCount)
        });

    }

    /// <summary>
    /// 对象序列化为JSON
    /// </summary>
    /// <param name="resultData"></param>
    /// <returns></returns>
    private string resultData2String(object resultData)
    {
        return new JavaScriptSerializer().Serialize(resultData);
    }
    
}
