const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PasscodeSchema = new Schema({
  email: {
    type: String,
  },

  passcode: {
    type: String,
  },
});

const Passcode = mongoose.model('passcode', PasscodeSchema);
export default Passcode;
