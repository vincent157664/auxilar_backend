const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  transaction: {
    type: Object,
  },
});

const Transaction = mongoose.model("transaction", TransactionSchema);
export default Transaction;
