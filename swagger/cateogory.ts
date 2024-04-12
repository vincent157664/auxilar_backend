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
        description:
          "Requeset Sorry, something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
