const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ClientSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },

  email: {
    type: String,
  },

  avatar: {
    type: String,
  },

  country: {
    type: String,
    required: true,
  },

  state: {
    type: String,
  },

  city: {
    type: String,
  },

  address: {
    type: String,
    required: true,
  },

  languages: [
    {
      language: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ["Basic", "Conversational", "Fluent", "Native"],
        default: "Basic",
        required: true,
      },
    },
  ],

  summary: {
    type: String,
    required: true,
  },

  ongoing_project: [
    {
      project: {
        type: Schema.Types.ObjectId,
      },
    },
  ],

  reviews: [
    {
      reviewer: {
        type: String,
      },
      reviewe: {
        type: String,
      },
      rate: {
        type: Number,
      },
    },
  ],

  social_media: {
    websiteURL: {
      type: String,
    },
    twitter: {
      type: String,
    },
    youtube: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },

  account_status: {
    type: Number,
    default: 0,
  },

  payment_verify: {
    type: Boolean,
    default: false,
  },

  payment_info: {
    paypal: {
      type: String,
    },
    creditCard: {
      type: String,
    },
  },
});

const Client = mongoose.model("client", ClientSchema);
export default Client;
