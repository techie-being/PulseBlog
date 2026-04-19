import { createSlice } from "@reduxjs/toolkit";

// 1. Safely check for existing user in localStorage on initial load
const storedUser = JSON.parse(localStorage.getItem("user")) || null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: storedUser,
        isLoggedIn: !!storedUser, // True if user exists
        loading: false,
        error: null,
    },
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.loading = false;
            state.error = null;
            // 2. Save user to localStorage
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.user = null;
            state.isLoggedIn = false;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
            // 3. Clear from localStorage
            localStorage.removeItem("user");
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            // Update localStorage with new user data
            localStorage.setItem("user", JSON.stringify(state.user));
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;