using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebOS.PdfReader.BLL;
using WebOS.PdfReader.Model.PdfFileMangr;

public partial class Test : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        UserPdfFileInfo pdf = new UserPdfFileInfo();
        BllPdfFileInfoMangr bpfm = new BllPdfFileInfoMangr();
        var msg=string.Empty;

        pdf.createTime = DateTime.Now;
        pdf.pdfFileAuthor = "xia";
        pdf.pdfFileName = "xia.pdf";
        pdf.pdfFileID = Guid.NewGuid().ToString();

        if (!bpfm.AddPdfFileInfo(pdf,out msg))
        {
            var x = msg;
        }
    }
}