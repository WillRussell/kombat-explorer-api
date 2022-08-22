module.exports = function (data) {
  const locationInfo = data.split(",");

  let venue = null;
  let country = null;
  let shortLocation = null;

  const altLocationText = [];

  locationInfo.forEach((item, index) => {
    const str = item.trim();
    const hasDetails = str && str !== "TBA";
    const isFirst = index === 0;
    const isLast = index === locationInfo.length - 1;

    if (hasDetails && isFirst) {
      venue = str;
    }

    if (hasDetails && !isFirst) {
      altLocationText.push(str);
    }

    if (hasDetails && isLast) {
      country = str;
      shortLocation = altLocationText.join(", ");
    }
  });

  return { venue, country, shortLocation };
};
