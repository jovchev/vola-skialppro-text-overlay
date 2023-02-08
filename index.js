var net = require('net');
const sqlite3 = require('sqlite3').verbose();

const fileName = "c:/Projects/ski/skier.txt"
const dbLocation = 'C:/SkiAlpPro/Events/Event001.scdb'

var skiers = {}

let db = new sqlite3.Database(dbLocation, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.serialize(() => {
    db.each(`SELECT C_NUM as bib,
                    C_FIRST_NAME as first_name,
                    C_LAST_NAME as last_name,
                    C_YEAR as year,
                    C_CATEGORY as category
             FROM TCOMPETITORS`, (err, row) => {
      if (err) {
        console.error(err.message);
      }
      skiers[row.bib] = {Name: row.first_name + ' ' + row.last_name, Year: row.year, Category:row.category}
      
      console.log(row.bib + "\t" + row.first_name + "\t" + row.last_name);
    });
  });
  
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

//exit();



var client = new net.Socket();
const fs = require('fs');

client.connect(5409, '127.0.0.1', function() {
	console.log('Connected to timing machine');
});

client.on('data', function(data) {

    var str = data.toString()
    if (str.startsWith("NR;"))
    {
        var timing = str.split(';')
        var bib = timing[3]
        var status = timing[1]
        var skier = skiers[bib]
        var runTime = timing[6]
        var content = ""
        if (status === '0'){
            skier.StartTime = SkiToSecondsDec(runTime)
            content = "[" + bib + "] " + skier.Name 
        }
        else {
            skier.EndTime = SkiToSecondsDec(runTime)
            content = "[" + bib + "] " + skier.Name + " --- " + (skier.EndTime - skier.StartTime).toFixed(2);
        }
        console.log(content)
        fs.writeFile(fileName, content, { flag: 'w+' }, err => {});
        //console.log(str);

    }
        
});

client.on('close', function() {
	console.log('Connection closed');
});

function SkiToSecondsDec(duration)
{
    return parseFloat(SkiToTime(duration))
}

function SkiToTime(duration)
{
    var ms = duration.slice(-6)
    var seconds = duration.slice(0, duration.length-6)
    return seconds + "." + ms
}