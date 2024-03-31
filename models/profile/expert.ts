const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ExpertSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },

  email: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    // required: true,
  },

  city: {
    type: String,
    // required: true,
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

  avatar: {
    type: String,
  },

  hourly_rate: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
    required: true,
  },

  verified_by: [
    {
      content: {
        type: String,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],

  portfolios: [
    {
      content: {
        type: String,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],

  skills: {
    type: [String],
  },

  majors: {
    type: [String],
  },

  notification_preferences: {
    type: [String],
  },

  ongoing_project: [
    {
      project: {
        type: Schema.Types.ObjectId,
      },
    },
  ],

  mentors: [
    {
      mentor: {
        type: Schema.Types.ObjectId,
      },
    },
  ],

  reviews: [
    {
      reviewer: {
        type: String,
      },
      review: {
        type: String,
      },
      rate: {
        type: Number,
      },
    },
  ],

  active_status: {
    type: Boolean,
    default: 1,
  },

  account_status: {
    type: Number,
    default: 0,
  },

  resume: {
    type: String,
  },

  profile_links: {
    type: [String],
  },

  linkedin: {
    type: String,
  },

  education: {
    type: Array,
    required: false,
  },
  certiification: {
    type: Array,
    required: false,
  },
});

const Expert = mongoose.model("expert", ExpertSchema);
export default Expert;
