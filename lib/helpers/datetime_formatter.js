module.exports = datetimeFormatter = (timestamp) => {
  const datetime = new Date(timestamp);
  const years = datetime.getFullYear();
  const months = datetime.getMonth(); // MM = 0-11
  months++; // human readable
  const days = datetime.getDate();
  const hours = datetime.getHours();
  const minutes = datetime.getMinutes();
  minutes = minutes.toString().length == 1 ? `0${minutes}` : `${minutes}`;
  return { years, months, days, hours, minutes }
}

module.exports = datetimeRelative = (timeStamp) => {
  const now = new Date();
  const secondsPast = (now.getTime() - timeStamp) / 1000;
  if (secondsPast < 60) {
    return `${parseInt(secondsPast)}s ago`;
  }
  if (secondsPast < 3600) {
    return `${parseInt(secondsPast / 60)}m ago`;
  }
  if (secondsPast <= 86400) {
    return `${parseInt(secondsPast / 3600)}h ago`;
  }
  if (secondsPast > 86400) {
    mydate = new Date(timeStamp);
    day = mydate.getDate();
    month = mydate.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
    year = mydate.getFullYear() == now.getFullYear() ? "" : " " + mydate.getFullYear();
    return day + " " + month + year;
  }
}
