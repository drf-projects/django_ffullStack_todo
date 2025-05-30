import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            let errorMessage = "An error occurred. Please try again.";

            if (error.response) {
                // Handle HTTP errors (4xx, 5xx)
                if (error.response.status === 404) {
                    errorMessage = "Endpoint not found. Please check the backend URL.";
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.detail || "Invalid request data.";
                } else if (error.response.status === 401) {
                    errorMessage = "Unauthorized. Please check your credentials.";
                } else if (error.response.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    errorMessage = error.response.data?.detail || 
                                 JSON.stringify(error.response.data, null, 2) || 
                                 `Error ${error.response.status}: Request failed`;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response from server. Please check your network connection and backend URL.";
            } else {
                // Something happened in setting up the request
                errorMessage = `Request setup error: ${error.message}`;
            }

            setError(errorMessage);
            console.error("API Error:", error); // Log full error for debugging
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            {error && <div className="error-message">{error}</div>}
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Processing..." : name}
            </button>
        </form>
    );
}

export default Form;