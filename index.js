var net = require('net');

var client = new net.Socket();
client.connect(5409, '127.0.0.1', function() {
	console.log('Connected');
	client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
    /// 720 60000000
    /// 36  60000000
    /// 1s.11 =     1110000
    /// 2s.11 =     2110000
    /// 1m2s.11 =  62110000
    var str = data.toString()
    if (str.startsWith("NR;"))
    {
        var timing = str.split(';')
        var bib = timing[3]
        var status = timing[1]
        var runTime = timing[6]
        console.log(str)
        console.log("Bib: " + bib + " status: " + status + " time " + SkiToTime(runTime))

    }
        
});

client.on('close', function() {
	console.log('Connection closed');
});

function SkiToTime (duration)
{
    var ms = duration.slice(-6)
    var seconds = duration.slice(0, duration.length-6)
    return sToTime(seconds) + "." + ms
}

function sToTime(duration) {
    var seconds = Math.floor((duration) % 60),
      minutes = Math.floor((duration / 60) % 60),
      hours = Math.floor((duration /(60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds;
  }