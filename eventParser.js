const moment = require("moment");

module.exports = function ($, data) {
  const list = [];

  data.each((i, tableRow) => {
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

    const eventObj = {
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

    list.push(eventObj);
  });

  return list;
}
