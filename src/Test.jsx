

import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

// REST API Rust + Ngrok
const API_URL =
  "https://underpaid-lumping-landed.ngrok-free.dev/gps";

const DEVICE_ID = "android01";

// Custom GPS Icon
const gpsIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Update posisi peta
function UpdateMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(
        [position.lat, position.lng],
        16
      );
    }
  }, [position, map]);

  return null;
}

export default function Home() {
  const [position, setPosition] = useState(null);

  const [status, setStatus] = useState(
    "Menunggu GPS..."
  );

  // POST GPS ke Rust API
  async function sendGPS(lat, lng) {
    try {
      setStatus("Mengirim koordinat ke server...");

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },

        body: JSON.stringify({
          device_id: DEVICE_ID,
          latitude: lat,
          longitude: lng
        })
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `HTTP ${response.status}: ${message}`
        );
      }

      const result = await response.json();

      console.log("Server response:", result);

      setStatus("GPS berhasil dikirim ke server");

    } catch (error) {
      console.error("POST GPS Error:", error);

      setStatus(
        "Gagal mengirim GPS: " + error.message
      );
    }
  }

  // Mengambil koordinat GPS browser
  function getGPS() {
    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS");
      return;
    }

    setStatus("Mengambil koordinat GPS...");

    navigator.geolocation.getCurrentPosition(

      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        console.log("Latitude:", lat);
        console.log("Longitude:", lng);

        setPosition({ lat, lng });

        // Kirim ke Rust API
        await sendGPS(lat, lng);
      },

      (error) => {
        console.error("GPS Error:", error);

        setStatus(
          "GPS Error: " + error.message
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  // Otomatis mengambil GPS saat halaman dibuka
  useEffect(() => {
    getGPS();
  }, []);

  return (
    <div className="home">

      <h2>GPS LOCATION TRACKER</h2>

      <p className="gps-status">
        {status}
      </p>

      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="map"
        scrollWheelZoom={true}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            <UpdateMap position={position} />

            <Marker
              position={[
                position.lat,
                position.lng
              ]}
              icon={gpsIcon}
            >
              <Popup>
                <b>My GPS Position</b>

                <br />

                Latitude: {position.lat.toFixed(7)}

                <br />

                Longitude: {position.lng.toFixed(7)}
              </Popup>
            </Marker>
          </>
        )}

      </MapContainer>

      <div className="coordinates">

        <h3>GPS Coordinates</h3>

        {position ? (
          <>
            <p>
              Latitude: {position.lat.toFixed(7)}
            </p>

            <p>
              Longitude: {position.lng.toFixed(7)}
            </p>
          </>
        ) : (
          <p>Menunggu koordinat GPS...</p>
        )}

        <button onClick={getGPS}>
          REFRESH GPS
        </button>

      </div>

    </div>
  );
}
