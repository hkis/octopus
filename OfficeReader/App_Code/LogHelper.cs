using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using log4net;

/// <summary>
/// LogHelper 的摘要说明
/// </summary>
public static class LogHelper
{
    public static ILog GetLogger<T>()
    {
        return LogManager.GetLogger(typeof(T));
    }
}