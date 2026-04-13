import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false,
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
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;