const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
  email: {
    type: String,
    required: true
  },

  first_name: {
    type: String,
    required: true
  },

  last_name: {
    type: String,
    required: true
  },

  account_type: {
    type: String,
    enum: ["expert", "client", "mentor", "admin"],
    required: true,
    default: "expert"
  },

  password: {
    type: String,
    required: true
  },

  active: {
    type: Boolean,
    default: false
  },

  verified_status: {
    type: Boolean,
    default: false
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  last_logged_in: {
    type: Date,
    default: Date.now
  }

});

const Account = mongoose.model('account', AccountSchema);
export default Account;
