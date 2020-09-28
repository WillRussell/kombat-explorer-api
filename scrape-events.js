require("dotenv").config();

const parseEventsList = require("./eventsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");

const ufc = process.env["UFC_EVENTS_URI"];
const bellator = process.env["BELLATOR_EVENTS_URI"];

const s3 = new AWS.S3({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const requests = async () => {
  return await Promise.all([
    fetch(ufc), 
    fetch(bellator),
  ]);
};

async function fetchData() {
  const response = await requests();
  const rawUfcData = await response[0].text();
  const rawBellatorData = await response[1].text();

  const mergedCollection = [
    ...parseEventsList(rawUfcData),
    ...parseEventsList(rawBellatorData),
  ];

  const sortedCollection = mergedCollection.sort(
    (a, b) => a.unixDate - b.unixDate
  );

  const hasError = !response[0].ok || !response[1].ok;

  if (hasError) {
    throw new Error(
      `HTTP error! status: ${response[0].status}, ${response[1].status}`
    );
  } else {
    return await sortedCollection;
  }
}

fetchData()
  .then((collection) => {
    const created_at = moment().valueOf().toString();
    const calendar_date = moment().calendar();
    const fileObj = { created_at, calendar_date, collection };
    const json = JSON.stringify(fileObj);

    const params = {
      ACL: "public-read",
      Body: json,
      ContentType: "application/json",
      Bucket: process.env["S3_BUCKET"],
      Key: "events-collection.json",
    };

    s3.putObject(params, (err, results) => {
      if (err) reject(err);
      else {
        console.log(results);
      }
    });
  })
  .catch((e) => console.log(e));
