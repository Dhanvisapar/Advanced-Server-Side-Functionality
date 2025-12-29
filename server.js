const express = require("express");
const morgan = require("morgan");
const NodeCache = require("node-cache");

const app = express();
const cache = new NodeCache({ stdTTL: 30 }); // 30 seconds cache

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());     // Body parsing
app.use(morgan("dev"));      // Logging middleware

/* ---------- BACKGROUND TASK QUEUE ---------- */
let taskQueue = [];

function processTasks() {
  if (taskQueue.length > 0) {
    const task = taskQueue.shift();
    console.log("Processing background task:", task);
  }
}

setInterval(processTasks, 5000); // process every 5 sec

app.post("/task", (req, res) => {
  const task = req.body.task;
  taskQueue.push(task);
  res.json({ message: "Task added to background queue" });
});

/* ---------- CACHING ---------- */
app.get("/data", (req, res) => {
  const cachedData = cache.get("data");

  if (cachedData) {
    return res.json({ source: "cache", data: cachedData });
  }

  // Simulate slow operation
  setTimeout(() => {
    const data = {
      time: new Date().toLocaleTimeString(),
      message: "Fresh server data"
    };

    cache.set("data", data);
    res.json({ source: "server", data });
  }, 2000);
});

/* ---------- SERVER ---------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
