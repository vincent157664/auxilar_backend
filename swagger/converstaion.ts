export const ConversationSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Create conversation success!",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Expert does not exist",
      },
      406: {
        description: "Not acceptable request.",
      },
      409: {
        description: "Conversation already exist",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getAllConversationSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get all conversations Success!",
      },
      403: {
        description: "Forbidden request.",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getMyConversationSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get my conversation Success!",
      },
      404: {
        description: "Conversation does not exist.",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const deleteMyConversationSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get my conversation Success!",
      },
      404: {
        description: "Conversation does not exist.",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const putMessageToConversationSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Put a message to conversation Success!",
      },
      400: {
        description: "Input Fields Required.",
      },
      404: {
        description: "Conversation does not exist.",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const updateMessageSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update message Success!",
      },
      400: {
        description: "Input Fields Required.",
      },
      404: {
        description: "Message does not exist",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getMessageSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update message Success!",
      },
      404: {
        description: "Message does not exist",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const deleteMessageSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete a message Success!",
      },
      404: {
        description: "Message does not exist",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const downloadMessageFileSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete a message Success!",
      },
      404: {
        description: "Message does not exist",
      },
      501: {
        description:
          "Request Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
