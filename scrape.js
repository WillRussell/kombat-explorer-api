const parseEventsList = require('./eventParser');
const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");

request(
  "https://www.sherdog.com/organizations/Ultimate-Fighting-Championship-UFC-2",
  (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      const tableRows = $(
        "#events_list #upcoming_tab .event tbody .odd, #events_list #upcoming_tab .event tbody .even"
      );

      const collection = parseEventsList($, tableRows);

      collection.forEach((item, i) => {
      	console.log(item);
      });
    }
  }
);
