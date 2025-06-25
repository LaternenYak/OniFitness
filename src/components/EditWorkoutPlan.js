import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { upload } from "@testing-library/user-event/dist/upload";
import "./EditWorkoutPlan.css";

export default function EditWorkoutPlan() {

  const navigate = useNavigate();

  const [weeklyWorkouts, setWeeklyWorkouts] = useState({
    Montag: [], Dienstag: [], Mittwoch: [],
    Donnerstag: [], Freitag: [], Samstag: [], Sonntag: []
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchWorkout = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Fehler beim Laden:", error.message);
        return;
      }

      const grouped = {
        Montag: [], Dienstag: [], Mittwoch: [],
        Donnerstag: [], Freitag: [], Samstag: [], Sonntag: []
      };
      data.forEach(entry => {
        if (grouped[entry.day]) {
          grouped[entry.day].push({ text: entry.text, done: entry.done });
        }
      });
      setWeeklyWorkouts(grouped);
    };

    fetchWorkout();
  }, []);

  const handleChange = (day, index, value) => {
    const updated = { ...weeklyWorkouts };
    updated[day][index].text = value;
    setWeeklyWorkouts(updated);
  };

  const handleAddExercise = (day) => {
    const updated = { ...weeklyWorkouts };
    updated[day].push({ text: "", done: false });
    setWeeklyWorkouts(updated);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("workouts").delete().eq("user_id", user.id);

    const newEntries = [];
    Object.entries(weeklyWorkouts).forEach(([day, exercises]) => {
      exercises.forEach(ex => {
        if (ex.text.trim()) {
          newEntries.push({
            user_id: user.id,
            day,
            text: ex.text,
            done: ex.done
          });
        }
      });
    });

    const { error } = await supabase.from("workouts").insert(newEntries);
    setMessage(error ? `Fehler: ${error.message}` : "Workout gespeichert!");
  };

  const handleDeleteExercise = (day, index) => {
    const updated = { ...weeklyWorkouts};
    updated[day].splice(index,1);
    setWeeklyWorkouts(updated);
  };

  return (
    <div className="edit-workout">
      <h1>Workout-Woche bearbeiten</h1>
      <button onClick={() => navigate("/dashboard")}>Zurück zum Dashboard</button>
      {Object.entries(weeklyWorkouts).map(([day, exercises]) => (
        <div key={day} className="day-block">
          <h2>{day}</h2>
          <ul>
            {exercises.map((item, idx) => (
              <li key={idx}>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleChange(day, idx, e.target.value)}
                />
                <button onClick={() => handleDeleteExercise(day, idx)}>🗑️</button>
              </li>
            ))}
          </ul>
          <button onClick={() => handleAddExercise(day)}>Uebung hinzufuegen</button>
        </div>
      ))}
      <button className="save-button" onClick={handleSave}>Speichern</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
