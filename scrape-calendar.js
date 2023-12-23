require("dotenv").config();

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUri = process.env["BASE_URI"];

async function scrapeCalendar() {
  const response = await fetch(baseUri + '/events');
  const body = await response.text();

  const $ = cheerio.load(body);
  const eventUrls = [];

  $('table tr').each((i, element) => {
    const onclickValue = $(element).attr('onclick');
    if (onclickValue && onclickValue.startsWith('document.location=')) {
      const url = onclickValue.replace('document.location=', '').replace(/['"]/g, '');
      eventUrls.push(`${baseUri}${url}`);
    }
  });

  return eventUrls;
}

scrapeCalendar().then((eventUrls) => {
  fs.writeFileSync('eventUrls.json', JSON.stringify(eventUrls, null, 2));
});
