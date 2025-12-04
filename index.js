const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// 1. Database Connection (Replace with your actual MongoDB URL)
// Example: "mongodb+srv://user:pass@cluster.mongodb.net/financeApp"
// mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/financeApp")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error(err));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected Successfully"))
  .catch((err) => {
      console.error("--- ERRO DE CONEXÃO COM ATLAS ---");
      console.error("Verifique sua string MONGO_URI no arquivo .env");
      console.error(err);
  });

// 2. Data Model (Schema)
const TransactionSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true }, // 'income' or 'expense'
  date: { type: Date, default: Date.now },
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173', 
    'http://localhost:3000',
    'http://localhost:5174'
]; 

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origem (como apps mobile ou curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

// 3. API Routes

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const data = await TransactionModel.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add new transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const newTransaction = new TransactionModel(req.body);
    const saved = await newTransaction.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await TransactionModel.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 3001; // Adicione process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// app.listen(3001, () => {
//   console.log("Server running on port 3001");
// });