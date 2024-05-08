import { required } from "joi";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const MentorSchema = new Schema({
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

  experts: [
    {
      expert: {
        expert_id: {
          type: Schema.Types.ObjectId,
        },
        jobs: {
          type: [Schema.Types.ObjectId],
        },
      },
    },
  ],

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
    webProfile: {
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

  professional_background: {
    type: String,
  },

  professional_info: {
    university: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
  },
  resume: {
    type: Object,
    required: false,
  },
});

const Mentor = mongoose.model("mentor", MentorSchema);
export default Mentor;
