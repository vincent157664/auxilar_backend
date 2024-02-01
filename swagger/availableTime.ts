export const createAvailableTimeSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Schedule created successfully!",
      },
      400: {
        description: "Input Fields Required.",
      },
      409: {
        description: "Account already exists.",
      },
      501: {
        description: "Not implemented",
      },
    },
  },
};
export const getAvailableTimeSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get schedule success",
      },
      404: {
        description: "Schedule does not exist",
      },
      501: {
        description: "Not implemented",
      },
    },
  },
};

export const updateAvailableTimeSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update schedule success",
      },
      404: {
        description: "Not found!",
      },
      501: {
        description: "Not implemented",
      },
    },
  },
};

export const deleteAvailableTimeSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete schedule success",
      },
      404: {
        description: "Schedule does not exist",
      },
      501: {
        description: "Not implemented",
      },
    },
  },
};
