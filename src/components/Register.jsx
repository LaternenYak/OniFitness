import { useState } from "react";
import { supabase } from "../supabase";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(`Fehler: ${error.message}`);
        } else {
            setMessage(`Registrierung erfolgreich! Bitte Email bestätigen.`);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>Registrieren</h2>

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

            <button type="submit">Registrieren</button>

            {message && <p>{message}</p>}
        </form>
    );
}