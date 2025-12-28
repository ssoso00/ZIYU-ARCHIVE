import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hubBg: "#eaf5ff",
        hubBg2: "#dfefff",
        hubCard: "#ffffff",
        hubText: "#1f2c3d",
        hubSub: "#7a8aa2",
        hubAccent: "#2f9bff",
        hubAccent2: "#7bc3ff"
      },
      boxShadow: {
        hub: "0 18px 60px rgba(15, 76, 129, 0.20)",
        hubStrong: "0 22px 70px rgba(15, 76, 129, 0.26)"
      },
      borderRadius: {
        hub: "32px",
        hubXL: "44px"
      }
    }
  },
  plugins: []
};

export default config;
