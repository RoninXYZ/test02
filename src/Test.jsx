
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

// Ganti dengan URL HTTPS ngrok milikmu
const API_URL = "https://underpaid-lumping-landed.ngrok-free.dev";

const DEVICE_ID = "android01";

const gpsIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

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
  const [status, setStatus] = useState("Menunggu GPS...");

  // POST koordinat ke Rust API
  async function sendGPS(lat, lng) {

    try {

      setStatus("Mengirim koordinat ke server...");

      const response = await fetch(`${API_URL}/gps`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          device_id: DEVICE_ID,
          latitude: lat,
          longitude: lng
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      console.log("Server response:", result);

      setStatus("GPS berhasil dikirim ke server");

    } catch (error) {

      console.error("POST GPS Error:", error);

      setStatus("Gagal mengirim GPS: " + error.message);

    }
  }

  // Ambil GPS browser
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

        setPosition({ lat, lng });

        // Kirim koordinat ke Rust API
        await sendGPS(lat, lng);

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
  }

  // Otomatis ketika website dibuka
  useEffect(() => {
    getGPS();
  }, []);

  return (

    <div className="home">

      <h2>GPS LOCATION TRACKER</h2>

      <p className="gps-status">{status}</p>

      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="map"
        scrollWheelZoom={true}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            <UpdateMap position={position} />

            <Marker
              position={[position.lat, position.lng]}
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
            <p>Latitude: {position.lat.toFixed(7)}</p>
            <p>Longitude: {position.lng.toFixed(7)}</p>

            <button onClick={getGPS}>
              REFRESH GPS
            </button>
          </>
        ) : (
          <p>Menunggu koordinat GPS...</p>
        )}

      </div>

    </div>
  );
}
