import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { API_ROOT } from "../config/api";

function Contact() {
  const { user } = useAuth();

  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState("General");
  const [priority, setPriority] = useState("LOW");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first ❌");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_ROOT}/contact`,
        {
          subject,
          priority,
          message: msg
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Message Sent to Admin ✅");
      setMsg("");
      setSubject("General");
      setPriority("LOW");

    } catch (err) {
      alert("Failed to send message ❌");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:ital,wght@0,600;1,400&display=swap');
        
        .contact-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000000;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          padding: 20px;
        }

        .contact-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 16px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 193, 7, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .contact-title {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          text-align: center;
          margin-bottom: 10px;
          color: #ffffff;
        }

        .contact-subtitle {
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 30px;
          font-weight: 300;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ffc107;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .contact-input, .contact-select, .contact-textarea {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: #111111;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .contact-input:disabled {
          color: rgba(255, 255, 255, 0.3);
          border-color: transparent;
        }

        .contact-input:focus, .contact-select:focus, .contact-textarea:focus {
          border-color: #ffc107;
          background: #141414;
        }

        .contact-textarea {
          resize: none;
          min-height: 120px;
        }

        .contact-btn {
          width: 100%;
          padding: 16px;
          margin-top: 10px;
          border-radius: 8px;
          border: none;
          background: #ffc107;
          color: #000000;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contact-btn:hover {
          background: #ffdb70;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 193, 7, 0.15);
        }

        .contact-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="contact-page">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="contact-card"
        >
          <h2 className="contact-title">Contact-Us</h2>
          <p className="contact-subtitle">How can we assist you today?</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Member Details</label>
              <input
                type="text"
                value={user?.name || "Guest"}
                disabled
                className="contact-input"
                style={{ marginBottom: '10px' }}
              />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="contact-input"
              />
            </div>

            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label className="input-label">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="contact-select"
                >
                  <option value="General">General</option>
                  <option value="Bug">Technical</option>
                  <option value="Payment">Billing</option>
                  <option value="Feedback">Feedback</option>
                </select>
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="contact-select"
                >
                  <option value="LOW">Routine</option>
                  <option value="MEDIUM">Urgent</option>
                  <option value="HIGH">Critical</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Message</label>
              <textarea
                placeholder="Details of your inquiry..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                className="contact-textarea"
              />
            </div>

            <button type="submit" className="contact-btn">
              Dispatch Message
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default Contact;
