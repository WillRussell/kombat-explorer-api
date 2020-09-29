require("dotenv").config();

const parseEventsList = require("./eventsParser");
const fetchFightInfo = require("./upload-fight");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const { performance } = require('perf_hooks');

const t0 = performance.now();

const s3 = new AWS.S3({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const params = {
  Bucket: process.env["S3_BUCKET"],
  Key: "events-collection.json",
};

// Fetch the events list first.
const s3download = () =>
  new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

function getRandomInt() {
  const min = Math.ceil(20000);
  const max = Math.floor(50000);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

s3download()
  .then((data) => {
    const { collection } = JSON.parse(Buffer.from(data.Body).toString("utf8"));
    const resources = collection.map((fight) => fight.resourceId);

    let promise = Promise.resolve();

    resources.forEach(function (id) {
      promise = promise.then(() => {
        const interval = getRandomInt();
        fetchFightInfo(id);
        return new Promise((resolve) => setTimeout(resolve, interval));
      });
    });

    promise.then(() => {
      const t1 = performance.now();
      const duration = moment.duration(t1 - t0).humanize();
      console.log(`Fights collected in ${(duration)}`);
    });
  })
  .catch((e) => console.log(e));
