const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  client_id: {
    type: Schema.Types.ObjectId,
  },
  client_avatar: {
    type: String,
  },
  expert_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  expert_avatar: {
    type: String,
    required: true,
  },
  mentor_id: {
    type: Schema.Types.ObjectId,
  },
  mentor_avatar: {
    type: String,
  },
  job: {
    id: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
  },
  proposal: {
    id: {
      type: Schema.Types.ObjectId,
    },
  },

  messages: [
    {
      from: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      to: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      message_type: {
        type: String,
      },
      message_body: {
        type: String,
      },
      parent_message_id: {
        type: Schema.Types.ObjectId,
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
      created_date: {
        type: Date,
      },
      expire_date: {
        type: Date,
      },
    },
  ],
});

const Conversation = mongoose.model("conversation", ConversationSchema);
export default Conversation;
