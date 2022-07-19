const mongoose = require("mongoose");

const nftVoucherSchema = new mongoose.Schema(
  {
    owner: String,
    nftTokenId: String,
    status: String,
    listedType: String,
    startingPrice: String,
    price: String,
    endPrice: String,
    duration: String,
    listedTimeStamp: String,
    signature: String,
  },
  { timestamps: true }
);

const NFTVoucher = mongoose.model("NFTVoucher", nftVoucherSchema);

module.exports = NFTVoucher;
