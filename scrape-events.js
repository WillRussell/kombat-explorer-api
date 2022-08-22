require("dotenv").config();

const parseEventsList = require("./eventsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const { performance } = require('perf_hooks');
const { some } = require("lodash");

const ufc = process.env["UFC_EVENTS_URI"];
const bellator = process.env["BELLATOR_EVENTS_URI"];
const oneFc = process.env["ONEFC_EVENTS_URI"];
const pfl = process.env["PFL_EVENTS_URI"];
const fury = process.env["FURY_FC_EVENTS_URI"];
const dwcs = process.env["CONTENDER_SERIES_EVENTS_URI"];


const s3 = new AWS.S3({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const t0 = performance.now();

const requests = async () => {
  return await Promise.all([
    fetch(ufc), 
    fetch(bellator),
    fetch(oneFc),
    fetch(pfl),
    fetch(fury),
    fetch(dwcs),
  ]);
};

async function fetchData() {
  const response = await requests();
  const rawUfcData = await response[0].text();
  const rawBellatorData = await response[1].text();
  const rawOneFcData = await response[2].text();
  const rawPflData = await response[3].text();
  const rawFuryData = await response[4].text();
  const rawDwcsData = await response[5].text();


  const mergedCollection = [
    ...parseEventsList(rawUfcData),
    ...parseEventsList(rawBellatorData),
    ...parseEventsList(rawOneFcData),
    ...parseEventsList(rawPflData),
    ...parseEventsList(rawFuryData),
    ...parseEventsList(rawDwcsData),
  ];

  const sortedCollection = mergedCollection.sort(
    (a, b) => a.unixDate - b.unixDate
  );

  const hasError = some(response, ['ok', false]);

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
