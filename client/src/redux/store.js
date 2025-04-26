import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './marketSlice';

export default configureStore({
  reducer: {
    market: marketReducer,
  },
});