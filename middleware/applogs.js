
const fs = require("fs");
const path = require("path")
module.exports = (req,res,next)=>{
         const logData = {
    time: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body,
    session: req.session,
  };

  
  fs.appendFile(
    path.join(__dirname,"../logs/requests.log"),
    JSON.stringify(logData) +"\n",
    err=>{
        if(err){
            
            
        }
    }
  )
  next()

}