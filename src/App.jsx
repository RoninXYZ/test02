

import { useState } from "react";

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

// Custom marker
const gpsIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Update map position
function UpdateMap({ position }) {

  const map = useMap();

  if (position) {
    map.setView(
      [position.lat, position.lng],
      16
    );
  }

  return null;
}

// Main component
export default function Home() {

  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState("Meminta izin GPS...");

  // Get device GPS
  function getGPS() {

    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS");
      return;
    }

    setStatus("Mengambil koordinat GPS...");

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition({ lat, lng });

        setStatus("GPS berhasil diperoleh");

      },

      (error) => {

        setStatus("GPS gagal: " + error.message);

      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }

    );

  }

  // Run when web opens
  useState(() => {
    getGPS();
  }, []);

  return (

    <div className="home">

      <h2>Lokasi anda sekarang</h2>

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
