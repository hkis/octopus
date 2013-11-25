using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using ifeng.SystemFramework;
using WebOS.PdfReader.DocToImage;

/// <summary>
/// FilePreview 的摘要说明
/// </summary>
public class FilePreview
{

    public bool GetThumnails(string uid, string pdfPath, string index, out string result,out int pageCount)
    {
        bool flag = false;
        pageCount = 0;
        result = string.Empty;
        var thumbnailPath = string.Empty;
        var thumbnailName = string.Empty;
        var pdfName=FileDownload.GetFileNameNoExtend(pdfPath);
        var thumbnailUrlPath = Config.ReadSetting("ThumbnailsUrl", "");

        if (File.Exists(pdfPath))
        {
            thumbnailPath = HttpContext.Current.Request.MapPath("../PdfFile/Thumbnails/"+uid + "/");
            if (!Directory.Exists(thumbnailPath))
            {
                Directory.CreateDirectory(thumbnailPath);
            }

            Dictionary<int, string> dicPath = new Dictionary<int, string>();
            var tempThumPath=string.Empty;
            if (index != null && index.Length > 0)
            {
                for (int i = 0; i < index.Length; i++)
                {
                    thumbnailName = thumbnailPath + pdfName + "_" + index[i].ToString() + "jpeg";
                    tempThumPath = thumbnailUrlPath + uid + "/" + pdfName + "_" + index[i].ToString() + "jpeg";//文件虚拟目录
                    if (!File.Exists(thumbnailName))//只创建没有的缩略图
                    {
                        if (PdfToImage.ConvertPDF2Thumbnails(pdfPath, thumbnailPath, pdfName, Convert.ToInt32(index[i]), Convert.ToInt32(index[i]), ImageFormat.Jpeg, PdfToImage.Definition.Two, out pageCount))
                        {
                            flag = true;
                        }
                        else
                        {
                            result = "生成缩略图出错！";
                        }
                    }
                    else
                    {
                        pageCount = PdfToImage.GetPDF2ImageCount(pdfPath);
                    }
                    dicPath.Add(Convert.ToInt32(index[i]), tempThumPath);
                }

                StringBuilder sb = DictionaryToStr(dicPath);
                sb.Remove(sb.Length - 2, 2);
                result = sb.ToString();
            }
        }
        return flag;
    }

    public bool GetImgData(string uid, string pdfPath, string index, out string result, out int pageCount)
    {
        bool flag = false;
        var pdfName = string.Empty;
        result = string.Empty;
        pageCount = 0;

        if (File.Exists(pdfPath))
        {
            pdfName = FileDownload.GetFileNameNoExtend(pdfPath);
            byte[] list = null;
            Dictionary<int, byte[]> dicPath = new Dictionary<int, byte[]>();

            if (index != null && index.Length > 0)
            {
                for (int i = 0; i < index.Length; i++)
                {
                    if (PdfToImage.ConvertPDF2Image(pdfPath, Convert.ToInt32(index[i]), Convert.ToInt32(index[i]), ImageFormat.Jpeg, PdfToImage.Definition.Two, out list, out pageCount))
                    {
                        dicPath.Add(Convert.ToInt32(index[i]), list);
                        flag = true;
                    }
                    else
                    {
                        result = "生成大图出错！";
                    }
                }

                StringBuilder sb = DictionaryToStr(dicPath);
                sb.Remove(sb.Length - 2, 2);//移除末尾的"&&"
            }
        }
        else
        {
            result = "该PDF文件不存在！";
        }

        return flag; 
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
}