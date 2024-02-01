import { now } from "mongoose";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookingCallSchema = new Schema({
  owner: {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
  },
  participants: [
    {
      participant: {
        id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        first_name: {
          type: String,
          required: true,
        },
        last_name: {
          type: String,
          required: true,
        },
      },
    },
  ],

  call_link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  meeting_date: {
    type: Date,
    required: true,
  },
  meeting_time: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["upcoming", "successed", "failed"],
    default: "upcoming",
  },
});

const BookingCall = mongoose.model("bookingCall", BookingCallSchema);
export default BookingCall;
