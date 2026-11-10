
import { useState, useEffect } from "react";
import "./Test00.css";

const API_URL =
  "https://underpaid-lumping-landed.ngrok-free.dev/gps";

function App() {
  const [gps, setGps] = useState(null);
  const [status, setStatus] = useState("Memulai GPS...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS");
      return;
    }

    let active = true;

    const sendGPS = () => {
      setStatus("Mengambil koordinat GPS...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!active) return;

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
              throw new Error(
                result.message || "POST gagal"
              );
            }

            if (active) {
              setStatus("GPS berhasil disimpan!");
            }

          } catch (error) {
            if (active) {
              setStatus("Gagal mengirim GPS: " + error.message);
            }
          }
        },

        (error) => {
          if (active) {
            setStatus("GPS Error: " + error.message);
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    };

    // Kirim pertama kali saat halaman dibuka
    sendGPS();

    // Kirim ulang setiap 15 menit
    const interval = setInterval(sendGPS, 15 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };

  }, []);

  return (
    <div className="app">
      <h1>SUMINAR GPS</h1>

      <p>GPS REST API - Rust + MongoDB</p>

      <h3>Status</h3>
      <p>{status}</p>

      {gps && (
        <div>
          <p>Latitude: {gps.lat}</p>
          <p>Longitude: {gps.lng}</p>
        </div>
      )}

      <p>Pengiriman otomatis setiap 15 menit.</p>
    </div>
  );
}

export default App;
