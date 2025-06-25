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
  const [editMode, setEditMode] = useState(false);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState({});

  const currentDay = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
  });
  const todayWorkout = weeklyWorkouts[currentDay] || [];

  // ---------- Zentrale fetchData Funktion ----------
  const fetchData = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) return;

    const { data: weightData } = await supabase
      .from("weights")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (weightData) {
      setStartWeight(weightData.start);
      setCurrentWeight(weightData.current);
      setGoalWeight(weightData.goal);
    }

    const { data: workoutsData } = await supabase
      .from("workouts")
      .select("day, text, done")
      .eq("user_id", user.id);

    if (workoutsData) {
      const grouped = workoutsData.reduce((acc, item) => {
        acc[item.day] = acc[item.day] || [];
        acc[item.day].push({ text: item.text, done: item.done });
        return acc;
      }, {});
      setWeeklyWorkouts(grouped);
    }
  };

  // ---------- Prüfe Session beim Mount ----------
  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchData();
      }
    }
  );

  return () => {
    listener.subscription?.unsubscribe(); // clean up
  };
}, [navigate]);


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
      setEditMode(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const updateWorkout = async (idx, field, value) => {
    const updated = { ...weeklyWorkouts };
    updated[currentDay][idx][field] = value;
    setWeeklyWorkouts(updated);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const workout = updated[currentDay][idx];
    await supabase.from("workouts").update(workout).match({
      user_id: user.id,
      day: currentDay,
      text: workout.text,
    });
  };

  const handleDeleteWorkout = async (idx) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const workout = weeklyWorkouts[currentDay][idx];

    await supabase
      .from("workouts")
      .delete()
      .match({
        user_id: user.id,
        day: currentDay,
        text: workout.text,
      });

    const updatedDay = [...weeklyWorkouts[currentDay]];
    updatedDay.splice(idx, 1);
    setWeeklyWorkouts({
      ...weeklyWorkouts,
      [currentDay]: updatedDay,
    });
  };

  return (
    <div className="dashboard">
      <h1>Dein Dashboard</h1>

      <div className="top-buttons">
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
        <button
          className="edit-workout-button"
          onClick={() => navigate("/edit-workout")}
        >
          Workoutplan bearbeiten
        </button>
      </div>

      <form onSubmit={handleSubmit} className="weight-wrapper">
        <div className="edit-toggle">
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className="edit-toggle-button"
          >
            {editMode ? "Bearbeiten beenden" : "Bearbeiten"}
          </button>
        </div>

        <div className="weight-grid">
          {["start", "current", "goal"].map((key) => (
            <div key={key} className="weight-box">
              <label>
                {key === "start"
                  ? "Startgewicht"
                  : key === "current"
                  ? "Aktuelles Gewicht"
                  : "Zielgewicht"}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={
                    key === "start"
                      ? startWeight
                      : key === "current"
                      ? currentWeight
                      : goalWeight
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (key === "start") setStartWeight(val);
                    else if (key === "current") setCurrentWeight(val);
                    else setGoalWeight(val);
                  }}
                  required
                />
              ) : (
                <div className="weight-display">
                  <span>
                    {key === "start"
                      ? startWeight
                      : key === "current"
                      ? currentWeight
                      : goalWeight}{" "}
                    kg
                  </span>
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

        {editMode && (
          <button className="save-button" type="submit">
            Speichern
          </button>
        )}
      </form>

      <div className="workout">
        <h2 className="workout-heading">{currentDay + "'s Workout"}</h2>
        <ul className="workout-list">
          {todayWorkout.map((item, idx) => (
            <li key={idx} className="workout-item">
              <span className={item.done ? "done" : ""}>{item.text}</span>
              <div className="workout-actions">
                <button
                  onClick={() => updateWorkout(idx, "done", !item.done)}
                >
                  {item.done ? "✔️" : "⏳"}
                </button>
                <button
                  onClick={() =>
                    updateWorkout(
                      idx,
                      "text",
                      prompt("Neuer Text:", item.text) || item.text
                    )
                  }
                >
                  ✏️
                </button>
                <button onClick={() => handleDeleteWorkout(idx)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
