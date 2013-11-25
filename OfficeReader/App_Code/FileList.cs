using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using WebOS.PdfReader.BLL;
using WebOS.PdfReader.Model.PdfFileMangr;
using WebOS.PdfReader.Model.ResultData;

/// <summary>
/// FileList 的摘要说明
/// </summary>
public class FileList
{

    public bool GetUserFileList(string uid,int pageSize,int pageIndex,out string result)
    { 
        var flag=false;
        result = string.Empty;

        if (string.IsNullOrEmpty(uid))
        { 
            result="用户ID不能为空";
            return flag;
        }

        if (pageSize == 0)
        {
            pageSize = 10;
        }
        if (pageIndex == 0)
        {
            pageIndex = 1;
        }

        BllPdfFileInfoMangr bpfm = new BllPdfFileInfoMangr();
        List<UserPdfFileInfo> list=new List<UserPdfFileInfo>();
        StringBuilder sb = new StringBuilder();
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        ResultDataMangr reData = new ResultDataMangr();
        var strJoin = "&&";
        long pageCount=0;


        if (bpfm.GetPdfFileByUserID(uid, pageSize, pageIndex, out list, out pageCount, out result))
        {
            if (list != null || list.Count == 0)
            {
                result = "该用户还未上传任何文件！";
                return flag; ;
            }
            foreach (var file in list)
            {
                reData.result = true;
                reData.fileID = file.pdfFileID;
                reData.title = file.pdfFileName;
                reData.time = file.createTime.ToString();
                reData.author = file.pdfFileAuthor;

                sb.Append(serializer.Serialize(reData));
                sb.Append(strJoin);
            }
            sb.Append(pageCount);
        }

        return flag;
    }
}