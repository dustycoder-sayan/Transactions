// jshint esversion:6

const crypto = require('crypto');
const express = require('express');
const fs = require("fs");
const objectsToCsv = require("objects-to-csv");
const app = express();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


let generateHash = str => {
    let hash = crypto.createHash('sha256').update(str).digest('hex');
    return hash;
}

let new_file = (name, f, t, a, dt, hash) => {
    const csvWriter = createCsvWriter({
    path: name,
    header: [
        {id: 'from', title:'From'},
        {id: 'to', title:'To'},
        {id: 'amount', title:'Amount'},
        {id: 'dateTime', title: 'Date and Time'},
        {id: 'hc', title:'Hash Code'}
    ]
    });

    const data = [
        {
            from: f,
            to: t,
            amount: a,
            dateTime: dt,
            hc: hash
        }
    ];

    csvWriter.writeRecords(data);
}

let exisiting_file = (name, f, t, a, dt, hash) => {
    list = [[f,t,a,dt,hash]];
    const csv = new objectsToCsv(list);
    csv.toDisk(name, {append:true});
}

let frame_data = (from, to, amount, dt, hashCode) => {
    let fileName1 = "./"+from+"_transactions.csv";
    let fileName2 = "./"+to+"_transactions.csv";
    
    if(fs.existsSync(fileName1))
        exisiting_file(fileName1, from, to, amount, dt, hashCode);
    else
        new_file(fileName1, from, to, amount, dt, hashCode);

    if(fs.existsSync(fileName2))
        exisiting_file(fileName2, from, to, amount, dt, hashCode);
    else
        new_file(fileName2, from, to, amount, dt, hashCode);
}

app.post("/transaction-complete", (req, res) => {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let f = req.body.from;
    let t = req.body.to;
    let a = req.body.amount;

    var str = f+t+a+dateTime;
    var hash = generateHash(str);

    frame_data(f,t,a,dateTime,hash);
    res.sendFile(__dirname+'/public/complete.html');
})

app.get('/', (req, res)=> {
    res.sendFile(__dirname+'/public/index.html');
});

app.listen(3000, ()=>console.log("Server started at Port 3000"));
