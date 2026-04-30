export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({
      status: "success",
      message: "Harvest initialized successfully",
      total_items: Math.floor(Math.random() * 35) + 15,
      job_id: `job_${Date.now()}`
    });
  } else {
    res.status(200).json({ status: "API is running (Node.js)" });
  }
}
