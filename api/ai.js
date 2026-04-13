export default async function handler(req, res) {

  // ✅ 必须最先设置 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ 处理预检请求（关键）
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const response = await fetch("https://api.openai-proxy.org/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // ❗ 防止返回异常结构
    if (data.error) {
      return res.status(500).json(data);
    }

    res.status(200).json(data);

  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "AI调用失败" });
  }
}