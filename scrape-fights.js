require("dotenv").config();

const parseFightsList = require("./fightsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");

const fightUrl = 'https://www.sherdog.com/events/UFC-on-ESPN-16-Holm-vs-Aldana-87223';

const s3 = new AWS.S3({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const requests = async () => {
  return await fetch(fightUrl);
};

async function fetchData() {
  const response = await requests();
  const rawPageData = await response.text();
  const collection = parseFightsList(rawPageData);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}`
    );
  } else {
    return await collection;
  }
}

fetchData()
  .then((collection) => {

    console.log(collection);

    // const created_at = moment().valueOf().toString();
    // const calendar_date = moment().calendar();
    // const fileObj = { created_at, calendar_date, collection };
    // const json = JSON.stringify(fileObj);


  })
  .catch((e) => console.log(e));
