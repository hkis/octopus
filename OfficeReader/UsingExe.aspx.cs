using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Diagnostics;

public partial class UsingExe : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            Process p = new Process();
            string path = Server.MapPath("~/runnable/WebOS.PdfReader.DocToImage.Exe.exe");
            p.StartInfo.FileName = path;
            p.StartInfo.Arguments = "http://localhost/doc/1.ppt";

            Response.Write(path);

            //p.StartInfo.UseShellExecute = true;
            p.Start();
        }
        catch (Exception ee)
        {
            Response.Write(ee.Message);
        }


    }
}