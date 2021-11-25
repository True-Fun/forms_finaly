//подключаемые библиотеки
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs= require('fs');
const http = require("http");
const multer  = require("multer");
const urlencodedParser = express.urlencoded({extended: false});
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require( 'bcrypt' );
// создаем соль для шифрования пароля
var salt = bcrypt.genSaltSync(10);
//замены ссылки на папку
app.use('/form', express.static('form'));
app.use('/form2', express.static('form2'));
app.use('/views', express.static('views'));

//подключение файла ejs
app.set('view engine', 'ejs');

app.use(multer({dest:"form2"}).single("foto"));
//указание папки и имени элемента в файле html для взятия файла


//массив объектов, хранящий информацию о записях в БД
var dataRes= Array();

//добавление нового пользователя
function addUser(login,mail,number,pass){
  //шифрование пароля

  let SecPass = bcrypt.hashSync(pass, salt);
    //подключение к БД
    const db = new sqlite3.Database('userserver.db', sqlite3.OPEN_READWRITE, (err) =>
    {
        if(err)
            return console.error(err.message);
        console.log("подключение к базе установлено");
    } );
    //Выполнение запроса sql
    const sql=`INSERT INTO form1 (login,email,phone,password)
                VALUES(?,?,?,?)`;
    db.run(sql, [login,mail,number,SecPass], (err) =>{
        if (err)
            return console.error(err.message);
    console.log("Запрос выполнен");
    });

    db.close((err) =>{
        if(err)
        return console.error(err.message);
    });
}

//основная функция, отвечающая за работу сервера
function createServer(){

//При переходе по данной ссылке прогружаются нужные страницы
  app.get("/form1", function (request, response) {
      response.sendFile(__dirname + "/form/form1.html");
  });
  app.get("/form2", function (request, response) {
      response.sendFile(__dirname + "/form/form2.html");
  });

  app.get("/form3", function (request, response) {
      readMessage();
      response.render('\eform3', {dataRes:  dataRes});
  });
// Получение данных с форм
  app.post("/form2", urlencodedParser, function (request, response,next) {

      if(!request.body) return response.sendStatus(400);

            let login=request.body.login;
            let mail=request.body.mail;
            let header=request.body.header;
            let message=request.body.message;
            let foto=request.file;
            addMessage(login,mail,header,message,foto.filename);
            response.sendFile(__dirname + "/form/form2.html");
        });

    app.post("/form1", urlencodedParser, function (request, response,next) {

        if(!request.body) return response.sendStatus(400);
        console.log(request.body);
      let login=request.body.login;
      let mail=request.body.mail;
      let number=request.body.number;
      let pass=request.body.pass;

      addUser(login,mail,number,pass,);
      response.sendFile(__dirname + "/form/form1.html");
  });
}
//добавление данных сообщения в БД
function addMessage(login,mail,header,message,foto){

  const db = new sqlite3.Database('userserver.db', sqlite3.OPEN_READWRITE, (err) =>
  {
      if(err)
          return console.error(err.message);
      console.log("подключение к базе установлено");
  } );
  const sql=`INSERT INTO form2 (login,email,avatar,header,text)
              VALUES(?,?,?,?,?)`;
  db.run(sql, [login,mail,foto,header,message], (err) =>{
      if (err)
          return console.error(err.message);
  console.log("Запрос выполнен");
  });

  db.close((err) =>{
      if(err)
      return console.error(err.message);
  });
}
//Чтение данных сообщения из БД
function readMessage(){

  const db = new sqlite3.Database('userserver.db', sqlite3.OPEN_READONLY, (err) =>
  {
    if(err)
        return console.error(err.message);
    console.log("подключение к базе установлено");
  } );

  const sql=`SELECT * FROM form2`;
  db.all(sql, [], (err,result) =>{
    if (err)
        return console.error(err.message);
  console.log("Запрос на прочтение данных выполнен");
//Получение всех записей из БД
  for(var i=0;i < result.length;i++)
  {
    //dataRes-глобальная переменная
    dataRes[i]=result[i];
  }

  });
  db.close((err) =>{
    if(err)
      return console.error(err.message);
  });


}
 readMessage();//Считывание данных
createServer();//Основная функция, запуск всех страниц

//Запуск сервера
app.listen(3000, ()=>console.log("Сервер запущен..."));
