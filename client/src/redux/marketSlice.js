import { createSlice } from '@reduxjs/toolkit';

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    prices: [],
    trends: [],
    apmcLocations: [],
    predictions: [],
    alerts: []
  },
  reducers: {
    updatePrice: (state, action) => {
      state.prices = [action.payload, ...state.prices].slice(0, 50);
    },
    setPrices: (state, action) => {
      state.prices = action.payload;
    },
    setTrends: (state, action) => {
      state.trends = action.payload;
    },
    setApmcLocations: (state, action) => {
      state.apmcLocations = action.payload;
    },
    setPredictions: (state, action) => {
      state.predictions = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
    }
  }
});

export const { updatePrice, setPrices, setTrends, setApmcLocations, setPredictions, addAlert } = marketSlice.actions;
export default marketSlice.reducer;