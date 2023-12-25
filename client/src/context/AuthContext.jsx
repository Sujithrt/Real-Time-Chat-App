import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUser(user);
        }
    }, []);

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setRegisterError(null);
        const response = await postRequest(`${baseUrl}/users/register`, registerInfo);
        setIsRegisterLoading(false);
        if (response.error) {
            return setRegisterError(response);
        }
        localStorage.setItem("user", JSON.stringify(response));
        setUser(response);
    }, [registerInfo]);

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, []);

    const loginUser = useCallback(async (e) => {
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError(null);
        const response = await postRequest(`${baseUrl}/users/login`, loginInfo);
        setIsLoginLoading(false);
        if (response.error) {
            return setLoginError(response);
        }
        localStorage.setItem("user", JSON.stringify(response));
        setUser(response);
    }, [loginInfo]);

    const logoutUser = useCallback(() => {
        localStorage.removeItem("user");
        setLoginInfo({
            email: "",
            password: "",
        });
        setRegisterInfo({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                logoutUser,
                loginInfo,
                updateLoginInfo,
                loginUser,
                loginError,
                isLoginLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}