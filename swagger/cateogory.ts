export const getAllCategories = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "success",
      },
      404: {
        description: "Category not found!",
      },
      501: {
        description: "Requeset not implemented.",
      },
    },
  },
};