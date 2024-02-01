const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ContractSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  proposal: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  client_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  expert_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  milestones: [
    {
      amount: {
        type: Number,
      },
      description: {
        type: String,
      },
      step_number: {
        type: Number,
      },
      due_time: {
        start_time: {
          type: Date,
        },
        end_time: {
          type: Date,
        },
      },
      completeness: {
        type: String,
        enum: ["upcoming", "ongoing", "success", "failed"],
        default: "upcoming",
      },
    },
  ],
  additional_information: {
    type: String,
  },
  total_budget: {
    proposed_budget: {
      type: Number,
    },
  },
});

const Contract = mongoose.model("contract", ContractSchema);
export default Contract;
