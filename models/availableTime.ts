const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const AvailableTimeSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  regular: {
    days: [
      {
        available: {
          type: Boolean,
          required: true,
        },
        schedules: [
          {
            start: {
              type: Date,
            },

            end: {
              type: Date,
            },

            valid: {
              type: Boolean,
            },
          },
        ],
      },
    ],
  },

  irregular: [
    {
      date: {
        type: Date,
      },
      time: [
        {
          start: {
            type: Date,
          },
          end: {
            type: Date,
          },
          valid: {
            type: Boolean,
          },
        },
      ],
    },
  ],
});

const AvailableTime = mongoose.model("availableTime", AvailableTimeSchema);
export default AvailableTime;
