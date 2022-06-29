const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    tokenId: String,
    minPrice: String,
    uri: String,
    signature: String,
    account: String,
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Vouchers", voucherSchema);

module.exports = Voucher;
