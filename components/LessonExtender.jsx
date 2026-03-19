import { useState, useRef, useCallback } from "react";

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve({ dataUrl, base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Styles for CLASS mode ──────────────────────────────────────
const CLASS_STYLES = {
  warmup: { label: "Warm-up",    dot: "#F97316", border: "#FED7AA", bg: "#FFF7ED", color: "#C2410C" },
  book:   { label: "Book",       dot: "#38BDF8", border: "#BAE6FD", bg: "#F0F9FF", color: "#0369A1" },
  new:    { label: "Speaking ✦", dot: "#22C55E", border: "#BBF7D0", bg: "#F0FDF4", color: "#15803D" },
};

// ── Styles for 1-on-1 mode ────────────────────────────────────
const SOLO_STYLES = {
  opener:   { label: "Opener",      dot: "#F97316", border: "#FED7AA", bg: "#FFF7ED", color: "#C2410C" },
  book:     { label: "Book",        dot: "#38BDF8", border: "#BAE6FD", bg: "#F0F9FF", color: "#0369A1" },
  speaking: { label: "You & Me ✦",  dot: "#8B5CF6", border: "#DDD6FE", bg: "#F5F3FF", color: "#6D28D9" },
  question: { label: "T asks →",    dot: "#EC4899", border: "#FBCFE8", bg: "#FDF2F8", color: "#BE185D" },
  task:     { label: "Student task",dot: "#22C55E", border: "#BBF7D0", bg: "#F0FDF4", color: "#15803D" },
};

// 25002500 Young Learners mode styles 2500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500
const KIDS_STYLES = {
  hello: { label: "Hello!",  dot: "#F59E0B", border: "#FDE68A", bg: "#FFFBEB", color: "#92400E" },
  book:  { label: "Book",    dot: "#38BDF8", border: "#BAE6FD", bg: "#F0F9FF", color: "#0369A1" },
  move:  { label: "Move!",   dot: "#F97316", border: "#FED7AA", bg: "#FFF7ED", color: "#C2410C" },
  say:   { label: "Say it!", dot: "#22C55E", border: "#BBF7D0", bg: "#F0FDF4", color: "#15803D" },
  game:  { label: "Game",    dot: "#EC4899", border: "#FBCFE8", bg: "#FDF2F8", color: "#BE185D" },
};

// Young Learners 1-on-1 styles
const KIDS_SOLO_STYLES = {
  hello:  { label: "Hello!",     dot: "#F59E0B", border: "#FDE68A", bg: "#FFFBEB", color: "#92400E" },
  book:   { label: "Book",       dot: "#38BDF8", border: "#BAE6FD", bg: "#F0F9FF", color: "#0369A1" },
  show:   { label: "Show me!",   dot: "#F97316", border: "#FED7AA", bg: "#FFF7ED", color: "#C2410C" },
  ask:    { label: "T asks",     dot: "#EC4899", border: "#FBCFE8", bg: "#FDF2F8", color: "#BE185D" },
  play:   { label: "We play!",   dot: "#8B5CF6", border: "#DDD6FE", bg: "#F5F3FF", color: "#6D28D9" },
};

function buildKidsPrompt(level, duration) {
  return `You are an EFL teacher for very young children aged 5-7. Look at this course book page.

Level: ${level}. Duration: ${duration} minutes.

Design a lesson for 5-year-olds. Activities must be physical, visual, playful and very short. Children cannot sit still or focus for long. Use songs, gestures, actions, repetition, simple games, and lots of praise.

Return ONLY a raw JSON object, no markdown, no backticks. Start with { end with }.

Format:
{"topic":"...","level":"...","duration":"...","steps":[{"time":"3 min","title":"...","origin":"hello","description":"..."},{"time":"5 min","title":"...","origin":"book","description":"Ex. 1 - brief name"},{"time":"5 min","title":"...","origin":"move","description":"..."},{"time":"7 min","title":"...","origin":"say","description":"..."},{"time":"5 min","title":"...","origin":"game","description":"..."}]}

origin values:
- "hello": a fun physical warm-up (wave, jump, clap, call-and-response chant to greet and energise)
- "book": just name the exercise briefly, nothing more
- "move": a TPR or physical activity tied to the vocabulary — children act out words, point, touch, mime, jump on flashcards
- "say": a simple choral speaking activity — repeat after teacher, echo game, call-and-response, picture-prompt sentences
- "game": a short fun game — Simon Says, memory game, mystery bag, pass the flashcard, running game with vocabulary

Rules:
- Max 3 minutes per activity for "hello" and "say"
- Keep ALL instructions extremely simple — one action at a time
- Include clapping, movement, or sound in every activity
- No reading or writing
- Include 5-6 steps total, at least 1 "move", 1 "say", 1 "game"`;
}


function buildKidsSoloPrompt(level, duration) {
  return `You are an EFL tutor working one-to-one with a single child aged 5-7. Look at this course book page.

Level: ${level}. Duration: ${duration} minutes.

This is a private lesson — just you and one child. Everything must feel like play. Use the child's name, toys, favourite colours, family members, and surroundings. Activities must be tiny, fun, and physical. Lots of praise and encouragement.

Return ONLY a raw JSON object, no markdown, no backticks. Start with { end with }.

Format:
{"topic":"...","level":"...","duration":"...","steps":[{"time":"3 min","title":"...","origin":"hello","description":"..."},{"time":"5 min","title":"...","origin":"book","description":"Ex. 1 - brief name"},{"time":"5 min","title":"...","origin":"show","description":"..."},{"time":"5 min","title":"...","origin":"ask","description":"..."},{"time":"7 min","title":"...","origin":"play","description":"..."}]}

origin values:
- "hello": greet the child warmly, ask one simple personal question (e.g. "What colour is your bag today?"), link to topic
- "book": just name the exercise briefly, nothing more
- "show": teacher shows a flashcard/picture/object and child points, names, or mimes — simple physical response
- "ask": teacher asks the child 3-4 very simple questions about the topic using the vocabulary, child answers in words or short sentences
- "play": a tiny game for two — snap, matching pairs, I spy, mystery object, simple role-play (e.g. playing shop or ordering food)

Rules:
- Every step involves the child physically doing something (pointing, clapping, picking up, miming)
- Use the child's own life — their toys, pets, family, food preferences
- No worksheets, no long sentences, no abstract explanations
- Lots of repetition and praise
- Include 5-6 steps total`;
}

function buildClassPrompt(level, duration) {
  return `You are an EFL teacher. Look at this course book page and create a lesson plan JSON.

Level: ${level}. Duration: ${duration} minutes.

Return ONLY a raw JSON object, nothing else, no markdown, no backticks. Start with { end with }.

Format:
{"topic":"...","level":"...","duration":"...","steps":[{"time":"5 min","title":"...","origin":"warmup","description":"..."},{"time":"7 min","title":"...","origin":"book","description":"Ex. 1 - brief name only"},{"time":"10 min","title":"...","origin":"new","description":"full speaking activity description"}]}

Rules:
- origin "warmup": short engaging starter you invent
- origin "book": just name the exercise briefly, do not explain it
- origin "new": a full speaking activity you invent (these are the most important)
- Include 5-6 steps total, at least 2 must be origin "new"
- Focus on speaking`;
}

function buildSoloPrompt(level, duration) {
  return `You are an EFL tutor planning a one-to-one lesson with a single student. Look at this course book page.

Level: ${level}. Duration: ${duration} minutes.

This is a 1-on-1 lesson. Everything is a conversation between teacher and student. No group work, no pair work. Design activities that only work between two people talking together.

Return ONLY a raw JSON object, no markdown, no backticks. Start with { end with }.

Format:
{"topic":"...","level":"...","duration":"...","steps":[{"time":"5 min","title":"...","origin":"opener","description":"..."},{"time":"5 min","title":"...","origin":"book","description":"Ex. 1 - brief name only"},{"time":"8 min","title":"...","origin":"question","description":"..."},{"time":"10 min","title":"...","origin":"speaking","description":"..."},{"time":"7 min","title":"...","origin":"task","description":"..."}]}

origin values:
- "opener": a casual personal question or quick chat to warm up (e.g. "Ask the student about their week, then link it to today's topic")
- "book": just name the exercise briefly, nothing more
- "question": a set of questions the TEACHER asks the student about the topic — list 3-4 real questions to spark conversation
- "speaking": a mini speaking task done together — roleplay, opinion exchange, storytelling, show-and-tell using the student's own life
- "task": student produces something independently — describes a picture, tells a story, gives their opinion — teacher listens and responds naturally

Rules:
- Include 5-6 steps, at least 1 "question" and 2 of "speaking" or "task"
- Everything must be conversational — teacher reacts, asks follow-ups, shares opinions too
- Use the student's personal life and interests wherever possible
- No worksheets, no writing during speaking time`;
}

export default function LessonExtender({ login, onLogout }) {
  const [mode, setMode]         = useState("class"); // "class" | "solo" | "kids" | "kidssolo"
  const [image, setImage]       = useState(null);
  const [level, setLevel]       = useState("A1");
  const [duration, setDuration] = useState("45");
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [debug, setDebug]       = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const planRef = useRef(null);

  const isSolo = mode === "solo";
  const isKids = mode === "kids";
  const isKidsSolo = mode === "kidssolo";
  const STYLES = mode === "class" ? CLASS_STYLES : mode === "solo" ? SOLO_STYLES : mode === "kidssolo" ? KIDS_SOLO_STYLES : KIDS_STYLES;

  const reset = () => { setPlan(null); setError(""); setDebug(""); };

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) { setError("Please upload an image."); return; }
    reset(); setImage(null);
    try { setImage(await compressImage(file)); }
    catch (e) { setError("Could not process image: " + e.message); }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const generate = async () => {
    if (!image) return;
    reset(); setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);

    try {
      const prompt = mode === "class" ? buildClassPrompt(level, duration) : mode === "solo" ? buildSoloPrompt(level, duration) : mode === "kidssolo" ? buildKidsSoloPrompt(level, duration) : buildKidsPrompt(level, duration);

      const response = await fetch("/api/generate", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: login,
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });

      const data = await response.json();
      setDebug("stop_reason: " + data.stop_reason + " | error: " + JSON.stringify(data.error || null));

      if (data.error) throw new Error(data.error.type + ": " + data.error.message);
      if (!data.content?.length) throw new Error("No content. Response: " + JSON.stringify(data).slice(0, 300));

      const text = data.content.map((b) => b.text || "").join("").trim();
      const first = text.indexOf("{");
      const last  = text.lastIndexOf("}");
      if (first === -1) throw new Error("No JSON returned. Model said: " + text.slice(0, 300));

      const parsed = JSON.parse(text.slice(first, last + 1));
      if (!Array.isArray(parsed.steps)) throw new Error("No steps. Got: " + JSON.stringify(parsed).slice(0, 200));

      setPlan(parsed);
      setDebug("");
      setTimeout(() => planRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    } catch (e) {
      setError(e.name === "AbortError" ? "Timed out — try again." : e.message);
    } finally {
      clearTimeout(timer); setLoading(false);
    }
  };

  const speakingOrigins = isSolo ? ["speaking","task","question"] : isKids ? ["move","say","game"] : isKidsSolo ? ["show","ask","play"] : ["new"];
  const speakingCount = plan?.steps?.filter((s) => speakingOrigins.includes(s.origin)).length || 0;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1E293B", padding: "18px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📚</span>
          <div>
            <h1 style={{ margin: 0, color: "#F1F5F9", fontSize: 17, fontWeight: 700 }}>Lesson Extender</h1>
            <p style={{ margin: 0, color: "#64748B", fontSize: 10, letterSpacing: 1 }}>PHOTO → PLAN → SPEAK</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#94A3B8", fontSize: 12, padding: "6px 12px", cursor: "pointer" }}>← Exit</button>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 16px" }}>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#E2E8F0", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
          {[
            { key: "class", icon: "👥", label: "Class", sub: "Group lesson" },
            { key: "solo",  icon: "👤", label: "1-on-1", sub: "Individual" },
            { key: "kids",     icon: "🧒", label: "Young Learners", sub: "Ages 5+" },
            { key: "kidssolo", icon: "⭐", label: "YL 1-on-1", sub: "Child + Teacher" },
          ].map(({ key, icon, label, sub }) => (
            <button
              key={key}
              onClick={() => { setMode(key); reset(); }}
              style={{
                flex: 1, border: "none", borderRadius: 9, padding: "10px 8px",
                background: mode === key ? "#fff" : "transparent",
                boxShadow: mode === key ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                cursor: "pointer", transition: "all .18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: mode === key ? "#1E293B" : "#64748B", fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{label}</div>
                <div style={{ color: mode === key ? "#64748B" : "#94A3B8", fontSize: 11 }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Info strips */}
        {isSolo && (
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>👤</span>
            <p style={{ margin: 0, color: "#6D28D9", fontSize: 12, lineHeight: 1.6 }}>
              <strong>1-on-1 mode:</strong> Activities are designed for teacher + one student only — personal conversations, tailored questions, and tasks that use the student's own life and interests.
            </p>
          </div>
        )}
        {isKids && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🧒</span>
            <p style={{ margin: 0, color: "#92400E", fontSize: 12, lineHeight: 1.6 }}>
              <strong>Young Learners mode (5+):</strong> Short, physical, playful activities — songs, games, actions and chants. No reading or writing. Maximum fun, maximum movement.
            </p>
          </div>
        )}
        {isKidsSolo && (
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⭐</span>
            <p style={{ margin: 0, color: "#6D28D9", fontSize: 12, lineHeight: 1.6 }}>
              <strong>Young Learners 1-on-1 (5+):</strong> Private lesson for one child — tiny games, personal questions, show-and-tell, and activities that use the child's own world.
            </p>
          </div>
        )}

        {/* Upload card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, marginBottom: 14 }}>

          <div
            onClick={() => !image && fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            style={{
              border: dragging ? "2px dashed #6366F1" : image ? "2px solid #22C55E" : "2px dashed #CBD5E1",
              borderRadius: 12, background: dragging ? "#EEF2FF" : image ? "#F0FDF4" : "#F8FAFC",
              cursor: image ? "default" : "pointer", transition: "all .2s",
              minHeight: image ? "auto" : 130,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative",
            }}
          >
            {image ? (
              <>
                <img src={image.dataUrl} alt="book" style={{ width: "100%", maxHeight: 360, objectFit: "contain", display: "block" }} />
                <button onClick={(e) => { e.stopPropagation(); setImage(null); reset(); }}
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(30,41,59,.85)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, padding: "5px 11px", cursor: "pointer" }}>
                  ✕ Remove
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>📷</div>
                <p style={{ margin: "0 0 4px", color: "#475569", fontSize: 14, fontWeight: 600 }}>Drop your course book photo</p>
                <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>or click to browse</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />

          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            {[
              { label: "Level",    val: level,    set: setLevel,    opts: ["A1","A2","B1","B2","C1","C2"] },
              { label: "Duration", val: duration, set: setDuration, opts: ["45","60","75","90"] },
            ].map(({ label, val, set, opts }) => (
              <div key={label} style={{ flex: 1 }}>
                <label style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
                <select value={val} onChange={(e) => set(e.target.value)} style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 14, color: "#1E293B", background: "#F8FAFC", cursor: "pointer", outline: "none" }}>
                  {opts.map((o) => <option key={o} value={o}>{label === "Duration" ? `${o} min` : o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, color: "#B91C1C", fontSize: 12, wordBreak: "break-all" }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          {debug && (
            <div style={{ marginTop: 6, padding: "8px 12px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 8, color: "#475569", fontSize: 11, wordBreak: "break-all", fontFamily: "monospace" }}>
              {debug}
            </div>
          )}

          <button onClick={generate} disabled={loading || !image} style={{
            marginTop: 14, width: "100%",
            background: !image ? "#F1F5F9" : loading ? (isSolo ? "#A78BFA" : isKids ? "#FCD34D" : isKidsSolo ? "#A78BFA" : "#818CF8") : (isSolo ? "#7C3AED" : isKids ? "#D97706" : isKidsSolo ? "#7C3AED" : "#4F46E5"),
            border: "none", borderRadius: 10, color: !image ? "#94A3B8" : "#fff",
            fontSize: 14, fontWeight: 600, padding: "12px 0",
            cursor: !image || loading ? "not-allowed" : "pointer", transition: "background .2s",
          }}>
            {loading
              ? (isSolo ? "✦ Designing your 1-on-1 session…" : isKids ? "✦ Planning your kids lesson…" : isKidsSolo ? "✦ Planning your 1-on-1 kids session…" : "✦ Building your lesson plan…")
              : !image ? "Upload a photo to start"
              : (isSolo ? "✦ Generate 1-on-1 Plan" : isKids ? "✦ Generate Kids Plan" : isKidsSolo ? "✦ Generate YL 1-on-1 Plan" : "✦ Generate Lesson Plan")}
          </button>
        </div>

        {/* Plan output */}
        {plan && (
          <div ref={planRef}>

            {/* Title bar */}
            <div style={{ background: isSolo ? "#2E1065" : isKids ? "#78350F" : isKidsSolo ? "#2E1065" : "#1E293B", borderRadius: 14, padding: "16px 20px", marginBottom: 12 }}>
              <p style={{ margin: "0 0 2px", color: isSolo ? "#C4B5FD" : isKids ? "#FDE68A" : isKidsSolo ? "#C4B5FD" : "#94A3B8", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                {isSolo ? "1-on-1 Speaking Plan" : isKids ? "Young Learners Plan" : isKidsSolo ? "YL 1-on-1 Plan" : "Lesson Extender"}
              </p>
              <h2 style={{ margin: "0 0 8px", color: "#F1F5F9", fontSize: 18, fontWeight: 700 }}>{plan.topic}</h2>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {[plan.level, plan.duration].filter(Boolean).map((t) => (
                  <span key={t} style={{ background: "rgba(255,255,255,.08)", borderRadius: 20, color: "#CBD5E1", fontSize: 12, padding: "3px 11px" }}>{t}</span>
                ))}
                <span style={{
                  background: isSolo ? "rgba(139,92,246,.25)" : isKids ? "rgba(245,158,11,.2)" : isKidsSolo ? "rgba(139,92,246,.25)" : "rgba(34,197,94,.15)",
                  borderRadius: 20,
                  color: isSolo ? "#C4B5FD" : isKids ? "#D97706" : isKidsSolo ? "#C4B5FD" : "#4ADE80",
                  fontSize: 12, padding: "3px 11px",
                }}>
                  {isSolo ? `💬 ${speakingCount} speaking moments` : isKids ? `🎲 ${speakingCount} activities` : isKidsSolo ? `⭐ ${speakingCount} activities` : `💬 ${speakingCount} speaking activities`}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              {Object.entries(STYLES).map(([key, s]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
                  <span style={{ color: "#64748B", fontSize: 12 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {plan.steps.map((step, i) => {
                const s = STYLES[step.origin] || (isSolo ? SOLO_STYLES.speaking : isKids ? KIDS_STYLES.say : isKidsSolo ? KIDS_SOLO_STYLES.play : CLASS_STYLES.new);
                const isLast = i === plan.steps.length - 1;
                const isHighlight = isSolo ? ["speaking","task","question"].includes(step.origin) : isKids ? ["move","say","game"].includes(step.origin) : isKidsSolo ? ["show","ask","play"].includes(step.origin) : step.origin === "new";

                return (
                  <div key={i} style={{ display: "flex" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: "50%", background: s.dot, border: "2px solid #fff", boxShadow: `0 0 0 2px ${s.dot}40`, marginTop: 18, flexShrink: 0 }} />
                      {!isLast && <div style={{ width: 2, flex: 1, background: "#E2E8F0", marginTop: 3 }} />}
                    </div>
                    <div style={{
                      flex: 1, marginLeft: 10, marginBottom: isLast ? 0 : 9,
                      background: isHighlight ? "#fff" : "#FAFAFA",
                      border: isHighlight ? `1px solid ${s.border}` : "1px solid #E2E8F0",
                      borderLeft: `3px solid ${s.dot}`,
                      borderRadius: 12, padding: "13px 15px",
                      boxShadow: isHighlight ? `0 2px 8px ${s.dot}18` : "none",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>{s.label}</span>
                          <h3 style={{ margin: 0, color: "#1E293B", fontSize: 13, fontWeight: 700 }}>{step.title}</h3>
                        </div>
                        <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{step.time}</span>
                      </div>
                      <p style={{ margin: 0, color: step.origin === "book" ? "#64748B" : "#334155", fontSize: 13, lineHeight: 1.65, fontStyle: step.origin === "book" ? "italic" : "normal" }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center", marginTop: 24, paddingBottom: 28 }}>
              <button onClick={() => { reset(); setImage(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ background: "transparent", border: "1px solid #E2E8F0", borderRadius: 8, color: "#94A3B8", fontSize: 13, padding: "8px 20px", cursor: "pointer" }}>
                ↑ Extend another lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
