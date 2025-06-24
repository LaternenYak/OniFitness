import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const [email, setEmail] = useState ("");
    const [password, setPassword] = useState ("");
    const [ message, setMessage] = useState ("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error){
            setMessage(`Fehler: ${error.message}`);
        } else {
            setMessage(`Login Erfolgreich! Willkommen zurück.`);
            navigate('/dashboard');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input 
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            />

            <input 
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            />

            <button type="submit">Einloggen</button>

            {message && <p>{message}</p>}
        </form>
    );
}