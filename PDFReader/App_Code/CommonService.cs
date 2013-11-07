using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using ifeng.SystemFramework;

/// <summary>
/// CommonService 的摘要说明
/// </summary>
public class CommonService
{
	public CommonService()
	{
	}

    #region 01获取文件名+static string GetFileName(string fileName)
    /// <summary>
    /// 获取文件名
    /// </summary>
    /// <param name="fileName">文件名(含路径)</param>
    /// <returns></returns>
    public static string GetFileName(string fileName)
    {
        string Name = string.Empty;
        if (!string.IsNullOrEmpty(fileName) && fileName.Length > 0)
        {
            int i = fileName.LastIndexOf("\\") + 1;
            Name = fileName.Substring(i);
            int end = Name.LastIndexOf(".") - 1;
            Name = Name.Substring(0, end);
        }
        return Name;
    }
    #endregion

    #region 02获取文件扩展名+static string GetExtension(string fileName)
    /// <summary>
    /// 获取文件扩展名
    /// </summary>
    /// <param name="fileName">文件路径</param>
    /// <returns>扩展名</returns>
    public static string GetExtension(string fileName)
    {
        string Name = string.Empty;
        if (!string.IsNullOrEmpty(fileName) && fileName.Length > 0)
        {
            int i = fileName.LastIndexOf(".") + 1;
            Name = fileName.Substring(i);
        }
        return Name;
    }
    #endregion

    #region 03移动文件+static bool MoveFile(string strSrcFileName, string strDstFileName)
    /// <summary>
    /// 移动文件
    /// </summary>
    /// <param name="strSrcFileName">源文件</param>
    /// <param name="strDstFileName">目标文件</param>
    /// <returns></returns>
    public static bool MoveFile(string strSrcFileName, string strDstFileName)
    {
        if (File.Exists(strSrcFileName) == false) return false;

        int i = strDstFileName.LastIndexOf("\\") + 1;
        string path = strDstFileName.Substring(0, i);
        if (Directory.Exists(path) == false)
        {
            try
            {
                Directory.CreateDirectory(path);
            }
            catch (Exception ex)
            {
                LogErr("创建目录失败：" + path + " " + ex.ToString());
                return false;
            }
        }

        try
        {
            DeleteFile(strDstFileName);
            File.Move(strSrcFileName, strDstFileName);
        }
        catch (Exception ex1)
        {
            LOGInfo("移动文件失败：From " + strSrcFileName + " to " + strDstFileName + " " + ex1.ToString());
            return false;
        }
        return true;

    }// 移动文件 
    #endregion

    #region 04删除文件+static bool DeleteFile(string strFileName)
    /// <summary>
    /// 删除文件
    /// </summary>
    /// <param name="strFileName">文件名</param>
    /// <returns></returns>
    public static bool DeleteFile(string strFileName)
    {
        if (!File.Exists(strFileName)) return true;
        try
        {
            File.Delete(strFileName);
        }
        catch (Exception ex1)
        {
            LogErr("删除文件失败：" + strFileName + " " + ex1.ToString());
            return false;
        }
        return true;

    }// 删除文件 
    #endregion

    #region 05过滤器+static bool CheckFileter(string strFileName, string sourceFileter)
    /// <summary>
    /// 过滤器
    /// </summary>
    /// <param name="fileName"></param>
    /// <returns></returns>
    public static bool CheckFileter(string strFileName, string sourceFileter)
    {
        bool result = false;
        string[] fileters = sourceFileter.Split(';');
        StringBuilder sb = new StringBuilder();
        sb.Append(".");
        sb.Append(GetExtension(strFileName));
        foreach (string var in fileters)
        {
            if (var.ToLower() == sb.ToString().ToLower() && sb.Length > 1)
            {
                result = true;
            }
        }
        return result;
    }
    #endregion

    #region 06创建目录+static bool CreateDir4File(string strFileName)
    /// <summary>
    /// 创建目录
    /// </summary>
    /// <param name="strFileName"></param>
    /// <returns></returns>
    public static bool CreateDir4File(string strFileName)
    {
        int i = strFileName.LastIndexOf("\\") + 1;
        string path = strFileName.Substring(0, i);
        if (Directory.Exists(path) == false)
        {
            try
            {
                Directory.CreateDirectory(path);
            }
            catch (Exception ex)
            {
                LogErr("创建目录失败：" + path + " " + ex.ToString());
                return false;
            }
        }
        return true;

    }// 创建文件目录 
    #endregion

    #region 07写日志+static void LOGInfo(string strInfo)
    /// <summary>
    /// 写日志(记录正常日志信息)
    /// </summary>
    /// <param name="strInfo"></param>
    public static void LOGInfo(string strInfo)
    {
        ApplicationLog.WriteInfo(strInfo);
    }
    #endregion

    #region 08记录错误日志+static void LogErr(string strInfo)
    /// <summary>
    /// 记录错误日志
    /// </summary>
    /// <param name="strInfo"></param>
    public static void LogErr(string strInfo)
    {
        ApplicationLog.WriteError(strInfo);
    }
    #endregion
}