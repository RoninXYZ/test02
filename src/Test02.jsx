
import { useEffect } from "react";
import "./Test00.css";

const API_URL =
  "https://underpaid-lumping-landed.ngrok-free.dev/gps";

function App() {

  useEffect(() => {
    if (!navigator.geolocation) return;

    let active = true;

    const sendGPS = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!active) return;

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            await fetch(API_URL, {
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

          } catch (error) {
            console.error(error);
          }
        },

        (error) => {
          console.error(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    };

    sendGPS();

    const interval = setInterval(
      sendGPS,
      15 * 60 * 1000
    );

    return () => {
      active = false;
      clearInterval(interval);
    };

  }, []);

  return null;
}

export default App;
