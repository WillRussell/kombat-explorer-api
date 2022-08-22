const moment = require("moment");
const cheerio = require("cheerio");

module.exports = function (html) {
  const $ = cheerio.load(html);

  const fights = [];

  const baseSelection = $(".event_detail div");

  const eventName = baseSelection.find('h1 span[itemprop="name"]').text();
  const promotion = baseSelection.find('.organization').text();
  const eventMeta = baseSelection.find('.info');

  const isoDate = $(eventMeta)
    .find("meta[itemprop='startDate']")
    .attr("content");

  const unixDate = moment(isoDate).valueOf();

  const shortDate = $(eventMeta).find("span:nth-child(1)").text();

  const location = eventMeta.find('span[itemprop="location"]').text();

  const mainEvent = $(".fight_card");
  mainEvent.find('fighter span em').replaceWith(' ');

  const mainEventFighterOne = mainEvent.find('.left_side a').text().trim();
  const mainEventFighterOneRecord = mainEvent.find('.left_side .record').text().trim();
  const mainEventFighterOneResult = mainEvent.find('.left_side .final_result').text().trim();

  const mainEventFighterTwo = mainEvent.find('.right_side h3 a').text().trim();
  const mainEventFighterTwoRecord = mainEvent.find('.right_side .record').text().trim();
  const mainEventFighterTwoResult = mainEvent.find('.right_side .final_result').text().trim();

  const mainEventFightName = $(".event_detail div h1 span[itemprop='name']").text().trim();

  fights.push({
    fightName: mainEventFightName,
    fighterOne: {
      name: mainEventFighterOne,
      record: mainEventFighterOneRecord,
      result: mainEventFighterOneResult,
    },
    fighterTwo: {
      name: mainEventFighterTwo,
      record: mainEventFighterTwoRecord,
      result: mainEventFighterTwoResult,
    },
  });

  const underCardFights = $(
    ".new_table_holder .new_table tbody tr[itemProp='subEvent']"
  );

  underCardFights.each((i, tableRow) => {
    const fightName = $(tableRow)
      .find("meta[itemprop='name']")
      .attr("content");

    const fighterOne = $(tableRow).find(".text_right");
    fighterOne.find('br').replaceWith(' ');

    const fighterOneName = $(fighterOne).find("a span[itemProp='name']").text();
    const fighterOneRecord = $(fighterOne).find(".record").text();
    const fighterOneResult = $(fighterOne).find(".final_result").text();

    const fighterTwo = $(tableRow).find(".text_left");
    fighterTwo.find('br').replaceWith(' ');

    const fighterTwoName = $(fighterTwo).find("a span[itemProp='name']").text();
    const fighterTwoRecord = $(fighterTwo).find(".record").text();
    const fighterTwoResult = $(fighterTwo).find(".final_result").text();
  
    fights.push({
      fightName,
      fighterOne: {
        name: fighterOneName,
        record: fighterOneRecord,
        result: fighterOneResult,
      },
      fighterTwo: {
        name: fighterTwoName,
        record: fighterTwoRecord,
        result: fighterTwoResult,
      },
    });
  });

  return { eventName, promotion, unixDate, isoDate, shortDate, location, fights };
}
