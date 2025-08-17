import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Child {
  id: string;
  name: string;
  level: number;
  points: number;
  streakDays: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: string;
}

export interface DashboardState {
  children: Child[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  children: [],
  isLoading: false,
  error: null,
};

export const fetchChildren = createAsyncThunk(
  'dashboard/fetchChildren',
  async () => {
    const response = await fetch('/api/parent/children');
    if (!response.ok) {
      throw new Error('Failed to fetch children');
    }
    return response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchChildren.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch data';
      });
  },
});

export default dashboardSlice.reducer;
