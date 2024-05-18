export const ProposalSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Apply proposal success.",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      406: {
        description: "Not acceptable request.",
      },
      409: {
        description: "Proposal already applyed.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const updateProposalSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Proposal post successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getAllProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted Proposal successfully!",
      },
      204: {
        description: "No Content",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getMyAllProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted Proposal successfully!",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted Proposal successfully!",
      },
      404: {
        description: "Posted Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
export const deleteProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted Proposal successfully!",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Posted Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
export const downloadProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Download attached files Success",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const approveProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Proposal approved Successfully",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Applied Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const hireProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Proposal hired Successfully",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Applied Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
export const offerProposalSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Proposal offered Successfully",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Applied Proposal not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
