using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;

/// <summary>
/// FileDownload 的摘要说明
/// </summary>
public class FileDownload
{
	public FileDownload()
	{
		//
		// TODO: 在此处添加构造函数逻辑
		//
	}

    public static string Download(string uid,string url,string targetPath)
    { 
        var result=string.Empty;
        HttpWebRequest request = null;
        HttpWebResponse response = null;
        Stream reader = null;
        Stream writer = null;

        if (!string.IsNullOrEmpty(url))
        {
            try
            {
                request = (HttpWebRequest)HttpWebRequest.Create(url);
                response = (HttpWebResponse)request.GetResponse();
                reader = response.GetResponseStream();
                targetPath = string.Format("{0}{1}{2}", targetPath, "\\", uid);
                var fileName = GetFileName(url);
                if (!Directory.Exists(targetPath))
                {
                    Directory.CreateDirectory(targetPath);
                }
                fileName = targetPath + "\\" + fileName;
                writer = new FileStream(fileName, FileMode.Create);
                byte[] container = new byte[10*1024];
                var size = reader.Read(container, 0, container.Length);
                while (size > 0)
                {
                    writer.Write(container, 0, container.Length);
                }
                result = fileName;
                writer.Close();
                reader.Close();
                response.Close();
                request.Abort();
            }
            catch (Exception ex)
            {

            }
            finally
            {
                if (response != null)
                {
                    try
                    {
                        response.Close();
                    }
                    catch(Exception ex)
                    {
                        throw ex;
                    }
                    response = null;
                }
                if (reader != null)
                {
                    try
                    {
                        reader.Close();
                    }
                    catch (Exception ex) { }
                    reader = null;
                }
                if (writer != null)
                {
                    try
                    {
                        writer.Close();
                    }
                    catch (Exception ex) { }
                    writer = null;
                }
                if (request != null)
                {
                    try
                    {
                        request.Abort();
                    }
                    catch (Exception ex) { }
                    request = null;
                }
            }
        }
        return result;
    }

    public static string GetFileName(string url)
    {
        string Name = string.Empty;
        if (!string.IsNullOrEmpty(url) && url.Length > 0)
        {
            int i = url.LastIndexOf("/") + 1;
            Name = url.Substring(i);
            //int end = Name.LastIndexOf(".") - 1;
            //Name = Name.Substring(0, end);
        }
        return Name;
    }

    public static string GetFileNameNoExtend(string url)
    {
        string Name = string.Empty;
        if (!string.IsNullOrEmpty(url) && url.Length > 0)
        {
            int i = url.LastIndexOf("/") + 1;
            Name = url.Substring(i);
            int end = Name.LastIndexOf(".") - 1;
            Name = Name.Substring(0, end);
        }
        return Name;
    }
}