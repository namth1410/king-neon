import styles from "./admin.module.scss";

export default function AdminDashboard() {
  return (
    <div>
      <header className={styles["admin-header"]}>
        <h1 className={styles["admin-header__title"]}>Dashboard</h1>
      </header>

      <div className={styles.section}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          {[
            { label: "Total Revenue", value: "$45,231.89", change: "+20.1%" },
            { label: "Subscriptions", value: "+2350", change: "+180.1%" },
            { label: "Sales", value: "+12,234", change: "+19%" },
            { label: "Active Now", value: "+573", change: "+201" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginTop: "0.5rem",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#10b981",
                  marginTop: "0.5rem",
                }}
              >
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
