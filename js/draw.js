// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyASN_WBHPE2m3EfmcYjvkmcgE1pc4EcAB0",
  authDomain: "globalaquarium-b6bcc.firebaseapp.com",
  databaseURL: "https://globalaquarium-b6bcc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "globalaquarium-b6bcc",
  storageBucket: "globalaquarium-b6bcc.firebasestorage.app",
  messagingSenderId: "512626935672",
  appId: "1:512626935672:web:b30b79813f45443b702a8d"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const fishesRef = database.ref('fishes');

// 画鱼页面逻辑
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearButton = document.getElementById('clearButton');
const saveButton = document.getElementById('saveButton');
const backButton = document.getElementById('backButton');

// 命名弹窗元素
const nameModal = document.getElementById('nameModal');
const fishNameInput = document.getElementById('fishNameInput');
const confirmNameButton = document.getElementById('confirmNameButton');
const cancelNameButton = document.getElementById('cancelNameButton');
const errorMessage = document.getElementById('errorMessage');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentFishImage = null; // 存储当前鱼的图片

// 生成随机颜色
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 设置随机初始颜色
colorPicker.value = getRandomColor();

// 初始化画布背景为白色
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 开始绘画
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

// 绘画中
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

// 停止绘画
function stopDrawing() {
    isDrawing = false;
}

// 触摸设备支持
function startDrawingTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
}

function drawTouch(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawingTouch(e) {
    e.preventDefault();
    isDrawing = false;
}

// 鼠标事件
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// 触摸事件
canvas.addEventListener('touchstart', startDrawingTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopDrawingTouch);

// 笔刷大小变化
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = e.target.value;
});

// 清空画布
clearButton.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// 自动抠图：去除白色背景
function cropAndRemoveWhiteBackground() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // 找到绘画内容的边界
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let hasContent = false;
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            
            // 检查是否是非白色像素（容差处理）
            if (r < 250 || g < 250 || b < 250) {
                hasContent = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    if (!hasContent) {
        return null;
    }
    
    // 添加一些边距
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // 创建新的画布用于抠图
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 复制裁剪区域
    const croppedImageData = ctx.getImageData(minX, minY, width, height);
    const croppedPixels = croppedImageData.data;
    
    // 去除白色背景（设置为透明）
    for (let i = 0; i < croppedPixels.length; i += 4) {
        const r = croppedPixels[i];
        const g = croppedPixels[i + 1];
        const b = croppedPixels[i + 2];
        
        // 如果接近白色，设置为透明
        if (r > 240 && g > 240 && b > 240) {
            croppedPixels[i + 3] = 0; // 设置 alpha 为 0（完全透明）
        }
    }
    
    tempCtx.putImageData(croppedImageData, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
}

// 保存鱼到 Firebase
saveButton.addEventListener('click', () => {
    // 抠图并去除白色背景
    const croppedImageDataURL = cropAndRemoveWhiteBackground();
    
    if (!croppedImageDataURL) {
        alert('请先画一条鱼再保存哦！🐟');
        return;
    }
    
    // 存储鱼的图片，显示命名弹窗
    currentFishImage = croppedImageDataURL;
    nameModal.style.display = 'flex';
    fishNameInput.value = '';
    errorMessage.textContent = '';
    fishNameInput.focus();
});

// 取消命名
cancelNameButton.addEventListener('click', () => {
    nameModal.style.display = 'none';
    currentFishImage = null;
});

// 检查名字是否已存在
function checkNameExists(name, callback) {
    fishesRef.orderByChild('name').equalTo(name).once('value', (snapshot) => {
        callback(snapshot.exists());
    });
}

// 确认命名并保存
confirmNameButton.addEventListener('click', () => {
    const fishName = fishNameInput.value.trim();
    
    // 验证名字
    if (!fishName) {
        errorMessage.textContent = '⚠️ 请输入鱼的名字！';
        return;
    }
    
    if (fishName.length < 2) {
        errorMessage.textContent = '⚠️ 名字太短啦，至少2个字哦！';
        return;
    }
    
    // 检查名字是否重复
    errorMessage.textContent = '⚙️ 检查名字是否可用...';
    confirmNameButton.disabled = true;
    
    checkNameExists(fishName, (exists) => {
        if (exists) {
            errorMessage.textContent = '⚠️ 这个名字已经被其他鱼用了，换一个吧！';
            confirmNameButton.disabled = false;
            return;
        }
        
        // 名字可用，保存鱼
        errorMessage.textContent = '💾 保存中...';
        
        const fishSize = Math.random() * 100 + 80; // 80-180px
        const newFish = {
            name: fishName,
            image: currentFishImage,
            width: fishSize,
            timestamp: Date.now()
        };
        
        // 使用名字作为Firebase的key
        fishesRef.child(fishName).set(newFish)
            .then(() => {
                alert(`🎉 你的鱼「${fishName}」已经放入全球水族馆啦！世界各地的网友都能看到！`);
                window.location.href = 'aquarium.html';
            })
            .catch((error) => {
                console.error('保存失败：', error);
                errorMessage.textContent = '⚠️ 保存失败，请检查网络后重试！';
                confirmNameButton.disabled = false;
            });
    });
});

// 按回车键确认
fishNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmNameButton.click();
    }
});

// 返回水族馆
backButton.addEventListener('click', () => {
    if (confirm('确定要返回吗？未保存的画作将丢失！')) {
        window.location.href = 'aquarium.html';
    }
});
