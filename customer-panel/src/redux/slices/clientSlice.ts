import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Client } from '@/types';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
    },
    setSelectedClient(state, action: PayloadAction<Client | null>) {
      state.selectedClient = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.unshift(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const index = state.clients.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    removeClient(state, action: PayloadAction<number>) {
      state.clients = state.clients.filter(c => c.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setClients,
  setSelectedClient,
  addClient,
  updateClient,
  removeClient,
  setLoading,
  setError,
} = clientSlice.actions;

export default clientSlice.reducer;
