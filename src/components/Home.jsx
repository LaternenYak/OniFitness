import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <h1>Willkommen bei OniFitness</h1>
            <p>Dein persönlicher Fortschrittsrechner.</p>

            <nav>
                <Link to ="/login">Login</Link> <br />
                <Link to ="/register">Registrieren</Link>
            </nav>
        </div>
    );
}