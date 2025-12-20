/**
 * FridlinAirBOT — Command Tree
 *
 * public   — commands visible to users in Telegram (/)
 * planned  — future features (not registered in Telegram)
 * internal — internal & debug commands
 */

module.exports = {
  commands: {
    // =========================
    // PUBLIC — current UX
    // =========================
    public: [
      {
        command: "start",
        description: "Start the bot",
      },
      {
        command: "feedback",
        description: "Send feedback or suggestion",
      },
    ],

    // =========================
    // PLANNED — future features
    // =========================
    planned: [
      {
        command: "route",
        description: "Route micro-forecast (ETA + points)",
      },
      {
        command: "destination",
        description: "Weather at destination point",
      },
      {
        command: "compare",
        description: "Compare weather between two locations",
      },
      {
        command: "eta",
        description: "Weather at estimated arrival time",
      },
      {
        command: "alerts",
        description: "Weather change notifications",
      },
      {
        command: "history",
        description: "Recent locations history",
      },
    ],

    // =========================
    // INTERNAL — debug & dev
    // =========================
    internal: [
      {
        command: "debug",
        description: "Main debug mode",
      },
      {
        command: "debug_micro",
        description: "Micro-forecast debug",
      },
      {
        command: "debug_micro_full",
        description: "Full micro-grid debug",
      },
      {
        command: "debug_micro_grid",
        description: "Show micro-grid points",
      },
      {
        command: "debug_time",
        description: "Check forecast timing",
      },
    ],
  },
};
