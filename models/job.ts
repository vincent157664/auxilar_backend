const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: "client",
  },
  client_email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget_type: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 0,
  },
  budget_amount: {
    type: Number,
    required: true,
  },
  pub_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  end_date: {
    type: Date,
    // default: Date.now,
    required: true,
  },
  expire_date: {
    type: Date,
    // default: Date.now
  },
  state: {
    type: Number,
    default: 0,
  },

  category: {
    type: [String],
    required: true,
  },

  skill_set: {
    type: [String],
    required: true,
  },
  job_type: {
    type: String,
    required: true,
    enum: ["public", "private"],
    default: "public",
  },
  hours_per_week: {
    type: String,
    required: true,
    enum: ["lessthan10", "between10and20", "between20and30", "morethan30"],
    default: "morethan30",
  },

  project_duration: {
    type: String,
    required: true,
    enum: [
      "lessthan1month",
      "between1and3months",
      "between3and6months",
      "morethan6months",
    ],
    default: "morethan6months",
  },

  invited_expert: [
    {
      id: {
        type: Schema.Types.ObjectId,
      },
      first_name: {
        type: String,
      },
      last_name: {
        type: String,
      },
      type: {
        type: String,
      },
      content: {
        type: String,
      },
    },
  ],

  proposals: [
    {
      expert: {
        id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        invited_status: {
          type: Boolean,
          default: 0,
        },
      },
      cover_letter: {
        type: String,
        required: true,
      },
      attached_files: [
        {
          name: {
            type: String,
          },
          file_id: {
            type: Schema.Types.ObjectId,
          },
        },
      ],
      viewed_by_client: {
        type: Number,
        default: 0,
      },
      mentor_check: [
        {
          mentor: {
            type: String,
          },
          checked: {
            type: Boolean,
            default: 0, // 0: not check or not apply mentor, 1: mentor check
          },
        },
      ],
      /* PROPOSAL STATUS
       * 0: pending not applied
       * 1: pending     declined by mentor
       * 2: pending     approved
       * 3: pending     viewed
       * 4: active      interviewed
       * 5: progress    hired
       * 6: finished    finished
       * 7: cancelle
       * 8: disputed
       */
      proposal_status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      pub_date: {
        type: Date,
        default: Date.now,
      },
      total_amount: {
        type: Number,
        required: true,
      },
      milestones: [
        {
          step_number: {
            type: Number,
            required: true,
          },
          from: {
            type: Date,
            default: Date.now,
          },
          to: {
            type: Date,
            default: Date.now,
          },
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

const Job = mongoose.model("job", JobSchema);
export default Job;
