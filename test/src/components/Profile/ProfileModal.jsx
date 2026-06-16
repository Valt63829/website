import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────
   All CSS injected into <head> — bypasses any
   Tailwind / parent transform / overflow issues
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  #pm-portal-root {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    z-index: 2147483647 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    background: #07091a !important;
    font-family: 'DM Sans', sans-serif !important;
    isolation: isolate !important;
    transform: none !important;
    filter: none !important;
    contain: layout style !important;
  }

  #pm-portal-root * { box-sizing: border-box; }

  .pm-fadein {
    animation: pmFadeIn 0.32s cubic-bezier(.22,.68,0,1.2) both;
  }
  @keyframes pmFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Ambient blobs (fixed so they cover whole screen) */
  .pm-blob1, .pm-blob2 {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(90px);
  }
  .pm-blob1 {
    top: -15%; left: -10%;
    width: 60vw; height: 60vw;
    background: radial-gradient(circle, rgba(139,92,246,.18) 0%, transparent 70%);
    animation: pmD1 14s ease-in-out infinite alternate;
  }
  .pm-blob2 {
    bottom: -10%; right: -8%;
    width: 55vw; height: 55vw;
    background: radial-gradient(circle, rgba(59,130,246,.14) 0%, transparent 70%);
    animation: pmD2 18s ease-in-out infinite alternate;
  }
  @keyframes pmD1 { to { transform: translate(7%,12%) scale(1.12); } }
  @keyframes pmD2 { to { transform: translate(-7%,-9%) scale(1.09); } }

  /* ── HEADER ── */
  .pm-header {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px;
    padding: 14px 18px;
    background: rgba(7,9,26,.85);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border-bottom: 1px solid rgba(139,92,246,.15);
  }
  @media(min-width:600px){ .pm-header { padding: 16px 36px; } }

  .pm-brand { display:flex; align-items:center; gap:10px; }
  .pm-logo {
    width:30px; height:30px; border-radius:8px; font-size:15px;
    background: linear-gradient(135deg,#8b5cf6,#3b82f6);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .pm-title {
    font-family:'Syne',sans-serif; font-size:17px; font-weight:700;
    color:#fff; margin:0; letter-spacing:-.01em;
  }
  @media(min-width:600px){ .pm-title { font-size:20px; } }

  .pm-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }

  /* Buttons */
  .pm-btn {
    border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    border-radius:10px; padding:8px 16px;
    transition:all .2s; white-space:nowrap;
    display:inline-flex; align-items:center; justify-content:center;
  }
  @media(min-width:600px){ .pm-btn { font-size:14px; padding:9px 20px; } }
  .pm-ghost {
    background:rgba(255,255,255,.07); color:rgba(255,255,255,.82);
    border:1px solid rgba(255,255,255,.1);
  }
  .pm-ghost:hover { background:rgba(255,255,255,.13); }
  .pm-purple {
    background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:#fff;
    box-shadow:0 0 20px rgba(139,92,246,.35);
  }
  .pm-purple:hover {
    background:linear-gradient(135deg,#a071ff,#8b5cf6);
    box-shadow:0 0 30px rgba(139,92,246,.52);
    transform:translateY(-1px);
  }
  .pm-purple:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .pm-close-btn {
    background:rgba(255,255,255,.06); color:rgba(255,255,255,.5);
    border:1px solid rgba(255,255,255,.08);
    width:36px; height:36px; padding:0; border-radius:10px; font-size:15px;
  }
  .pm-close-btn:hover { background:rgba(255,255,255,.13); color:#fff; }
  .pm-saved-tag {
    font-size:12px; color:#34d399;
    background:rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.2);
    border-radius:20px; padding:4px 11px;
    animation:pmFadeIn .3s ease;
  }

  /* ── SCROLL BODY ── */
  .pm-body {
    position:relative; z-index:1;
    width:100%; max-width:720px;
    margin:0 auto; padding:28px 16px 70px;
  }
  @media(min-width:600px){ .pm-body { padding:40px 28px 80px; } }
  @media(min-width:1024px){ .pm-body { padding:48px 0 80px; } }

  /* ── HERO ── */
  .pm-hero {
    display:flex; flex-direction:column;
    align-items:center; margin-bottom:36px;
  }
  .pm-av-shell {
    position:relative; width:96px; height:96px; margin-bottom:16px;
  }
  @media(min-width:600px){ .pm-av-shell { width:116px; height:116px; } }
  .pm-av-ring {
    position:absolute; inset:-4px; border-radius:50%;
    background:conic-gradient(from 0deg,#8b5cf6,#3b82f6,#06b6d4,#8b5cf6);
    animation:pmSpin 6s linear infinite; z-index:0;
  }
  @keyframes pmSpin { to { transform:rotate(360deg); } }
  .pm-av-mask {
    position:absolute; inset:3px; border-radius:50%;
    background:#07091a; z-index:1;
  }
  .pm-avatar {
    position:relative; z-index:2;
    width:100%; height:100%; border-radius:50%;
    background:linear-gradient(135deg,#8b5cf6,#3b82f6);
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif; font-size:38px; font-weight:800; color:#fff;
    box-shadow:0 8px 32px rgba(139,92,246,.4);
  }
  @media(min-width:600px){ .pm-avatar { font-size:46px; } }

  .pm-hero-name {
    font-family:'Syne',sans-serif; font-size:24px; font-weight:700;
    color:#fff; text-align:center; letter-spacing:-.02em;
    margin:0 0 5px; word-break:break-word; padding:0 16px;
  }
  @media(min-width:600px){ .pm-hero-name { font-size:30px; } }
  .pm-hero-email {
    font-size:13px; color:rgba(255,255,255,.35);
    text-align:center; word-break:break-all; padding:0 16px;
  }
  .pm-pills {
    display:flex; flex-wrap:wrap;
    justify-content:center; gap:8px; margin-top:16px;
  }
  .pm-pill {
    background:rgba(139,92,246,.1);
    border:1px solid rgba(139,92,246,.2);
    border-radius:20px; padding:5px 13px;
    font-size:12px; color:rgba(255,255,255,.5);
    display:flex; align-items:center; gap:5px;
  }
  .pm-pill b { color:rgba(139,92,246,.9); }

  /* ── SECTION LABEL ── */
  .pm-sec {
    font-family:'Syne',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:.12em; text-transform:uppercase;
    color:rgba(139,92,246,.55); margin:0 0 12px;
  }

  /* ── GRID ── */
  .pm-grid { display:grid; grid-template-columns:1fr; gap:10px; }
  @media(min-width:600px){ .pm-grid { grid-template-columns:1fr 1fr; gap:12px; } }
  .pm-span2 { grid-column:1/-1; }

  /* ── CARDS ── */
  .pm-card {
    background:rgba(255,255,255,.03);
    border:1px solid rgba(255,255,255,.07);
    border-radius:16px; padding:16px 18px;
    transition:border-color .2s,background .2s;
  }
  .pm-card:hover {
    border-color:rgba(139,92,246,.22);
    background:rgba(139,92,246,.04);
  }
  .pm-clabel {
    font-size:10px; font-weight:500; letter-spacing:.1em;
    text-transform:uppercase; color:rgba(255,255,255,.26);
    margin-bottom:8px; display:flex; align-items:center; gap:5px;
  }
  .pm-cval {
    font-size:15px; color:rgba(255,255,255,.88);
    word-break:break-word; line-height:1.5;
  }
  .pm-cval.empty { color:rgba(255,255,255,.22); font-style:italic; }
  .pm-cnote { font-size:11px; color:rgba(255,255,255,.2); margin-top:4px; }

  /* ── INPUTS ── */
  .pm-input, .pm-ta {
    width:100%;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.1);
    border-radius:10px; padding:10px 13px;
    font-family:'DM Sans',sans-serif; font-size:14px; color:#fff; outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .pm-input::placeholder,.pm-ta::placeholder { color:rgba(255,255,255,.2); }
  .pm-input:focus,.pm-ta:focus {
    border-color:rgba(139,92,246,.6);
    box-shadow:0 0 0 3px rgba(139,92,246,.12);
  }
  .pm-ta { resize:none; min-height:100px; }

  /* ── DIVIDER & JOINED ── */
  .pm-divider { border:none; border-top:1px solid rgba(255,255,255,.06); margin:24px 0; }
  .pm-joined {
    display:flex; align-items:center; gap:14px;
    background:rgba(255,255,255,.02);
    border:1px solid rgba(255,255,255,.06);
    border-radius:16px; padding:16px 18px;
  }
  .pm-joined-icon {
    width:40px; height:40px; border-radius:10px;
    background:rgba(139,92,246,.12);
    display:flex; align-items:center; justify-content:center;
    font-size:18px; flex-shrink:0;
  }
  .pm-joined-sub {
    font-size:10px; font-weight:500; letter-spacing:.1em;
    text-transform:uppercase; color:rgba(255,255,255,.24); margin-bottom:4px;
  }
  .pm-joined-date { font-size:15px; color:rgba(255,255,255,.82); }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const ProfileModal = ({ onClose }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  /*
   * Create a dedicated <div id="pm-portal-root"> directly on <body>
   * so NO ancestor transform/overflow/filter can clip it.
   */
  const portalNode = useRef(null);
  if (!portalNode.current) {
    // Reuse if somehow already in DOM
    let el = document.getElementById("pm-portal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "pm-portal-root";
      document.body.appendChild(el);
    }
    portalNode.current = el;
  }

  // Inject styles into <head>
  const styleNode = useRef(null);
  if (!styleNode.current) {
    let s = document.getElementById("pm-injected-styles");
    if (!s) {
      s = document.createElement("style");
      s.id = "pm-injected-styles";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    styleNode.current = s;
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      portalNode.current?.remove();
      styleNode.current?.remove();
    };
  }, []);

  if (!user) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (form.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
        await auth.currentUser.reload();
      }
      setSaved(true);
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      bio: user?.bio || "",
    });
    setEditing(false);
    setSaved(false);
  };

  const initial      = (editing ? form.displayName : user.displayName)?.charAt(0)?.toUpperCase() || "?";
  const displayedName = editing ? form.displayName || "Your Name" : user.displayName || "Your Name";
  const joinedDate   = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "N/A";

  const modal = (
    <div className="pm-fadein" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="pm-blob1" />
      <div className="pm-blob2" />

      {/* ── HEADER ── */}
      <header className="pm-header">
        <div className="pm-brand">
          <div className="pm-logo">🌙</div>
          <h2 className="pm-title">Profile</h2>
        </div>

        <div className="pm-actions">
          {editing ? (
            <>
              <button className="pm-btn pm-ghost"  onClick={handleCancel}>Cancel</button>
              <button className="pm-btn pm-purple" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              {saved && <span className="pm-saved-tag">✓ Saved</span>}
              <button className="pm-btn pm-purple"    onClick={() => setEditing(true)}>Edit Profile</button>
              <button className="pm-btn pm-close-btn" onClick={onClose} aria-label="Close">✕</button>
            </>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="pm-body">

        {/* Hero */}
        <div className="pm-hero">
          <div className="pm-av-shell">
            <div className="pm-av-ring"  />
            <div className="pm-av-mask"  />
            <div className="pm-avatar">{initial}</div>
          </div>
          <h3 className="pm-hero-name">{displayedName}</h3>
          <p  className="pm-hero-email">{user.email}</p>
          <div className="pm-pills">
            <div className="pm-pill">🟢 <b>Online</b></div>
            <div className="pm-pill">🛡️ <b>User</b></div>
            <div className="pm-pill">📅 Joined <b>{joinedDate}</b></div>
          </div>
        </div>

        {/* Fields */}
        <p className="pm-sec">Personal Information</p>

        <div className="pm-grid">

          <div className="pm-card">
            <div className="pm-clabel">👤 Display Name</div>
            {editing
              ? <input className="pm-input" type="text" name="displayName" value={form.displayName} onChange={handleChange} placeholder="Enter your name" />
              : <div className={`pm-cval${!user.displayName ? " empty" : ""}`}>{user.displayName || "Not set"}</div>
            }
          </div>

          <div className="pm-card">
            <div className="pm-clabel">✉️ Email</div>
            <div className="pm-cval">{user.email}</div>
            <div className="pm-cnote">Cannot be changed here</div>
          </div>

          <div className="pm-card">
            <div className="pm-clabel">📞 Phone Number</div>
            {editing
              ? <input className="pm-input" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Enter your phone" />
              : <div className={`pm-cval${!user.phoneNumber ? " empty" : ""}`}>{user.phoneNumber || "Not set"}</div>
            }
          </div>

          <div className="pm-card">
            <div className="pm-clabel">📍 Location</div>
            {editing
              ? <input className="pm-input" type="text" name="location" value={form.location} onChange={handleChange} placeholder="Enter your location" />
              : <div className={`pm-cval${!user.location ? " empty" : ""}`}>{user.location || "Not set"}</div>
            }
          </div>

          <div className="pm-card pm-span2">
            <div className="pm-clabel">✍️ Bio</div>
            {editing
              ? <textarea className="pm-ta" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself…" rows={4} />
              : <div className={`pm-cval${!user.bio ? " empty" : ""}`}>{user.bio || "Not set"}</div>
            }
          </div>

        </div>

        <hr className="pm-divider" />

        <div className="pm-joined">
          <div className="pm-joined-icon">🗓️</div>
          <div>
            <div className="pm-joined-sub">Member since</div>
            <div className="pm-joined-date">{joinedDate}</div>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modal, portalNode.current);
};

export default ProfileModal;