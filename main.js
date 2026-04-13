import generateAISummary from "./ai.js";
// ========= 全局 =========
let pixelsData = [];
let chart = null;

// ========= 上传 =========
upload.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    preview.src = url;
    img.src = url;

    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);

        const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

        pixelsData = [];

        for (let i=0;i<data.length;i+=4){
            if(Math.random()<0.1){
                pixelsData.push([data[i],data[i+1],data[i+2]]);
            }
        }

        console.log("像素:", pixelsData.length);
    }
};

// ========= K值 =========
kRange.oninput = () => {
    kValue.innerText = kRange.value;
};

// ========= Kmeans =========
function kmeans(data, k, iter=10){
    let centers = data.slice(0,k);
    let clusters = [];

    for(let t=0;t<iter;t++){
        clusters = Array.from({length:k},()=>[]);

        data.forEach(p=>{
            let d = centers.map(c=>
                (p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2
            );
            let idx = d.indexOf(Math.min(...d));
            clusters[idx].push(p);
        });

        centers = clusters.map(c=>{
            if(!c.length) return [0,0,0];
            let sum = c.reduce((a,p)=>{
                a[0]+=p[0];a[1]+=p[1];a[2]+=p[2];
                return a;
            },[0,0,0]);
            return sum.map(v=>v/c.length);
        });
    }

    return {centers,clusters};
}

// ========= 渲染颜色 =========
function renderColors(centers){
    colorBlocks.innerHTML = "";
    centers.forEach(c=>{
        const div = document.createElement("div");
        div.className = "w-10 h-10 rounded";
        div.style.background = `rgb(${c[0]},${c[1]},${c[2]})`;
        colorBlocks.appendChild(div);
    });
}

// ========= 渲染图表 =========
function renderChart(centers,clusters){

    if(!chart){
        chart = echarts.init(document.getElementById("chart"));
    }

    const type = chartType.value;

    if(type==="bar"){
        chart.setOption({
            xAxis:{type:"category",data:centers.map((_,i)=>"C"+i)},
            yAxis:{type:"value"},
            series:[{
                type:"bar",
                data:clusters.map(c=>c.length)
            }]
        });
    }else{
        chart.setOption({
            series:[{
                type:"pie",
                radius:"60%",
                data:centers.map((c,i)=>({
                    value:clusters[i].length,
                    name:"C"+i,
                    itemStyle:{
                        color:`rgb(${c[0]},${c[1]},${c[2]})`
                    }
                }))
            }]
        });
    }
}

function lab2rgb([L, a, b]) {

    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const f = t => {
        const t3 = t*t*t;
        return t3 > 0.008856 ? t3 : (t - 16/116)/7.787;
    };

    x = f(x) * 0.95047;
    y = f(y) * 1.00000;
    z = f(z) * 1.08883;

    let r = x*3.2406 + y*(-1.5372) + z*(-0.4986);
    let g = x*(-0.9689) + y*1.8758 + z*0.0415;
    let b2 = x*0.0557 + y*(-0.2040) + z*1.0570;

    const gamma = v =>
        v > 0.0031308 ? 1.055*Math.pow(v,1/2.4)-0.055 : 12.92*v;

    r = Math.min(255, Math.max(0, gamma(r)*255));
    g = Math.min(255, Math.max(0, gamma(g)*255));
    b2 = Math.min(255, Math.max(0, gamma(b2)*255));

    return [r, g, b2];
}
function rgb2lab([r, g, b]) {

    r /= 255; g /= 255; b /= 255;

    r = r > 0.04045 ? Math.pow((r+0.055)/1.055,2.4) : r/12.92;
    g = g > 0.04045 ? Math.pow((g+0.055)/1.055,2.4) : g/12.92;
    b = b > 0.04045 ? Math.pow((b+0.055)/1.055,2.4) : b/12.92;

    let x = r*0.4124 + g*0.3576 + b*0.1805;
    let y = r*0.2126 + g*0.7152 + b*0.0722;
    let z = r*0.0193 + g*0.1192 + b*0.9505;

    x /= 0.95047;
    y /= 1.00000;
    z /= 1.08883;

    const f = t => t > 0.008856 ? Math.pow(t,1/3) : (7.787*t + 16/116);

    const L = 116*f(y) - 16;
    const A = 500*(f(x) - f(y));
    const B = 200*(f(y) - f(z));

    return [L, A, B];
}
// ========= 主流程 =========
window.run = async function(){
    if(pixelsData.length===0){
        alert("请先上传图片");
        return;
    }

    const k = parseInt(kRange.value);
    const space = document.getElementById("colorSpace").value;

    let data = [...pixelsData];

    // ✅ 转换
    if(space === "lab"){
        data = data.map(rgb2lab);
    }

    const {centers, clusters} = kmeans(data, k);

    // ✅ 转回显示
    let displayCenters = centers;

    if(space === "lab"){
        displayCenters = centers.map(lab2rgb);
    }

    renderColors(displayCenters);
    renderChart(displayCenters, clusters);
    generateAISummary(displayCenters, clusters);
}
