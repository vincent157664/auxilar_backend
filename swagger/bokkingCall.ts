export const createBookingCallSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Book a call success!",
      },
      400: {
        description: "Input Fields Required.",
      },
      501: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
export const getBookedCallSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get booked call success",
      },
      404: {
        description: "Not found!",
      },
      501: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};

export const updateBookedCallSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update booked call success",
      },
      400: {
        description: "Input Fields Required.",
      },
      404: {
        description: "Booked call not found!",
      },
      501: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};

export const deleteBookedCallSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete booked call success",
      },
      404: {
        description: "Booked call not found!",
      },
      501: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
