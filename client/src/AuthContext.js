import React, { createContext, useState, useEffect } from 'react';
import axios from './axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get('/api/user')
            .then(res => {
                if (res.data.user) {
                    setIsAuthenticated(true);
                    setUser(res.data.user);
                    setAuthError(null);
                } else {
                    setIsAuthenticated(false);
                    setAuthError("Authentication failed: " + res.data);
                }
            })
            .catch(error => {
                console.error("Authentication check failed:", error);
                setAuthError("Authentication check failed: " + error.message);
            });
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        setAuthError(null);

        axios.get('/api/user')
        .then(res => {
            if (res.data.user) {
                setUser(res.data.user);
            }
        })
        .catch(error => {
            console.error("Fetching user data failed:", error);
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setAuthError(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, authError }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
