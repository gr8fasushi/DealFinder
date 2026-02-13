const { execSync } = require("child_process");

const port = process.argv[2] || 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function killPort() {
  try {
    // Find process using the port
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf-8",
    });

    const lines = output
      .split("\n")
      .filter((line) => line.includes("LISTENING"));

    if (lines.length === 0) {
      console.log(`✓ Port ${port} is already free`);
      return;
    }

    // Extract PID from the last column
    const pids = new Set();
    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });

    // Kill each process
    for (const pid of pids) {
      try {
        execSync(`taskkill //F //PID ${pid}`, { stdio: "ignore" });
        console.log(`✓ Killed process ${pid} on port ${port}`);
      } catch (err) {
        // Try without force flag as backup
        try {
          execSync(`taskkill //PID ${pid}`, { stdio: "ignore" });
          console.log(`✓ Killed process ${pid} on port ${port}`);
        } catch {
          console.log(`⚠ Could not kill process ${pid}`);
        }
      }
    }

    // Wait for port to be fully released
    await sleep(1000);
    console.log(`✓ Port ${port} is now free`);
  } catch (error) {
    // No process found or command failed
    console.log(`✓ Port ${port} is already free`);
  }
}

killPort();
