import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROOT } from "../config/api";

function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_ROOT}/contact/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div style={outerStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>My Support Tickets 🎫</h2>

        {tickets.length === 0 ? (
          <p style={{ textAlign: "center" }}>No messages yet</p>
        ) : (
          tickets.map((t) => (
            <div key={t.id} style={cardStyle}>
              
              <div style={rowStyle}>
                <span style={label}>Subject:</span>
                <span>{t.subject}</span>
              </div>

              <div style={rowStyle}>
                <span style={label}>Message:</span>
                <span>{t.message}</span>
              </div>

              <div style={rowStyle}>
                <span style={label}>Status:</span>
                <span
                  style={{
                    ...badge,
                    background:
                      t.status === "RESOLVED" ? "#2ecc71" : "#f1c40f"
                  }}
                >
                  {t.status}
                </span>
              </div>

              <div style={rowStyle}>
                <span style={label}>Reply:</span>
                <span style={{ color: "#7eb8f7" }}>
                  {t.reply ? t.reply : "⏳ Waiting for reply"}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* 🔥 STYLES */

const outerStyle = {
  minHeight: "100vh",
  background: "#060a12",
  display: "flex",
  justifyContent: "center",
  paddingTop: "40px",
  color: "white"
};

const containerStyle = {
  width: "600px"
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "30px",
  fontFamily: "serif"
};

const cardStyle = {
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "15px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px"
};

const label = {
  fontWeight: "bold",
  opacity: 0.7
};

const badge = {
  padding: "4px 10px",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#06101e",
  fontWeight: "bold"
};

export default MyTickets;
