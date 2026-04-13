export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    // ✅ 强制保证参数完整
    const body = {
      model: req.body.model || "gpt-4o-mini",
      messages: req.body.messages || [
        { role: "user", content: "请分析颜色" }
      ]
    };

    const response = await fetch("https://api.openai-proxy.org/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json(data);
    }

    res.status(200).json(data);

  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "AI调用失败" });
  }
}