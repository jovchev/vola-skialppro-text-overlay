This is intented for Vola SkiAlpPro v11

The script connects to the timing and monitors the events when skier has started of finnished.
Reads from the DB competitors.

The result is written in File that is used as source for the OBS Studio

To execute please use the fllowing syntax
npm start
Optional parameters
--dbLocation
--overlayFile
Example with parameters
npm start --dbLocation=\\10.0.0.1\event001.scdb --overlayFile=c:\obs\ski\file.txt