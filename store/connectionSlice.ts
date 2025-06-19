import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  connected: boolean;
}

const initialState: ConnectionState = {
  connected: false,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
  },
});

export const { setConnected } = connectionSlice.actions;
export default connectionSlice.reducer;
