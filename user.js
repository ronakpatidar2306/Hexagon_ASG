// const http = require('http');
const fs = require('fs');
let pg = require('pg');
 
const bcrypt = require('bcrypt');
const saltRounds = 10;
let db={};
const conn = new pg.Client({
  user: "postgres",
  host:"localhost",
  database :"userdb",
  password:"Ronak@68",
  port :5432
})
 
conn.connect();

function requestListner (req ,res)  {
  console.log(req.url,req.method);

  res.setHeader('Content-Type','text/html');
  if(req.url === '/'){
    res.write(`<html>
    <head><title>Registration Page</title></head>
    <body>
        <h1> Enter your name</h1>
        <form action="/submit-details" method="POST">
            <label for="username">Username</label>
            <input type="text" id="name" name="username" placeholder="Enter you name">
            <br>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter you password">
            <br>
            <input type="submit" value = "Submit">
        </form>
    </form>
    <a href="/login"> Already a user</a>

    </body>
     </html>`);


    return res.end();
  }
  else if(req.url.toLowerCase() === '/login'){
    res.write(`<html>
      <body>
      <h1>Login page</h1>
      <form action="/submit" method="POST">
        <label for="username">Username</label>
            <input type="text" id="name" name="username" placeholder="Enter you name">
            <br>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter you password">
            <br>
            <input type="submit" value = "Submit">
      </form>
    </body>
    </html>
      `);
    return res.end();

  }
  else if(req.url.toLowerCase() === '/submit' && req.method =="POST"){

    const body=[];
    req.on('data',chunk =>{
      console.log(chunk);
      body.push(chunk);
    })
    req.on('end', async ()=>{
      const fullbody = Buffer.concat(body).toString();
      console.log(fullbody);

      const param = new URLSearchParams(fullbody);  
      const bodyObject={};
      for( const [key,val] of param.entries()){
        bodyObject[key] = val;
      }
      

      const result = await conn.query(
        `SELECT password FROM reg WHERE username = $1`,[bodyObject.username]);

      if (result.rows.length === 0) {
        res.write("<h1>User not found</h1>");
        return res.end();
      }
      
      const hashedPassword = result.rows[0].password;
      bcrypt.compare(bodyObject.password, hashedPassword, function(err, result) {
        if(err) {
            console.error(err);
            res.write("Server error");
            return res.end();
        }
    
        if(result === true){ 
            res.write(`<html>
                <body>
                  <h1>Welcome ${bodyObject.username}</h1>
                </body>
            </html>`);
        } else {
            res.write(`<html>
                <body>
                  <h1>Wrong username or password</h1>
                </body>
            </html>`);
        }
        res.end();  
    });
    
    })
     
  }
  else if(req.url.toLowerCase() === "/submit-details" && req.method == "POST"){
    console.log(req.url,req.method);
    res.statusCode = 302;

    const body=[];
    req.on('data',chunk =>{
      console.log(chunk);
      body.push(chunk);
    })
    req.on('end', ()=>{
      const fullbody = Buffer.concat(body).toString();

      const param = new URLSearchParams(fullbody);  
      const bodyObject={};
      for( const [key,val] of param.entries()){
        bodyObject[key] = val;
      }
      console.log(bodyObject.username);
      
      bcrypt.hash(bodyObject.password, saltRounds, function(err, hash) {
        db[bodyObject.username]=hash;
        conn.query(`INSERT INTO reg (username,password) VALUES ('${bodyObject.username}', '${hash}')`);
      });
       
    })
    res.setHeader('Location','/');
    return res.end();
  }
  else{
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head><title>Hexagon ASG</title></head>');
    res.write('<body><h1>  404 : page not found</h1></body>');

    res.write('/<html>');
    res.end();
  }
   
}

 

module.exports = requestListner;  