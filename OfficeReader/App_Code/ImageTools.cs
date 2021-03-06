﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using O2S.Components.PDFRender4NET;

/// <summary>
/// ImageTools 的摘要说明
/// </summary>
public class ImageTools
{
	public ImageTools()
	{
		//
		// TODO: 在此处添加构造函数逻辑
		//
	}

    #region 01生成缩略图+static bool ConvertPDF2Thumbnails(string pdfInputPath, string thumbnailsPath,string imageName, int startPageNum, int endPageNum, ImageFormat imageFormat, Definition definition)
    /// <summary>
    /// 生成缩略图
    /// </summary>
    /// <param name="pdfInputPath">PDF文件路径</param>
    /// <param name="thumbnailsPath">缩略图存放路径</param>
    /// <param name="imageName">缩略图名称</param>
    /// <param name="startPageNum">开始页</param>
    /// <param name="endPageNum">结束页</param>
    /// <param name="imageFormat">缩略图格式</param>
    /// <param name="definition">缩略图大小</param>
    /// <returns></returns>
    public static bool ConvertPDF2Thumbnails(string pdfInputPath, string thumbnailsPath,
            string imageName, int startPageNum, int endPageNum, ImageFormat imageFormat, Definition definition,out int pageCount)
    {
        PDFFile pdfFile = PDFFile.Open(pdfInputPath);
        pageCount = pdfFile.PageCount;

        //var directory = thumbnailsPath.Substring(0,thumbnailsPath.LastIndexOf("\\")-1);
        //if (!Directory.Exists(directory))
        //{
        //    Directory.CreateDirectory(directory);
        //}

        // validate pageNum
        if (startPageNum <= 0)
        {
            startPageNum = 1;
        }

        if (endPageNum == 0)
        {
            endPageNum = pdfFile.PageCount;
        }

        if (endPageNum > pdfFile.PageCount)
        {
            endPageNum = pdfFile.PageCount;
        }

        if (startPageNum > endPageNum)
        {
            int tempPageNum = startPageNum;
            startPageNum = endPageNum;
            endPageNum = startPageNum;
        }
        // start to convert each page
        for (int i = startPageNum; i <= endPageNum; i++)
        {
            Bitmap pageImage = pdfFile.GetPageImage(i - 1, 56 * (int)definition);
            //string thumbnails = thumbnailsPath + imageName + "_" + i.ToString() + "." + imageFormat.ToString();
            pageImage.GetThumbnailImage(150, 212, null, new IntPtr()).Save(thumbnailsPath);

            //thumbPath.Append(thumbnailsPath);
            //thumbPath.Append("&");
            //pageImage.Save(imageOutputPath + imageName +"_"+ i.ToString() + "." + imageFormat.ToString(), imageFormat);
            pageImage.Dispose();
        }

        pdfFile.Dispose();
        return true;
    }
    
    #endregion

    #region 02生成图片+static bool ConvertPDF2Image(string pdfInputPath,string imageName, int startPageNum, int endPageNum, ImageFormat imageFormat, Definition definition, out List<byte[]> list)
    /// <summary>
    /// 生成图片
    /// </summary>
    /// <param name="pdfInputPath">pdf源文件路径</param>
    /// <param name="startPageNum">开始页数</param>
    /// <param name="endPageNum">结束页数</param>
    /// <param name="imageFormat">图片格式</param>
    /// <param name="definition">图片大小</param>
    /// <param name="list">输出数据集合</param>
    /// <returns>返回值</returns>
    public static bool ConvertPDF2Image(string pdfInputPath,int startPageNum, int endPageNum, ImageFormat imageFormat, Definition definition, out byte[] list,out int pageCount)
    {
        list = null;
        pageCount = 0;
        PDFFile pdfFile = PDFFile.Open(pdfInputPath);
        pageCount = pdfFile.PageCount;
        //if (!Directory.Exists(thumbnailsPath))
        //{
        //    Directory.CreateDirectory(thumbnailsPath);
        //}

        // validate pageNum
        if (startPageNum <= 0)
        {
            startPageNum = 1;
        }

        if (endPageNum == 0)
        {
            endPageNum = pdfFile.PageCount;
        }

        if (endPageNum > pdfFile.PageCount)
        {
            endPageNum = pdfFile.PageCount;
        }

        if (startPageNum > endPageNum)
        {
            int tempPageNum = startPageNum;
            startPageNum = endPageNum;
            endPageNum = startPageNum;
        }

        // start to convert each page

        for (int i = startPageNum; i <= endPageNum; i++)
        {
            Bitmap pageImage = pdfFile.GetPageImage(i - 1, 56 * (int)definition);
            
            list = BitMapToByte(pageImage);
            pageImage.Dispose();
        }

        pdfFile.Dispose();
        
        return true;
    } 
    #endregion

    #region 03BitMap转换成二进制+static byte[] BitMapToByte(Bitmap bitmap)
    /// <summary>
    /// BitMap转换成二进制
    /// </summary>
    /// <param name="bitmap"></param>
    /// <returns></returns>
    public static byte[] BitMapToByte(Bitmap bitmap)
    {
        //List<byte[]> list = new List<byte[]>();
        MemoryStream ms = null;
        byte[] imgData = null;

        ///重新绘图并指定大小
        int destWidth = 794;
        int destHight = 1122;

        Bitmap newBitmap = new Bitmap(destWidth, destHight);
        using(Graphics g=Graphics.FromImage((Image)newBitmap))
        {
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.DrawImage((Image)bitmap, 0, 0, destWidth, destHight);
            g.Dispose();
        }

        ///

        using (ms = new MemoryStream())
        {
            newBitmap.Save(ms, ImageFormat.Jpeg);
            ms.Position = 0;
            imgData = new byte[ms.Length];
            ms.Read(imgData, 0, Convert.ToInt32(ms.Length));
            ms.Flush();
        }
        //list.Add(imgData);
        return imgData;
    } 
    #endregion

    #region 04Int获取转化后图片总数+static int GetPDF2ImageCount(string pdfInputPath)
    /// <summary>
    /// 获取转化后图片总数
    /// </summary>
    /// <param name="pdfInputPath">PDF文件路径</param>
    /// <returns></returns>
    public static int GetPDF2ImageCount(string pdfInputPath)
    {
        PDFFile pdfFile = PDFFile.Open(pdfInputPath);
        return pdfFile.PageCount;
    } 
    #endregion

    #region 图片大小枚举+enum Definition
    /// <summary>
    /// 图片大小
    /// </summary>
    public enum Definition
    {
        One = 1, Two = 2, Three = 3, Four = 4, Five = 5, Six = 6, Seven = 7, Eight = 8, Nine = 9, Ten = 10
    } 
    #endregion

}