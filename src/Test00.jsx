
import { useState } from "react";
import "./Test00.css";

const API_URL =
  "https://underpaid-lumping-landed.ngrok-free.dev/gps";

function App() {
  const [gps, setGps] = useState(null);
  const [status, setStatus] = useState("Menunggu GPS...");

  const sendGPS = () => {
    setStatus("Mengambil koordinat GPS...");

    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setGps({ lat, lng });
        setStatus("Mengirim GPS...");

        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({
              device_id: "android01",
              latitude: lat,
              longitude: lng
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "POST gagal");
          }

          setStatus("GPS berhasil disimpan!");

        } catch (error) {
          setStatus("Gagal mengirim GPS: " + error.message);
        }
      },

      (error) => {
        setStatus("GPS Error: " + error.message);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="app">
      <h1>SUMINAR GPS</h1>

      <p>GPS REST API - Rust + MongoDB</p>

      <button onClick={sendGPS}>
        KIRIM GPS
      </button>

      <h3>Status</h3>
      <p>{status}</p>

      {gps && (
        <div>
          <p>Latitude: {gps.lat}</p>
          <p>Longitude: {gps.lng}</p>
        </div>
      )}
    </div>
  );
}

export default App;
