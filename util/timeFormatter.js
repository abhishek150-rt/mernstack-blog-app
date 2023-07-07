const moment = require("moment");

// Helper function to format the date using Moment.js
const formatDate = (date) => {
  return moment(date).format("MMMM Do YYYY");
};

module.exports=formatDate