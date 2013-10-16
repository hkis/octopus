using System;
using System.Data;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using ifeng.SystemFramework;
using System.Xml.Linq;
using MongoDB;

/// <summary>
///MongoHelper 的摘要说明
/// </summary>
public class MongoHelper
{
    private static string strConn = Config.ReadSetting("ConnectionString", "");
    private static string strDbName = Config.ReadSetting("DBName", "");
    private static string strCollection = Config.ReadSetting("CollectionName", "");

    public MongoHelper()
    {
        //
        //TODO: 在此处添加构造函数逻辑
        //
    }

    /// <summary>
    /// 创建数据库连接
    /// </summary>
    /// <returns></returns>
    public MongoDatabase GetConnection()
    {
        //定义Mongo服务
        Mongo mongo = new Mongo(strConn);
        
        //打开连接
        mongo.Connect();

        //获得数据库，若不存在则创建
        return(mongo.GetDatabase(strDbName) as MongoDatabase);
    }

    public void SaveImgBJson(byte[] byteImg,string uid)
    {
        IMongoCollection iMongoCollection = GetConnection().GetCollection(strCollection);

        Document doc = new Document();
        DateTime dt=DateTime.Now;

        doc["ID"] = uid;
        doc["CreatTime"] = dt;
        doc["Img"] = byteImg;

        iMongoCollection.Insert(doc);
    }

    public byte[] GetImgBJson(string uid)
    {
        //MongoDatabase db = GetConnection();
        //IMongoCollection collection = db.GetCollection(strCollection);
        //ICursor cu= collection.FindAll()
        //collection.FindOne(new Document { { "ID",uid} });
        Document doc = GetConnection().GetCollection(strCollection).FindOne(new Document { { "ID", uid } });
        return doc["Img"] as Binary;
    }
}
