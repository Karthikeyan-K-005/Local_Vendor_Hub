// frontend/src/store.js

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- ADDED: Base URL Configuration ---
// Set the default base URL for all axios requests.
// It uses the environment variable REACT_APP_API_URL (which you'll set in the cloud config)
// or falls back to an empty string, which allows relative paths to work during development/proxied environments.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
// ------------------------------------

// Initial State
const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
};

// Reducer Function
function reducer(state, action) {
    switch (action.type) {
        case 'USER_LOGIN':
        case 'USER_REGISTER':
            const newUserInfo = action.payload; // Capture the full user object
            localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
            return { ...state, userInfo: newUserInfo };
        case 'USER_LOGOUT':
            localStorage.removeItem('userInfo');
            return { ...state, userInfo: null };
        case 'FAVORITE_TOGGLE':
            // Payload is expected to be the full store object (or essential fields)
            const storeToAddOrRemove = action.payload; 
            const favorites = state.userInfo.favorites;

            const isFavorite = favorites.some(store => store._id === storeToAddOrRemove._id);

            const updatedFavorites = isFavorite
                ? favorites.filter(store => store._id !== storeToAddOrRemove._id)
                : [...favorites, storeToAddOrRemove]; // Add the complete store object

            const updatedUserInfo = { ...state.userInfo, favorites: updatedFavorites };
            
            // BUG FIX: Persist the updated favorites list to localStorage
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo)); 

            return {
                ...state,
                userInfo: updatedUserInfo,
            };
        case 'SET_FULL_FAVORITES':
            // Used to replace simple favorites with full store objects after initial data load
            // We also need to persist this if the favorites were just updated by the backend
            const fullFavoritesUserInfo = { ...state.userInfo, favorites: action.payload };
            localStorage.setItem('userInfo', JSON.stringify(fullFavoritesUserInfo));
            return {
                ...state,
                userInfo: fullFavoritesUserInfo,
            };
        default:
            return state;
    }
}

const Store = createContext();

function StoreProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Function to load full favorite stores on user login/refresh
    useEffect(() => {
        const fetchFavorites = async () => {
            if (state.userInfo && state.userInfo.role === 'customer') {
                try {
                    // Fetch the full user profile to get populated favorites list
                    const { data } = await axios.get('/api/users/profile', {
                        headers: { Authorization: `Bearer ${state.userInfo.token}` },
                    });
                    // Dispatch SET_FULL_FAVORITES now also updates local storage
                    dispatch({ type: 'SET_FULL_FAVORITES', payload: data.favorites });
                } catch (err) {
                    // If token expired, log out
                    if (err.response && err.response.status === 401) {
                        dispatch({ type: 'USER_LOGOUT' });
                        toast.error('Session expired. Please log in again.');
                    }
                    console.error('Error fetching favorites:', err);
                }
            }
        };
        fetchFavorites();
    }, [state.userInfo]); 


    const value = { state, dispatch };
    return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

const useStore = () => useContext(Store);

export { StoreProvider, useStore };
