export default async function generateAISummary(centers, clusters){

    const total = clusters.reduce((s,c)=>s+c.length,0);

    const colorData = centers.map((c,i)=>{
        const percent = ((clusters[i].length/total)*100).toFixed(1);
        return `rgb(${c.map(v=>Math.round(v)).join(",")}) 占比 ${percent}%`;
    }).join("\n");

    const prompt = `
你是一个设计师，请分析以下图片配色：

${colorData}

请用简短中文说明：
1. 整体色调（冷/暖）
2. 是否和谐
3. 给出设计评价
`;

    try{
        document.getElementById("aiSummary").innerText = "AI分析中...";

        const res = await fetch("https://api.openai-proxy.org/v1/chat/completions",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer sk-GufXkKaO2PuuupAkPp94Co6vpuwfH4f9W48Vh7aHVRNXrA7h"
            },
            body: JSON.stringify({
                model:"gpt-4o-mini",
                messages:[{role:"user",content:prompt}]
            })
        });

        const data = await res.json();

        const text = data.choices?.[0]?.message?.content || "AI返回异常";

        document.getElementById("aiSummary").innerText = text;

    }catch(err){
        document.getElementById("aiSummary").innerText = "AI分析失败";
        console.error(err);
    }
}
