export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "2rem",
        backgroundColor: "#0a0a0a",
        color: "#ededed",
      }}
    >
      <div style={{ maxWidth: "600px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          🟢 Morpheus Assistant
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#888",
            marginBottom: "2rem",
          }}
        >
          A multi-platform AI chatbot powered by the Morpheus decentralized AI
          network.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { name: "Slack", icon: "💬" },
            { name: "Discord", icon: "🎮" },
            { name: "GitHub", icon: "🐙" },
            { name: "Linear", icon: "📋" },
          ].map((platform) => (
            <div
              key={platform.name}
              style={{
                padding: "1rem",
                border: "1px solid #333",
                borderRadius: "8px",
                backgroundColor: "#111",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{platform.icon}</span>
              <p style={{ margin: "0.5rem 0 0", fontWeight: 500 }}>
                {platform.name}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a
            href="https://github.com/MorpheusAIs/morpheus-assistant"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View on GitHub
          </a>
          <a
            href="https://app.mor.org"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #555",
              borderRadius: "6px",
              textDecoration: "none",
              color: "#ededed",
              fontWeight: 600,
            }}
          >
            Get API Key
          </a>
        </div>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#666" }}>
          Powered by{" "}
          <a
            href="https://mor.org"
            style={{ color: "#4ade80", textDecoration: "none" }}
          >
            Morpheus
          </a>{" "}
          &bull; Built with{" "}
          <a
            href="https://chat-sdk.dev"
            style={{ color: "#4ade80", textDecoration: "none" }}
          >
            Chat SDK
          </a>
        </p>
      </div>
    </main>
  );
}
