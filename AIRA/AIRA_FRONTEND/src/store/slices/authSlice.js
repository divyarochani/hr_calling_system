import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

// Get user from localStorage
const user = authService.getStoredUser();
const token = authService.getStoredToken();

const initialState = {
    user: user,
    token: token,
    isLoading: false,
    isError: false,
    isSuccess: false,
    isAuthenticated: !!token,
    message: '',
};

// Login user
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, thunkAPI) => {
        try {
            const response = await authService.login(email, password);
            return response.data;
        } catch (error) {
            const message = error.message || 'Login failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Register user
export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ name, email, password, role }, thunkAPI) => {
        try {
            const response = await authService.register(name, email, password, role);
            return response.data;
        } catch (error) {
            const message = error.message || 'Registration failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get user profile
export const getUserProfile = createAsyncThunk(
    'auth/profile',
    async (_, thunkAPI) => {
        try {
            const response = await authService.getProfile();
            return response.data;
        } catch (error) {
            const message = error.message || 'Failed to get profile';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Logout user
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            // Get Profile
            .addCase(getUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            });
    },
});

export const { reset } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.message;

export default authSlice.reducer;
