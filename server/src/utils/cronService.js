import axios from "axios";
import MarketPriceModel from "../../Database/models/marketprice.model.js";

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 3);
  return yesterday.toISOString().split("T")[0];
};

const fetchAndStoreEnamDataService = async () => {
  try {
    const yesterday = getYesterdayDate();

    const formData = {
      language: "en",
      stateName: "-- All --",
      apmcName: "-- Select APMCs --",
      commodityName: "-- Select Commodity --",
      fromDate: yesterday,
      toDate: yesterday,
    };

    const response = await axios.post(
      "https://enam.gov.in/web/Ajax_ctrl/trade_data_list",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tradeData = response.data.data;

    const storedData = await Promise.all(
      tradeData.map(async (item) => {
        try {
          const existingRecord = await MarketPriceModel.findOne({
            enamId: item.id,
          });

          if (existingRecord) {
            return existingRecord;
          }

          const newRecord = new MarketPriceModel({
            enamId: item.id,
            state: item.state,
            apmc: item.apmc,
            commodity: item.commodity,
            min_price: Number(item.min_price) || 0,
            modal_price: Number(item.modal_price) || 0,
            max_price: Number(item.max_price) || 0,
            commodity_arrivals: Number(item.commodity_arrivals) || 0,
            commodity_traded: Number(item.commodity_traded) || 0,
            date: new Date(item.created_at),
            status: Number(item.status) || 1,
            unit: item.Commodity_Uom || "N/A",
          });

          await newRecord.save();
          console.log(`New record ${item.id} saved successfully`);
          return newRecord;
        } catch (err) {
          console.error(`Error processing record ${item.id}:`, err);
          return null;
        }
      })
    );

    const successfulRecords = storedData.filter((record) => record !== null);
    return successfulRecords;
  } catch (error) {
    console.error("Error in cron job:", error);
    throw error;
  }
};

export { getYesterdayDate, fetchAndStoreEnamDataService };
