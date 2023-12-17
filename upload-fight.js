require("dotenv").config();

const parseFightCard = require("./fightsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const { decrypt, md5sum } = require("./encryption-utils.js");

module.exports = function (resourceId) {
  const resourceUrl = decrypt(resourceId);
  const id = md5sum(resourceUrl);

  const s3 = new AWS.S3({
    accessKeyId: process.env["ACCESS_KEY_ID"],
    secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  });

  const fightUrl = process.env["BASE_URI"] + resourceUrl;

  const requests = async () => {
    return await fetch(fightUrl);
  };

  async function fetchData() {
    const response = await requests();
    const rawPageData = await response.text();
    const fightCard = parseFightCard(rawPageData);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      return await fightCard;
    }
  }

  fetchData()
    .then((fightCard) => {
      const created_at = moment().valueOf();
      const fileObj = { id, created_at, ...fightCard };
      const json = JSON.stringify(fileObj);

      const params = {
        ACL: "public-read",
        Body: json,
        ContentType: "application/json",
        Bucket: `${process.env["FIGHTS_DIR"]}`,
        Key: `${id}.json`,
      };

      s3.putObject(params, (err, results) => {
        if (err) reject(err);
        else {
          const logObj = { event: fightCard.eventName, fightsStored: fightCard.fights.length, ...results };
          console.log(logObj);
        }
      });
    })
    .catch((e) => console.log(e));
};
