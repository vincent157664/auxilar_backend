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
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
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
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
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
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
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
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};
