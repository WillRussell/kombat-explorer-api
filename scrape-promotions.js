require('dotenv').config();

const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const baseUri = process.env['BASE_URI'];

async function scrapePromotions() {
  const data = fs.readFileSync('eventUrls.json', 'utf8');
  const eventUrls = JSON.parse(data);

  const organizationUrls = [];

  for (let i = 0; i < eventUrls.length; i++) {
    const url = eventUrls[i];

    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

    const response = await fetch(url);
    const body = await response.text();

    const $ = cheerio.load(body);

    $('.organization a[href*="/organizations/"]').each((i, element) => {
      const link = baseUri + $(element).attr('href');
      if (!organizationUrls.includes(link)) {
        organizationUrls.push(link);
      }
    });

  }
  return organizationUrls;
}

scrapePromotions().then((organizationUrls) => {
  fs.writeFileSync('organizationUrls.json', JSON.stringify(organizationUrls, null, 2));
});

