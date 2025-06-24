import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [startWeight, setStartWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [goalWeight, setGoalWeight] = useState(0);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState({ start: false, current: false, goal: false });

  const [workoutList, setWorkoutList] = useState([
    { text: "3x15 Situps", done: false },
    { text: "3x10 Kniebeugen", done: false },
    { text: "2x30 Sekunden Plank", done: true },
  ]);

  const fetchData = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) return;

    const { data } = await supabase
      .from("weights")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStartWeight(data.start);
      setCurrentWeight(data.current);
      setGoalWeight(data.goal);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("weights").upsert(
      [
        {
          user_id: user.id,
          start: parseFloat(startWeight),
          current: parseFloat(currentWeight),
          goal: parseFloat(goalWeight),
        },
      ],
      { onConflict: ["user_id"] }
    );

    if (error) {
      setMessage("Fehler beim Speichern: " + error.message);
    } else {
      setMessage("Gespeichert.");
      setEditMode({ start: false, current: false, goal: false });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h1>Dein Dashboard</h1>
      <button className="logout" onClick={handleLogout}>Logout</button>

      <form onSubmit={handleSubmit} className="weight-wrapper">
  <div className="weight-grid">
    {/* Gewichtsfelder */}
    {['start', 'current', 'goal'].map((key) => (
      <div key={key} className="weight-box">
        <label>{key === 'start' ? 'Startgewicht' : key === 'current' ? 'Aktuelles Gewicht' : 'Zielgewicht'}</label>
        {editMode[key] ? (
          <input
            type="number"
            value={key === 'start' ? startWeight : key === 'current' ? currentWeight : goalWeight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              key === 'start' ? setStartWeight(val) : key === 'current' ? setCurrentWeight(val) : setGoalWeight(val);
            }}
            required
          />
        ) : (
          <div className="weight-display">
            <span>{key === 'start' ? startWeight : key === 'current' ? currentWeight : goalWeight} kg</span>
            <span className="edit-icon" onClick={() => setEditMode({ ...editMode, [key]: true })}>✏️</span>
          </div>
        )}
      </div>
    ))}
  </div>

  <div className="weight-diff">
    <div className="diff-box">
      <label>Bisher abgenommen:</label>
      <span>{(startWeight - currentWeight).toFixed(1)} kg</span>
    </div>
    <div className="diff-box">
      <label>Noch abzunehmen:</label>
      <span>{(currentWeight - goalWeight).toFixed(1)} kg</span>
    </div>
  </div>

  <button className="save-button" type="submit">Speichern</button>
</form>



      <div className="workout">
        <h2>{new Date().toLocaleDateString('de-DE', { weekday: 'long' })}'s Workout</h2>
        <ul>
          {workoutList.map((item, idx) => (
            <li key={idx}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => {
                  const copy = [...workoutList];
                  copy[idx].done = !copy[idx].done;
                  setWorkoutList(copy);
                }}
              />
              <input
                className="workout-input"
                value={item.text}
                onChange={(e) => {
                  const copy = [...workoutList];
                  copy[idx].text = e.target.value;
                  setWorkoutList(copy);
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
