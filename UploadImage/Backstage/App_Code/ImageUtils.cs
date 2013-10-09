using System;
using System.Data;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Xml.Linq;
using System.Drawing;
using System.Drawing;
using System.Drawing.Drawing2D;

/// <summary>
///ImageUtils 的摘要说明
/// </summary>
public class ImageUtils
{
    public ImageUtils()
    {

    }

    /// <summary>
    /// 图片切割
    /// </summary>
    /// <param name="oldImage">原图</param>
    /// <param name="width">高</param>
    /// <param name="height">款</param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <returns></returns>
    public  Bitmap CutBitmap(Image oldImage, int width, int height, int x, int y)
    {
        if (oldImage == null)
            throw new ArgumentNullException("oldImage");
        
        Bitmap newBitmap = new Bitmap(width, height);
        using (Graphics g = Graphics.FromImage(newBitmap))
        {
            g.InterpolationMode = InterpolationMode.High;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.DrawImage(oldImage, new Rectangle(0, 0, width, height), new Rectangle(x, y, width, height), GraphicsUnit.Pixel);
            g.Save();
            g.Dispose();
        }
        return newBitmap;
    }

    /// <summary>
    /// 图片缩放截图
    /// </summary>
    /// <param name="imgToResize">原图</param>
    /// <param name="size">尺寸</param>
    /// <returns>返回值</returns>
    public  Image ResizeImage(Image imgToResize, Size size)
    {
        int sourceWidth = imgToResize.Width;
        int sourceHeight = imgToResize.Height;

        float nPercent = 0;
        float nPercentW = 0;
        float nPercentH = 0;

        nPercentW = ((float)size.Width / (float)sourceWidth);
        nPercentH = ((float)size.Height / (float)sourceHeight);

        if (nPercentH < nPercentW)
        {
            nPercent = nPercentH;
        }
        else
        {
            nPercent = nPercentW;
        }

        int destWidth = (int)(sourceWidth * nPercent);
        int destHeight = (int)(sourceHeight * nPercent);

        Bitmap newBitMap = new Bitmap(destWidth, destHeight);
        using (Graphics g = Graphics.FromImage((Image)newBitMap))
        {
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.DrawImage(imgToResize, 0, 0, destWidth, destHeight);
            g.Dispose();
        }
        return (Image)newBitMap;
    }
}
