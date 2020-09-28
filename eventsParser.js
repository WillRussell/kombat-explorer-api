const moment = require("moment");
const cheerio = require("cheerio");
const crypto = require("crypto");

module.exports = function (html) {
  const $ = cheerio.load(html);

  const tableRows = $(
    "#events_list #upcoming_tab .event tbody .odd, #events_list #upcoming_tab .event tbody .even"
  );

  const events = [];

  tableRows.each((i, tableRow) => {
    const isoDate = $(tableRow)
      .find("meta[itemprop='startDate']")
      .attr("content");

    const unixDate = moment(isoDate).valueOf();

    const datetableRow = $(tableRow).find(".date");

    const month = $(datetableRow)
      .find(".month")
      .text();

    const day = $(datetableRow)
      .find(".day")
      .text();

    const year = $(datetableRow)
      .find(".year")
      .text();

    const eventName = $(tableRow)
      .find("a[itemprop^='url'] span")
      .text();

    const eventNameArray = eventName.split("-");

    const eventTitle = eventNameArray[0];
    
    const eventSubTitle = eventNameArray[eventNameArray.length - 1].trim();

    const eventLocation = $(tableRow)
      .find("td[itemprop='location']")
      .text()
      .trim();

    const eventUrl = $(tableRow)
      .find("td a[itemprop='url']")
      .attr('href');

    const md5sum = crypto.createHash('md5').update(eventUrl);
    
    const eventId = md5sum.digest('hex');

    const eventObj = {
      id: eventId,
      name: eventName,
      title: eventTitle,
      subtitle: eventSubTitle,
      location: eventLocation,
      isoDate: isoDate,
      unixDate: unixDate,
      month: month,
      day: day,
      year: year,
      eventUrl: eventUrl,
    };

    events.push(eventObj);
  });

  return events;
}
