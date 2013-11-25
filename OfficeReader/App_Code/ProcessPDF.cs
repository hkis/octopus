using ifeng.SystemFramework;
using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;
using System.Web.Services;
using WebOS.PdfReader.Model.ResultData;


[WebService(Namespace = "http://v.ifeng.com")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class ProcessPDF : System.Web.Services.WebService
{
    public ProcessPDF() { }

    /// <summary>
    /// 获取缩略图
    /// </summary>
    /// <param name="fileId">例如 xxxx-xxx-xxx-xxx ,不带.pdf</param>
    /// <param name="uid"></param>
    /// <param name="index">图片index,eg:"1,2,3"</param>
    /// <param name="firstOr"></param>
    /// <param name="type"></param>
    /// <returns></returns>
    [WebMethod]
    public string GenerateImages(string fileId, string uid, string index, bool firstOr, string type)
    {
        if (string.IsNullOrEmpty(fileId))
        {
            return ResultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = "文件名不能为空!"
            });
        }

        if (string.IsNullOrEmpty(uid))
        {
            return ResultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = "用户名不能为空!"
            });
        }

        // 页码列表
        List<string> pageIndex = new List<string>();
        if (!string.IsNullOrEmpty(index))
        {
            pageIndex = index.Split(',').ToList<string>();
        }

        string pdfFilePath = Context.Server.MapPath("~/pdffile/source/" + uid + "/" + fileId + ".pdf");

        if (!System.IO.File.Exists(pdfFilePath))
        {
            return ResultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = "PDF文件不存在!"
            });
        }

        string msg = string.Empty;

        // 获取 fileName
        string pdfFileName = string.Empty;
        var pdfInfo = new WebOS.PdfReader.BLL.BllPdfFileInfoMangr().GetPdfInfoByID(fileId);
        if (pdfInfo != null)
        {
            pdfFileName = pdfInfo.pdfFileName;
        }

        if (type == "simple")
        {
            if (pageIndex.Count > 0)
            {
                string thumbnailsUrl = Config.ReadSetting("ThumbnailsUrl", "");
                string thumbnailsDirPath = Context.Server.MapPath("~/pdffile/thumbnails/" + uid + "/");
                if (!System.IO.Directory.Exists(thumbnailsDirPath))
                    System.IO.Directory.CreateDirectory(thumbnailsDirPath);

                string thumbnailsFilePath = string.Empty;
                string thumbnailsUrlTemp = string.Empty;
                int pageCount = 0;
                Dictionary<int, string> dicPath = new Dictionary<int, string>();

                foreach (var p in pageIndex)
                {
                    thumbnailsFilePath = thumbnailsDirPath + fileId + "_" + p + ".jpeg"; // thumb 磁盘路径
                    thumbnailsUrlTemp = thumbnailsUrl + uid + "/" + fileId + "_" + p + ".jpeg"; // thumb url
                    if (!System.IO.File.Exists(thumbnailsFilePath))
                    {
                        if (ImageTools.ConvertPDF2Thumbnails(
                            pdfFilePath,
                            thumbnailsFilePath,
                            fileId,
                            int.Parse(p),
                            int.Parse(p),
                            System.Drawing.Imaging.ImageFormat.Jpeg,
                            ImageTools.Definition.Two,
                            out pageCount))
                        {
                            msg = "图片已生成！";
                        }
                    }
                    else
                    {
                        pageCount = ImageTools.GetPDF2ImageCount(pdfFilePath);
                    }
                    dicPath.Add(Convert.ToInt32(p), thumbnailsUrlTemp);
                }

                System.Text.StringBuilder sb = DictionaryToStr(dicPath);
                sb.Remove(sb.Length - 2, 2);
                ResultDataMangr outData = null;
                if (firstOr == true)
                {
                    outData = new ResultDataMangr()
                    {
                        result = true,
                        index = index,
                        title = pdfFileName,
                        allNumber = pageCount.ToString(),
                        author = uid,
                        pageContent = sb.ToString()
                    };
                }
                else
                {
                    outData = new ResultDataMangr() { result = true, index = index, pageContent = sb.ToString() };
                }
                return ResultData2String(outData);
            }
        }
        else if (type == "rich")
        {
            if (pageIndex.Count > 0)
            {
                var thumbnailsName = string.Empty;
                byte[] list = null;
                var pageCount = 0;
                Dictionary<int, byte[]> dicPath = new Dictionary<int, byte[]>();

                if (!File.Exists(pdfFilePath))
                {
                    return ResultData2String(new ResultDataMangr() { result = false, errCode = "该PDF文件不存在！" });
                }

                

                foreach (var p in pageIndex)
                {
                    if (ImageTools.ConvertPDF2Image(
                        pdfFilePath,
                        Convert.ToInt32(p),
                        Convert.ToInt32(p),
                        ImageFormat.Jpeg,
                        ImageTools.Definition.Two,
                        out list,
                        out pageCount))//生成图片
                    {
                        dicPath.Add(Convert.ToInt32(p), list);
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
                if (firstOr == true)
                {
                    outData = new ResultDataMangr()
                    {
                        result = true,
                        index = index,
                        allNumber = pageCount.ToString(),
                        title = pdfFileName,
                        fileID=fileId,
                        author = uid,
                        pageContent = sb.ToString()
                    };
                }
                else
                {
                    outData = new ResultDataMangr() { result = true, index = index, pageContent = sb.ToString() };
                }

                ApplicationLog.WriteInfo(sb.ToString());

                return ResultData2String(outData);
            }
        }


        return ResultData2String(new ResultDataMangr()
            {
                result = false,
                errCode = "未知错误!"
            });

    }


    private string ResultData2String(ResultDataMangr resultData)
    {
        return new JavaScriptSerializer().Serialize(resultData);
    }

    private StringBuilder DictionaryToStr(Dictionary<int, byte[]> dic)
    {
        var result = new StringBuilder();
        string strHtml = string.Empty;
        var imgData = string.Empty;
        if (dic != null && dic.Keys.Count > 0)
        {
            foreach (var s in dic)
            {
                imgData = Convert.ToBase64String(s.Value);
                strHtml = string.Format("<img src='{0}{1}' /><span class='pageNumber'>{2}</span>", "data:image/jpg;base64,", imgData, s.Key);
                result.Append(strHtml);
                ApplicationLog.WriteInfo("图片span数目{2}:" + s.Key);
                result.Append("&&");
            }
        }
        return result;
    }


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

}
