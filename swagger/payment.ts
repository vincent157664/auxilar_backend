export const performPaymentSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Perform paymet success.",
      },
      400: {
        description: "Input Fields Required.",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};

export const withdrawSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Withdraw paymet success.",
      },
      400: {
        description: "Input Fields Required.",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
