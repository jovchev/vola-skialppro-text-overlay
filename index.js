var net = require("net");
const sqlite3 = require("sqlite3").verbose();

var arguments = process.argv;
const dbLocation =
  process.env.npm_config_dbLocation || "C:/SkiAlpPro/Events/Event036.scdb";
const fileName =
  process.env.npm_config_overlayFile || "c:/Projects/ski/skier.txt";
const fileOnTrack =
  process.env.npm_config_fileOnTrack || "c:/projects/ski/onTrack.txt";
const fileOnStart =
  process.env.npm_config_fileOnStart || "c:/projects/ski/onStart.txt";
const timingHost = process.env.npm_config_timingHost || "127.0.0.1";

console.log("db:" + dbLocation);
console.log("overlay file:" + fileName);

var skiers = {};

let db = new sqlite3.Database(dbLocation, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the chinook database.");
});

db.serialize(() => {
  db.each(
    `SELECT C_NUM as bib,
                    C_FIRST_NAME as first_name,
                    C_LAST_NAME as last_name,
                    C_YEAR as year,
                    C_CATEGORY as category
             FROM TCOMPETITORS`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      }
      skiers[row.bib] = {
        Name: row.first_name + " " + row.last_name,
        Year: row.year,
        Category: row.category,
      };

      console.log(
        row.bib +
          "\t" +
          row.first_name +
          "\t" +
          row.last_name +
          "\t" +
          row.category
      );
    }
  );
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});

//exit();

var client = new net.Socket();
const fs = require("fs");
const { exit } = require("process");

client.connect(5409, timingHost, function () {
  console.log("Connected to timing machine");
});

var state = "";
var onTheStart = "";
var onTheTrack = "";
client.on("data", function (data) {
  var str = data.toString();

  console.log("data----");
  console.log(str);
  console.log("edata----");

  if (state === "skipNext") {
    state = "";
    return;
  }
  if (str.startsWith("IR;")) {
    state = "skipNext";
    return;
  }

  if (str.startsWith("S;0;1;")) {
    var t = str.split("\n");
    onTheStart = t[0]
      .split(";")
      .filter((element) => element)
      .slice(3)
      .map((e) => "[" + e + "] " + skiers[e].Name)
      .join("\n");
    fs.writeFile(fileOnStart, onTheStart, { flag: "w+" }, (err) => {});
    onTheTrack = t[1]
      .split(";")
      .filter((element) => element)
      .slice(3)
      .map((e) => "[" + e + "] " + skiers[e].Name)
      .join("\n");
    fs.writeFile(fileOnTrack, onTheTrack, { flag: "w+" }, (err) => {});
    console.log("On start:" + onTheStart);
    console.log("On track:" + onTheTrack);
    return;
  }
  if (str.startsWith("NR;")) {
    var timing = str.split(";");
    var bib = timing[3];
    var status = timing[1];
    var skier = skiers[bib];
    var runTime = timing[6];
    var content = "";
    if (status === "0") {
      skier.StartTime = SkiToSecondsDec(runTime);
      content = "[" + bib + "] " + skier.Name;
    } else {
      skier.EndTime = SkiToSecondsDec(runTime);
      content =
        "[" +
        bib +
        "] " +
        skier.Name +
        " --- " +
        (skier.EndTime - skier.StartTime).toFixed(2);
    }
    console.log(content);
    fs.writeFile(fileName, content, { flag: "w+" }, (err) => {});
    //console.log(str);
  }
});

client.on("close", function () {
  console.log("Connection closed");
});

function SkiToSecondsDec(duration) {
  return parseFloat(SkiToTime(duration));
}

function SkiToTime(duration) {
  var ms = duration.slice(-6);
  var seconds = duration.slice(0, duration.length - 6);
  return seconds + "." + ms;
}
