const moment = require("moment");
const cheerio = require("cheerio");
const { isEmpty } = require("lodash");
const parseLocation = require("./locationParser");

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

  const locationDetails = parseLocation(location);

  const mainEvent = $(".fight_card");
  mainEvent.find('fighter span em').replaceWith(' ');

  const getFighterRecord = (fighter) => fighter.find(".record").text().trim();
  const getFighterResult = (fighter) => fighter.find(".final_result").text().trim();

  const mainEventFighterOne = mainEvent.find(".left_side");
  const mainEventFighterOneName = mainEventFighterOne.find("a").text().trim();
  const mainEventFighterOneRecord = getFighterRecord(mainEventFighterOne);
  const mainEventFighterOneResult = getFighterResult(mainEventFighterOne);

  const mainEventFighterTwo = mainEvent.find(".right_side");
  const mainEventFighterTwoName = mainEventFighterTwo.find("h3 a").text().trim();
  const mainEventFighterTwoRecord = getFighterRecord(mainEventFighterTwo);
  const mainEventFighterTwoResult = getFighterResult(mainEventFighterTwo);

  const mainEventFightName = $(".event_detail div h1 span[itemprop='name']").text().trim();

  const hasMainEvent =
    !isEmpty(mainEventFighterOneName) && !isEmpty(mainEventFighterOneName);

  fights.push({
    fightName: mainEventFightName,
    fighterOne: {
      name: mainEventFighterOneName,
      record: mainEventFighterOneRecord,
      result: mainEventFighterOneResult,
    },
    fighterTwo: {
      name: mainEventFighterTwoName,
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
    const fighterTwo = $(tableRow).find(".text_left");

    fighterOne.find('br').replaceWith(' ');
    fighterTwo.find('br').replaceWith(' ');

    const getFighterDetails = (fighter) => {
      const name = $(fighter).find("a span[itemProp='name']").text();
      const record = getFighterRecord(fighter);
      const result = getFighterResult(fighter);
      return { name, record, result };
    };

    const fightRecord = {
      fightName,
      fighterOne: getFighterDetails(fighterOne),
      fighterTwo: getFighterDetails(fighterTwo),
    }

    fights.push(fightRecord);
  });

return {
  eventName,
  hasMainEvent,
  promotion,
  unixDate,
  isoDate,
  shortDate,
  location,
  locationDetails,
  fights,
};}
