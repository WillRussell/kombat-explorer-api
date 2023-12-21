require("dotenv").config();

const parseEventsList = require("./eventsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const { performance } = require('perf_hooks');
const { some } = require("lodash");

const eventUris = [
  "UFC_EVENTS_URI",
  "BELLATOR_EVENTS_URI",
  "ONEFC_EVENTS_URI",
  "PFL_EVENTS_URI",
  "FURY_FC_EVENTS_URI",
  "CONTENDER_SERIES_EVENTS_URI",
  "FULL_CONTACT_FIGHTING_EVENTS_URI",
  "UFC_APEX_EVENTS_URI",
  "URIAH_FABER_A1_COMBAT_EVENTS_URI",
];

const s3 = new AWS.S3({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const t0 = performance.now();

const requests = async () => {
  return await Promise.all(
    eventUris.map(uri => fetch(process.env[uri]))
  );
};

async function fetchData() {
  const responses = await requests();
  const rawData = await Promise.all(responses.map(response => response.text()));
  const mergedCollection = rawData.flatMap(rawDataItem => parseEventsList(rawDataItem));

  const sortedCollection = mergedCollection.sort(
    (a, b) => a.unixDate - b.unixDate
  );

  const hasError = some(responses, ['ok', false]);

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
    const created_at = moment().valueOf();
    const fileObj = { created_at, collection };
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
        const t1 = performance.now();
        const duration = moment.duration(t1 - t0).humanize();
        
        /* Log some details on success*/
        collection.forEach((o) => { console.log(`${o.id} : ${o.title}, ${o.subtitle}`) });
        console.log("-------------------------------------------------");
        console.log(`Events collected: ${collection.length}`);
        console.log(`Task duration: ${(duration)}`);
        console.log("-------------------------------------------------");
        console.log(results); // s3 tag
        console.log("-------------------------------------------------");
      }
    });
  })
  .catch((e) => console.log(e));
