const moment = require("moment");
const cheerio = require("cheerio");

module.exports = function (html) {
  const $ = cheerio.load(html);

  const fights = [];

  const baseSelection = $(".event_detail header .header");

  baseSelection
  .find('.section_title h1')
  .find('br')
  .replaceWith(' ');

  const eventName = baseSelection.find('.section_title h1').text();
  const promotion = baseSelection.find('.section_title h2').text();
  const eventMeta = baseSelection.find('.info .authors_info');

  const isoDate = $(eventMeta)
    .find("meta[itemprop='startDate']")
    .attr("content");

  const unixDate = moment(isoDate).valueOf();

  const shortDate = eventMeta.find('.date').text();

  const location = eventMeta.find('.author span').text();

  const mainEvent = $(".fight_card .event .fight");
  mainEvent.find('em').replaceWith(' ');

  const mainEventFighterOne = mainEvent.find('.left_side h3 a').text();
  const mainEventFighterOneRecord = mainEvent.find('.left_side .record').text().trim();
  const mainEventFighterOneResult = mainEvent.find('.left_side .final_result').text().trim();

  const mainEventFighterTwo = mainEvent.find('.right_side h3 a').text();
  const mainEventFighterTwoRecord = mainEvent.find('.right_side .record').text().trim();
  const mainEventFighterTwoResult = mainEvent.find('.right_side .final_result').text().trim();

  const mainEventFightName = $("section[itemprop='subEvent']")
    .find("meta[itemprop='name']")
    .attr("content");

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
    ".event_match .table table tbody .odd, .event_match .table table tbody .even"
  );

  underCardFights.each((i, tableRow) => {
    const fightName = $(tableRow)
      .find("meta[itemprop='name']")
      .attr("content");

    const fighterOne = $(tableRow).find(".text_right");
    const fighterOneName = $(fighterOne).find("a span").text();
    const fighterOneRecord = $(fighterOne).find(".record").text();
    const fighterOneResult = $(fighterOne).find(".final_result").text();

    const fighterTwo = $(tableRow).find(".text_left");
    const fighterTwoName = $(fighterTwo).find("a span").text();
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
