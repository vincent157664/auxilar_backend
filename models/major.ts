const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MajorSchema = new Schema({
  name: {
    type: String,
  },
});

const Major = mongoose.model('major', MajorSchema);
export default Major;
