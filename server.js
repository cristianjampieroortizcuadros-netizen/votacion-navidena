const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const rateLimit = require("express-rate-limit");
const app = express();
app.use(express.json({limit:"10kb"}));
app.use(express.static(path.join(__dirname,"public")));
const dbPath = process.env.DB_PATH || path.join(__dirname,"votes.sqlite");
fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS votes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 voter_token TEXT NOT NULL UNIQUE,
 option_id INTEGER NOT NULL CHECK(option_id BETWEEN 1 AND 3),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
const limiter = rateLimit({windowMs:60000,limit:20,standardHeaders:"draft-7",legacyHeaders:false});
app.get("/api/results",(req,res)=>{
 const rows=db.prepare("SELECT option_id, COUNT(*) AS votes FROM votes GROUP BY option_id").all();
 const counts=[1,2,3].map(id=>rows.find(r=>r.option_id===id)?.votes||0);
 const total=counts.reduce((a,b)=>a+b,0);
 res.json({counts,total,percentages:counts.map(n=>total?Math.round(n*1000/total)/10:0)});
});
app.post("/api/vote",limiter,(req,res)=>{
 const {optionId,voterToken}=req.body||{};
 if(![1,2,3].includes(Number(optionId))||typeof voterToken!=="string"||voterToken.length<20||voterToken.length>100)
  return res.status(400).json({error:"Selección no válida. Inténtalo nuevamente."});
 try{
  db.prepare("INSERT INTO votes (voter_token,option_id) VALUES (?,?)").run(voterToken,Number(optionId));
  res.json({ok:true});
 }catch(err){
  if(String(err.code).includes("SQLITE_CONSTRAINT"))return res.status(409).json({error:"Este dispositivo ya registró un voto."});
  console.error(err);res.status(500).json({error:"No se pudo guardar el voto."});
 }
});
const port=process.env.PORT||3000;
app.listen(port,"0.0.0.0",()=>console.log("Votación lista en puerto "+port));