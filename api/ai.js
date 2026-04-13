export default async function handler(req, res) {
  try {
    // 允许跨域（从 github.io 调用）
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json(data);
    }

    res.status(200).json(data);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI失败" });
  }
}