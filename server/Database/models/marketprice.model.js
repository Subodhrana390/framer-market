import mongoose from "mongoose";

const MarketPriceSchema = new mongoose.Schema({
  enamId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  apmc: { type: String, required: true },
  commodity: { type: String, required: true },
  min_price: { type: Number, required: true },
  modal_price: { type: Number, required: true },
  max_price: { type: Number, required: true },
  commodity_arrivals: { type: Number, required: true },
  commodity_traded: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: Number, default: 1 },
  unit: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MarketPriceSchema.index({ state: 1, apmc: 1, commodity: 1, date: 1 });

const MarketPriceModel = mongoose.model("MarketPrice", MarketPriceSchema);

export default MarketPriceModel;
