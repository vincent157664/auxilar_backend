export const getAllMajors = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "success",
      },
      404: {
        description: "Major not found!",
      },
      501: {
        description: "Requeset not implemented.",
      },
    },
  },
};