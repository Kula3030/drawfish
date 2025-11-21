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

// 水族馆主逻辑
const aquarium = document.getElementById('aquarium');
const drawButton = document.getElementById('drawButton');
const fishCountElement = document.getElementById('fishCount');

// 从 Firebase 加载所有鱼的数据
function loadFishes(callback) {
    fishesRef.once('value', (snapshot) => {
        const fishesData = snapshot.val();
        const fishes = fishesData ? Object.values(fishesData) : [];
        if (callback) callback(fishes);
    });
}

// 更新鱼的数量显示
function updateFishCount() {
    loadFishes((fishes) => {
        fishCountElement.textContent = `水族馆里有 ${fishes.length} 条鱼`;
    });
}

// 创建气泡效果
function createBubbles() {
    setInterval(() => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = Math.random() * window.innerWidth + 'px';
        bubble.style.bottom = '-20px';
        bubble.style.width = (Math.random() * 15 + 10) + 'px';
        bubble.style.height = bubble.style.width;
        bubble.style.animationDuration = (Math.random() * 3 + 3) + 's';
        bubble.style.animationDelay = (Math.random() * 2) + 's';
        
        aquarium.appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, 8000);
    }, 800);
}

// 创建海草装饰
function createSeaweed() {
    const seaweedCount = 10;
    for (let i = 0; i < seaweedCount; i++) {
        const seaweed = document.createElement('div');
        seaweed.className = 'seaweed';
        seaweed.style.left = (i * (100 / seaweedCount)) + '%';
        seaweed.style.height = (Math.random() * 100 + 80) + 'px';
        seaweed.style.animationDelay = (Math.random() * 2) + 's';
        seaweed.style.animationDuration = (Math.random() * 2 + 2) + 's';
        aquarium.appendChild(seaweed);
    }
}

// 显示所有鱼并让它们游动
function displayFishes() {
    loadFishes((fishes) => {
        fishes.forEach((fishData, index) => {
            const fishImg = document.createElement('img');
            fishImg.src = fishData.image;
            fishImg.className = 'fish';
            fishImg.style.width = fishData.width + 'px';
            fishImg.style.height = 'auto';
            
            // 添加摆尾动画
            const swimDuration = (Math.random() * 1 + 0.8).toFixed(2); // 0.8-1.8秒
            fishImg.style.animation = `swim-wave ${swimDuration}s ease-in-out infinite`;
            
            // 随机初始位置
            const startY = Math.random() * (window.innerHeight - 100);
            const startX = Math.random() * window.innerWidth;
            fishImg.style.top = startY + 'px';
            fishImg.style.left = startX + 'px';
            
            aquarium.appendChild(fishImg);
            
            // 让鱼游动
            animateFish(fishImg, index);
        });
    });
}

// 实时监听新鱼添加
function listenForNewFishes() {
    let loadedFishKeys = new Set();
    
    // 先记录所有已存在的鱼
    fishesRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            loadedFishKeys.add(childSnapshot.key);
        });
        
        // 只监听新添加的鱼
        fishesRef.on('child_added', (snapshot) => {
            const fishKey = snapshot.key;
            
            // 如果是已经加载过的鱼，跳过
            if (loadedFishKeys.has(fishKey)) return;
            
            // 标记为已加载
            loadedFishKeys.add(fishKey);
            
            const fishData = snapshot.val();
            const fishImg = document.createElement('img');
            fishImg.src = fishData.image;
            fishImg.className = 'fish';
            fishImg.style.width = fishData.width + 'px';
            fishImg.style.height = 'auto';
            
            // 添加摆尾动画
            const swimDuration = (Math.random() * 1 + 0.8).toFixed(2);
            fishImg.style.animation = `swim-wave ${swimDuration}s ease-in-out infinite`;
            
            // 随机初始位置
            const startY = Math.random() * (window.innerHeight - 100);
            const startX = Math.random() * window.innerWidth;
            fishImg.style.top = startY + 'px';
            fishImg.style.left = startX + 'px';
            
            aquarium.appendChild(fishImg);
            animateFish(fishImg, 0);
            
            // 更新鱼数量
            updateFishCount();
        });
    });
}

// 鱼的游动动画
function animateFish(fishElement, index) {
    let x = parseFloat(fishElement.style.left);
    let y = parseFloat(fishElement.style.top);
    
    // 每条鱼有不同的速度
    const speedX = (Math.random() * 1 + 0.5) * (Math.random() > 0.5 ? 1 : -1);
    const speedY = (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
    
    // 鱼的方向
    let direction = speedX > 0 ? 1 : -1;
    
    function swim() {
        x += speedX;
        y += speedY * 0.5; // Y轴移动更慢
        
        // 边界检测和反弹
        if (x > window.innerWidth) {
            x = -fishElement.offsetWidth;
        } else if (x < -fishElement.offsetWidth) {
            x = window.innerWidth;
        }
        
        if (y > window.innerHeight - fishElement.offsetHeight) {
            y = window.innerHeight - fishElement.offsetHeight;
        } else if (y < 0) {
            y = 0;
        }
        
        // 根据方向翻转鱼
        const newDirection = Math.sign(speedX);
        if (direction !== newDirection) {
            direction = newDirection;
        }
        
        fishElement.style.left = x + 'px';
        fishElement.style.top = y + 'px';
        
        // 保留摆尾动画，只翻转方向
        const currentTransform = `scaleX(${direction})`;
        fishElement.style.transform = currentTransform;
        
        requestAnimationFrame(swim);
    }
    
    swim();
}

// 点击按钮跳转到画画页面
drawButton.addEventListener('click', () => {
    window.location.href = 'draw.html';
});

// 初始化
function init() {
    updateFishCount();
    createBubbles();
    createSeaweed();
    displayFishes();
    listenForNewFishes();
}

// 页面加载时初始化
window.addEventListener('load', init);
