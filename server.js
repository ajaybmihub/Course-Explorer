require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── MONGOOSE SETUP ──
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ajaybmihub:ajay2004@cluster7.sid1ior.mongodb.net/";

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is missing. Set it in your environment variables or .env file.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Successfully connected to MongoDB Cluster.");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📂 Collections available: ${collections.map(c => c.name).join(", ")}`);
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    // Log helpful advice if connection fails
    if (err.message.includes("whitelist")) {
      console.log("💡 Tip: Make sure your deployment IP is in the MongoDB Atlas whitelist.");
    }
  });

const questionSchema = new mongoose.Schema({
  department: String,
  exam_type: String,
  subject: String,
  topic: String,
  subtopic: String,
  difficulty: String,
  question: String,
  option: {
    A: String,
    B: String,
    C: String,
    D: String
  },
  answer: String,
  explanation: String,
  level: String,
  eligibility: String,
  year: String,
  pdf_name: String
});

// Cache for dynamic models
const models = {};
function getQuestionModel(collectionName) {
  if (!models[collectionName]) {
    models[collectionName] = mongoose.model(collectionName, questionSchema, collectionName);
  }
  return models[collectionName];
}

// ── TOPIC MODEL ──
const topicSchema = new mongoose.Schema({
  track_name: String,
  category: String,
  exam_name: String,
  conducting_body: String,
  level: String,
  eligibility: String,
  frequency: String,
  question_count: String,
  year_range: String
}, { collection: 'topics' });

const Topic = mongoose.model('Topic', topicSchema);

// ── API ROUTES ──

// Helper to map department/category to collection name
function mapToCollection(dept) {
    if (!dept) return "topics"; // Default if missing
    const d = dept.toLowerCase();
    if (d.includes("upsc")) return "upsc";
    if (d.includes("railway")) return "railways";
    if (d.includes("bank")) return "bank_exams";
    if (d.includes("jee")) return "jee_main";
    if (d.includes("neet")) return "neet_ug";
    return "topics"; // Fallback
}

// 1. GET /exams
app.get("/exams", async (req, res) => {
  try {
    const exams = await Topic.distinct("category");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /years?exam=UPSC
app.get("/years", async (req, res) => {
  try {
    const { exam } = req.query; 
    const Model = getQuestionModel(mapToCollection(exam));
    // Remove strict department match because collections are natively isolated
    // e.g., jee_main collection only contains JEE questions.
    const years = await Model.distinct("year", { year: { $gte: "1900" } });
    res.json(years.sort((a,b) => b.localeCompare(a)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /papers?exam=UPSC&year=2024
app.get("/papers", async (req, res) => {
  try {
    const { exam, year } = req.query;
    const Model = getQuestionModel(mapToCollection(exam));
    
    const papers = await Model.aggregate([
      { $match: { year: String(year) } },
      {
        $group: {
          _id: "$exam_type", 
          pdf_name: { $first: "$pdf_name" },
          paper: { $first: "$exam_type" }
        }
      }
    ]);
    
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /questions?paper_id=...&exam=UPSC
app.get("/questions", async (req, res) => {
  try {
    const { paper_id, exam } = req.query;
    const Model = getQuestionModel(mapToCollection(exam));
    const questions = await Model.find({ exam_type: paper_id });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET /topics?track=...
app.get("/topics", async (req, res) => {
  try {
    const { track } = req.query;
    const filter = track ? { track_name: track } : {};
    const topics = await Topic.find(filter);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 6. GET /api/progress
app.get("/api/progress", async (req, res) => {
  try {
    const collections = {
        'upsc': 'Govt Exams Track',
        'railways': 'Govt Exams Track',
        'bank_exams': 'Banking Track',
        'jee_main': 'JEE / NEET Track',
        'neet_ug': 'JEE / NEET Track'
    };

    let metric = {
        totalUpdatedYears: 0,
        targetYears: 5985, // 399 exams * 15
        tracks: {
            "Govt Exams Track": { updated: 0, target: 0 },
            "Banking Track": { updated: 0, target: 0 },
            "JEE / NEET Track": { updated: 0, target: 0 },
            "Tech Track": { updated: 0, target: 0 }
        },
        exams: {}
    };

    for (const [col, trackTitle] of Object.entries(collections)) {
      const Model = getQuestionModel(col);
      const aggr = await Model.aggregate([
          { $group: { _id: { exam_type: "$exam_type", year: "$year" } } },
          { $group: { _id: "$_id.exam_type", updated_years: { $sum: 1 } } }
      ]);
      
      aggr.forEach(item => {
          metric.exams[item._id] = item.updated_years;
          metric.tracks[trackTitle].updated += item.updated_years;
          metric.totalUpdatedYears += item.updated_years;
      });
    }

    const allTopics = await Topic.find({});
    let trackCounts = { "Govt Exams Track": 0, "Banking Track": 0, "JEE / NEET Track": 0, "Tech Track": 24 };
    allTopics.forEach(t => {
      if (t.track_name && trackCounts.hasOwnProperty(t.track_name) && t.track_name !== "Tech Track") {
          trackCounts[t.track_name]++;
      }
    });

    for (const track in trackCounts) {
      if (track === "Tech Track") continue;
      metric.tracks[track].target = trackCounts[track] * 15;
    }

    res.json(metric);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
