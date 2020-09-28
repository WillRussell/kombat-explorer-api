require("dotenv").config();

const parseEventsList = require("./eventsParser");
const moment = require("moment");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");

const s3 = new AWS.S3({
	accessKeyId: process.env["ACCESS_KEY_ID"],
	secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const params = {
	Bucket: process.env["S3_BUCKET"],
	Key: "events-collection.json",
};

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

s3download()
	.then((data) => {
		const json = JSON.parse(Buffer.from(data.Body).toString("utf8"));
		console.log(json);
	})
	.catch((e) => console.log(e));
