const moment = require("moment");
const cheerio = require("cheerio");
const { encrypt, md5sum } = require("./encryption-utils.js");
const parseLocation = require("./locationParser");

module.exports = function (html) {
  const $ = cheerio.load(html);

  const tableRows = $(
    "#events_list #upcoming_tab .event tbody tr[itemScope='']"
  );

  const events = [];

  tableRows.each((i, tableRow) => {
    const isoDate = $(tableRow)
      .find("meta[itemprop='startDate']")
      .attr("content");

    const unixDate = moment(isoDate).valueOf();

    const datetableRow = $(tableRow).find(".calendar-date");

    const month = $(datetableRow)
      .find("div:nth-child(1)")
      .text();

    const day = $(datetableRow)
      .find("div:nth-child(2)")
      .text();

    const year = $(datetableRow)
      .find("div:nth-child(3)")
      .text();

    const eventName = $(tableRow)
      .find("a[itemprop^='url'] span")
      .text();

    const eventNameArray = eventName.split("-");

    const eventTitle = eventNameArray[0].trim();
    
    const eventSubTitle = eventNameArray[eventNameArray.length - 1].trim();

    const eventLocation = $(tableRow)
      .find("td[itemprop='location']")
      .text()
      .trim();

    const locationDetails = parseLocation(eventLocation);

    const eventUrl = $(tableRow)
      .find("td a[itemprop='url']")
      .attr('href');

    const eventId = md5sum(eventUrl);
    const resourceId = encrypt(eventUrl);

    const eventObj = {
      id: eventId,
      resourceId: resourceId,
      name: eventName,
      title: eventTitle,
      subtitle: eventSubTitle,
      location: eventLocation,
      isoDate: isoDate,
      unixDate: unixDate,
      month: month,
      day: day,
      year: year,
      locationDetails: locationDetails,
    };

    events.push(eventObj);
  });

  return events;
}
