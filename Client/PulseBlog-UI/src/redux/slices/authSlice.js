import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false, // True if user exists
        authInitialized:false,
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
            state.authInitialized=true,
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
            state.authInitialized=true,
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
        authInitialized:(state) => {
            state.authInitialized = true;
        }
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser,authInitialized } = authSlice.actions;
export default authSlice.reducer;