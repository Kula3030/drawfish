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

// 评分系统相关变量
const fishScores = new Map(); // 存储每条鱼的分数

// 存储所有鱼的动画数据
const allFishes = [];

// 存储所有气泡
const allBubbles = [];

// 存储投喂的鱼粮
const feedingPoints = [];

// 从 Firebase 加载所有鱼的数据
function loadFishes(callback) {
    fishesRef.once('value', (snapshot) => {
        const fishesData = snapshot.val();
        const fishes = fishesData ? Object.values(fishesData) : [];
        if (callback) callback(fishes);
    });
}

// 更新鱼的数量显示
// 更新鱼数量显示
function updateFishCount() {
    // 直接从 DOM 计算当前鱼的数量
    const fishContainers = document.querySelectorAll('.fish-container');
    fishCountElement.textContent = `水族馆里有 ${fishContainers.length} 条鱼`;
    console.log('更新鱼数量:', fishContainers.length); // 调试日志
}

// 创建气泡效果
function createBubbles() {
    // 不再使用定时器，改为在渲染循环中生成气泡
}

// 升级版海草生成函数
function createSeaweed() {
    // 生成多样化的海草
    const seaweedCount = 12;
    for (let i = 0; i < seaweedCount; i++) {
        const container = document.createElement('div');
        container.className = 'seaweed-container';
        
        // 随机类型
        const type = Math.floor(Math.random() * 3) + 1;
        container.classList.add(`type-${type}`);
        
        // 主茎
        const stem = document.createElement('div');
        stem.className = 'seaweed-stem';
        const stemHeight = 60 + Math.random() * 80;
        stem.style.height = `${stemHeight}px`;
        stem.style.animationDelay = `${Math.random() * 4}s`;
        stem.style.animationDuration = `${3 + Math.random() * 2}s`;
        container.appendChild(stem);
        
        // 生成叶片（3-7片）
        const leafCount = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < leafCount; j++) {
            const leaf = document.createElement('div');
            leaf.className = 'seaweed-leaf';
            
            // 交替左右
            if (j % 2 === 0) {
                leaf.classList.add('left');
            } else {
                leaf.classList.add('right');
            }
            
            // 叶片大小
            const leafWidth = 12 + Math.random() * 8;
            const leafHeight = 20 + Math.random() * 15;
            leaf.style.width = `${leafWidth}px`;
            leaf.style.height = `${leafHeight}px`;
            
            // 叶片位置（沿着茎分布）
            const leafPosition = (j + 1) / (leafCount + 1);
            leaf.style.bottom = `${stemHeight * leafPosition}px`;
            
            // 独立动画
            leaf.style.animationDelay = `${Math.random() * 3}s`;
            leaf.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
            
            // 透明度变化（越往上越透明）
            leaf.style.opacity = 0.9 - (leafPosition * 0.3);
            
            container.appendChild(leaf);
        }
        
        // 位置
        container.style.left = `${5 + Math.random() * 90}%`;
        container.style.opacity = 0.4 + Math.random() * 0.4;
        
        aquarium.appendChild(container);
    }
    
    // 生成海藻（3-5株）
    const kelpCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < kelpCount; i++) {
        const kelpContainer = document.createElement('div');
        kelpContainer.className = 'kelp-container';
        
        const kelp = document.createElement('div');
        kelp.className = 'kelp-strand';
        kelp.style.height = `${80 + Math.random() * 120}px`;
        kelp.style.animationDelay = `${Math.random() * 5}s`;
        kelp.style.animationDuration = `${4 + Math.random() * 2}s`;
        
        kelpContainer.appendChild(kelp);
        kelpContainer.style.left = `${10 + Math.random() * 80}%`;
        kelpContainer.style.opacity = 0.5 + Math.random() * 0.3;
        
        aquarium.appendChild(kelpContainer);
    }
    
    // 生成水草丛（8-12丛）
    const grassClumpCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < grassClumpCount; i++) {
        const clump = document.createElement('div');
        clump.className = 'grass-clump';
        
        // 每丛3-6根草
        const bladeCount = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < bladeCount; j++) {
            const blade = document.createElement('div');
            blade.className = 'grass-blade';
            blade.style.height = `${15 + Math.random() * 25}px`;
            blade.style.animationDelay = `${Math.random() * 2}s`;
            blade.style.animationDuration = `${1.5 + Math.random() * 1}s`;
            clump.appendChild(blade);
        }
        
        clump.style.left = `${Math.random() * 100}%`;
        clump.style.opacity = 0.6 + Math.random() * 0.3;
        
        aquarium.appendChild(clump);
    }
}

// 显示所有鱼并让它们游动
function displayFishes() {
    fishesRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const fishData = childSnapshot.val();
            fishData.id = childSnapshot.key; // 添加Firebase的key作为id
            createFishElement(fishData, 0);
        });
        // 加载完成后更新鱼数量
        updateFishCount();
    });
}

// 创建鱼的DOM元素
function createFishElement(fishData, index) {
    const fishContainer = document.createElement('div');
    fishContainer.className = 'fish-container';
    fishContainer.style.position = 'absolute';
    fishContainer.style.left = '0px';
    fishContainer.style.top = '0px';
    
    // 使用鱼的名字作为ID（如果没有名字，使用Firebase key）
    const fishId = fishData.name || fishData.id || `fish_${Date.now()}_${index}`;
    fishContainer.dataset.fishId = fishId;
    fishContainer.dataset.fishName = fishData.name || '无名鱼'; // 存储鱼名
    
    const fishImg = document.createElement('img');
    fishImg.src = fishData.image;
    fishImg.className = 'fish';
    // 缩小鱼的50%（原始宽度 * 0.5）
    fishImg.style.width = (fishData.width * 0.5) + 'px';
    fishImg.style.height = 'auto';
    
    // 添加摆尾动画
    const swimDuration = (Math.random() * 1 + 0.8).toFixed(2); // 0.8-1.8秒
    fishImg.style.animation = `swim-wave ${swimDuration}s ease-in-out infinite`;
    
    // 随机初始位置（更好的分布）
    const startY = 20 + Math.random() * (window.innerHeight - 140); // 避开顶部和底部边缘
    const startX = Math.random() * window.innerWidth;
    fishContainer.style.top = startY + 'px';
    fishContainer.style.left = startX + 'px';
    
    // 添加评分UI
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'rating-container';
    
    const positiveBtn = document.createElement('button');
    positiveBtn.className = 'rating-btn positive-btn';
    positiveBtn.innerHTML = '🐟';
    positiveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        feedFish(fishContainer, fishData);
    });
    
    const negativeBtn = document.createElement('button');
    negativeBtn.className = 'rating-btn negative-btn';
    negativeBtn.innerHTML = '💩';
    negativeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        poopFish(fishContainer, fishData);
    });
    
    ratingContainer.appendChild(positiveBtn);
    ratingContainer.appendChild(negativeBtn);
    
    // 添加分数显示
    const scoreElement = document.createElement('div');
    scoreElement.className = 'fish-score';
    scoreElement.textContent = '0';
    
    fishContainer.appendChild(ratingContainer);
    fishContainer.appendChild(scoreElement);
    fishContainer.appendChild(fishImg);
    aquarium.appendChild(fishContainer);
    
    // 初始化分数（从 Firebase 加载或设为 0）
    fishScores.set(fishContainer, { score: 0, data: fishData, fishId: fishId });
    
    // 尝试从 Firebase 加载分数
    scoresRef.child(fishId).once('value', (snapshot) => {
        const scoreData = snapshot.val();
        if (scoreData && scoreData.score) {
            const fishInfo = fishScores.get(fishContainer);
            if (fishInfo) {
                fishInfo.score = scoreData.score;
                const scoreElement = fishContainer.querySelector('.fish-score');
                if (scoreElement) {
                    scoreElement.textContent = scoreData.score;
                }
            }
        }
    });
    
    // 添加到鱼列表中，准备统一渲染
    const fishAnimData = initializeFishAnimation(fishContainer, fishImg, index);
    allFishes.push(fishAnimData);
    
    // 为每条鱼创建气泡生成器
    fishAnimData.bubbleGenerator = {
        bubbleRate: Math.floor(Math.random() * 60), // 随机起始帧数
        generateInterval: 60 + Math.floor(Math.random() * 40) // 60-100帧生成一次
    };
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
            fishData.id = fishKey; // 添加Firebase的key作为id
            createFishElement(fishData, 0);
            
            // 更新鱼数量
            updateFishCount();
        });
    });
}

// 初始化鱼的动画数据
function initializeFishAnimation(fishContainer, fishElement, index) {
    // 随机初始位置（更分散的分布）
    const x = parseFloat(fishContainer.style.left);
    const y = parseFloat(fishContainer.style.top);
    
    // 每条鱼有不同的速度（降低速度范围）
    const speedX = (Math.random() * 0.8 + 0.3) * (Math.random() > 0.5 ? 1 : -1);
    const speedY = (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
    
    // 鱼的方向
    const direction = speedX > 0 ? 1 : -1;
    
    // 游动角度（用于摆动动画）
    const angleSwim = Math.random() * Math.PI * 2; // 随机起始角度
    const swimSpeed = 0.1 + Math.random() * 0.05; // 每条鱼摆动速度不同
    
    // 随机游动模式
    const swimPattern = Math.floor(Math.random() * 3); // 0: 直线, 1: 波浪, 2: 圆周
    
    // 返回鱼的动画数据对象
    return {
        container: fishContainer,
        element: fishElement,
        x: x,
        y: y,
        speedX: speedX,
        speedY: speedY,
        direction: direction,
        angleSwim: angleSwim,
        swimSpeed: swimSpeed,
        swimPattern: swimPattern,
        waveOffset: Math.random() * Math.PI * 2 // 波浪运动的偏移量
    };
}

// 更新单条鱼的动画（每帧调用）
function updateFish(fishData) {
    // 检查鱼是否还存在于DOM中
    if (!document.body.contains(fishData.container)) {
        return false; // 返回 false 表示需要从列表中移除
    }
    
    // 根据游动模式更新位置
    let deltaX = fishData.speedX;
    let deltaY = fishData.speedY;
    
    if (fishData.swimPattern === 1) {
        // 波浪游动
        fishData.waveOffset += 0.05;
        deltaY += Math.sin(fishData.waveOffset) * 0.3;
    } else if (fishData.swimPattern === 2) {
        // 圆周游动
        fishData.waveOffset += 0.03;
        deltaX += Math.cos(fishData.waveOffset) * 0.2;
        deltaY += Math.sin(fishData.waveOffset) * 0.2;
    }
    
    // 更新位置（匀速）
    fishData.x += deltaX;
    fishData.y += deltaY;
    
    // 边界检测和反弹
    const margin = 50;
    
    if (fishData.x > window.innerWidth + margin) {
        fishData.x = -fishData.element.offsetWidth - margin;
    } else if (fishData.x < -fishData.element.offsetWidth - margin) {
        fishData.x = window.innerWidth + margin;
    }
    
    if (fishData.y > window.innerHeight - fishData.element.offsetHeight - 20) {
        fishData.y = window.innerHeight - fishData.element.offsetHeight - 20;
        fishData.speedY = -Math.abs(fishData.speedY); // 反弹向上
    } else if (fishData.y < 20) {
        fishData.y = 20;
        fishData.speedY = Math.abs(fishData.speedY); // 反弹向下
    }
    
    // 根据方向翻转鱼
    const newDirection = Math.sign(fishData.speedX);
    if (fishData.direction !== newDirection) {
        fishData.direction = newDirection;
    }
    
    // 应用位置
    fishData.container.style.left = fishData.x + 'px';
    fishData.container.style.top = fishData.y + 'px';
    
    // 增加游动角度（用于摆尾）
    fishData.angleSwim += fishData.swimSpeed;
    
    // 摆尾动画
    const bodyRotation = Math.sin(fishData.angleSwim * 0.5) * 3;
    const bodyWave = Math.sin(fishData.angleSwim) * 2;
    
    // 组合变换：翻转 + 摆尾
    const currentTransform = `
        scaleX(${fishData.direction}) 
        rotate(${bodyRotation}deg) 
        translateY(${bodyWave}px)
    `;
    fishData.element.style.transform = currentTransform;
    
    return true;
}

// === 单个气泡类 ===
function createBubble(x, y) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // 初始位置和大小
    const initialSize = Math.random() * 8 + 6; // 6-14px
    bubble.style.width = initialSize + 'px';
    bubble.style.height = initialSize + 'px';
    bubble.style.left = x + 'px';
    bubble.style.bottom = y + 'px';
    bubble.style.position = 'absolute';
    
    aquarium.appendChild(bubble);
    
    // 气泡数据
    return {
        element: bubble,
        x: x,
        y: y,
        speed: 0.5 + Math.random() * 0.5, // 上升速度
        wobbleSpeed: 0.05 + Math.random() * 0.05, // 摇晃速度
        wobbleDistance: 2 + Math.random() * 3, // 摇晃幅度
        angle: Math.random() * Math.PI * 2, // 初始角度
        lifespan: 0, // 生命周期
        initialSize: initialSize,
        opacity: 0.6
    };
}

// 更新单个气泡
function updateBubble(bubbleData) {
    // 检查气泡是否还在 DOM 中
    if (!document.body.contains(bubbleData.element)) {
        return true; // 需要删除
    }
    
    // 向上移动
    bubbleData.y += bubbleData.speed;
    
    // 左右摇晃（像真实气泡）
    bubbleData.x += Math.cos(bubbleData.angle) * 0.2;
    bubbleData.angle += bubbleData.wobbleSpeed;
    
    // 慢慢变大（上升时气泡会膨胀）
    bubbleData.lifespan += 1;
    const scale = 1 + bubbleData.lifespan * 0.01;
    const newSize = bubbleData.initialSize * scale;
    
    // 慢慢变透明
    bubbleData.opacity = 0.6 - (bubbleData.lifespan * 0.005);
    
    // 应用样式
    bubbleData.element.style.left = bubbleData.x + 'px';
    bubbleData.element.style.bottom = bubbleData.y + 'px';
    bubbleData.element.style.width = newSize + 'px';
    bubbleData.element.style.height = newSize + 'px';
    bubbleData.element.style.opacity = bubbleData.opacity;
    
    // 到达水面或完全透明就消失
    if (bubbleData.y > window.innerHeight || bubbleData.opacity <= 0) {
        bubbleData.element.remove();
        return true; // 标记为需要删除
    }
    
    return false;
}

// 为鱼生成气泡
function generateFishBubble(fishData) {
    // 控制生成频率
    fishData.bubbleGenerator.bubbleRate++;
    
    if (fishData.bubbleGenerator.bubbleRate >= fishData.bubbleGenerator.generateInterval) {
        fishData.bubbleGenerator.bubbleRate = 0;
        
        // 从鱼嘴位置生成气泡（鱼的前方）
        const fishRect = fishData.element.getBoundingClientRect();
        const bubbleX = fishData.direction > 0 
            ? fishRect.right - 10 // 向右游，气泡在右侧
            : fishRect.left + 10; // 向左游，气泡在左侧
        const bubbleY = window.innerHeight - fishRect.top - fishRect.height / 2;
        
        const bubble = createBubble(bubbleX, bubbleY);
        allBubbles.push(bubble);
    }
}

// 创建鱼粮
function createFoodPellet(x, y) {
    const food = document.createElement('div');
    food.className = 'food-pellet';
    food.style.left = x + 'px';
    food.style.top = y + 'px';
    food.innerHTML = '🐟';
    
    aquarium.appendChild(food);
    
    // 鱼粮数据
    const foodData = {
        element: food,
        x: x,
        y: y,
        lifetime: 0,
        maxLifetime: 180, // 3秒后消失（60帧/秒）
        eaten: false
    };
    
    feedingPoints.push(foodData);
    
    // 吸引附近的鱼
    const attractionRadius = 300; // 吸引范围
    allFishes.forEach(fish => {
        const dx = x - fish.x;
        const dy = y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < attractionRadius) {
            fish.targetX = x;
            fish.targetY = y;
            fish.isFeeding = true;
        }
    });
    
    return foodData;
}

// 更新鱼粮
function updateFoodPellets() {
    for (let i = feedingPoints.length - 1; i >= 0; i--) {
        const food = feedingPoints[i];
        food.lifetime++;
        
        // 检查是否被吃掉
        for (let j = 0; j < allFishes.length; j++) {
            const fish = allFishes[j];
            const dx = food.x - fish.x;
            const dy = food.y - fish.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                // 鱼吃掉了鱼粮
                food.eaten = true;
                break;
            }
        }
        
        // 淡出效果
        if (food.lifetime > food.maxLifetime - 30) {
            const fadeProgress = (food.lifetime - (food.maxLifetime - 30)) / 30;
            food.element.style.opacity = 1 - fadeProgress;
        }
        
        // 移除鱼粮
        if (food.lifetime >= food.maxLifetime || food.eaten) {
            food.element.remove();
            feedingPoints.splice(i, 1);
        }
    }
}

// 处理点击事件
function handleAquariumClick(event) {
    // 检查是否点击在鱼或按钮上
    if (event.target.closest('.fish-container') || 
        event.target.closest('#controls') || 
        event.target.closest('.rating-btn')) {
        return; // 点击在鱼或控制面板上，不生成鱼粮
    }
    
    const rect = aquarium.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    createFoodPellet(x, y);
}

// 统一的渲染循环（类似 Three.js）
function renderLoop() {
    // 更新所有鱼的动画
    for (let i = allFishes.length - 1; i >= 0; i--) {
        const shouldKeep = updateFish(allFishes[i]);
        // 如果鱼已被移除，从列表中删除
        if (!shouldKeep) {
            allFishes.splice(i, 1);
        } else {
            // 为鱼生成气泡
            generateFishBubble(allFishes[i]);
        }
    }
    
    // 更新所有气泡
    for (let i = allBubbles.length - 1; i >= 0; i--) {
        const shouldRemove = updateBubble(allBubbles[i]);
        if (shouldRemove) {
            allBubbles.splice(i, 1);
        }
    }
    
    // 更新鱼的深度属性（用于动态阴影）
    if (Math.random() < 0.1) { // 10%概率更新，减少性能消耗
        updateFishDepth();
    }
    
    // 继续下一帧
    requestAnimationFrame(renderLoop);
}

// 喂鱼粮动画和加分
function feedFish(fishContainer, fishData) {
    // 创建鱼粮粒子
    const food = document.createElement('div');
    food.className = 'food-particle';
    food.innerHTML = '🐟';
    
    // 获取鱼的位置
    const fishRect = fishContainer.getBoundingClientRect();
    const fishX = fishRect.left + fishRect.width / 2;
    const fishY = fishRect.top + fishRect.height / 2;
    
    food.style.left = fishX + 'px';
    food.style.top = fishY + 'px';
    aquarium.appendChild(food);
    
    // 添加动画
    food.style.animation = 'feed-animation 1s forwards';
    
    // 动画结束后移除元素
    setTimeout(() => {
        food.remove();
    }, 1000);
    
    // 更新分数 +1
    const fishInfo = fishScores.get(fishContainer);
    if (fishInfo) {
        fishInfo.score += 1;
        fishScores.set(fishContainer, fishInfo);
        updateFishScore(fishContainer, fishInfo.score);
    }
}

// 扔大便动画和扣分
function poopFish(fishContainer, fishData) {
    // 创建大便粒子
    const poop = document.createElement('div');
    poop.className = 'poop-particle';
    poop.innerHTML = '💩';
    
    // 获取鱼的位置
    const fishRect = fishContainer.getBoundingClientRect();
    const fishX = fishRect.left + fishRect.width / 2;
    const fishY = fishRect.top + fishRect.height / 2;
    
    poop.style.left = fishX + 'px';
    poop.style.top = fishY + 'px';
    aquarium.appendChild(poop);
    
    // 计算随机目标位置（鱼周围）
    const targetX = fishX + (Math.random() * 100 - 50);
    const targetY = fishY + (Math.random() * 100 - 50);
    const tx = targetX - fishX;
    const ty = targetY - fishY;
    
    // 设置CSS变量用于动画
    poop.style.setProperty('--tx', tx + 'px');
    poop.style.setProperty('--ty', ty + 'px');
    
    // 添加动画
    poop.style.animation = 'poop-animation 1s forwards';
    
    // 动画结束后移除元素
    setTimeout(() => {
        poop.remove();
    }, 1000);
    
    // 更新分数 -1
    const fishInfo = fishScores.get(fishContainer);
    if (fishInfo) {
        fishInfo.score -= 1;
        fishScores.set(fishContainer, fishInfo);
        updateFishScore(fishContainer, fishInfo.score);
    }
}

// 更新鱼的分数显示（删除旧版本，使用排行榜系统中的新版本）

// 移除鱼（完全删除）
function removeFish(fishContainer) {
    const fishId = fishContainer.dataset.fishId;
    
    console.log('移除鱼:', fishId); // 调试日志
    
    // 添加消失动画
    fishContainer.style.animation = 'fish-disappear 1s forwards';
    
    // 动画结束后完全移除
    setTimeout(() => {
        // 从DOM中移除
        fishContainer.remove();
        
        // 从fishScores中移除
        fishScores.delete(fishContainer);
        
        // 从allFishes数组中移除
        const fishIndex = allFishes.findIndex(f => f.container === fishContainer);
        if (fishIndex !== -1) {
            allFishes.splice(fishIndex, 1);
        }
        
        // 从Firebase删除鱼的数据
        if (fishId) {
            // 删除分数记录
            scoresRef.child(fishId).remove();
            // 删除鱼本身的数据
            fishesRef.child(fishId).remove();
        }
        
        // 更新鱼数量
        updateFishCount();
        
        // 更新排行榜
        updateLeaderboard();
        
        console.log('鱼已完全移除，剩余:', allFishes.length); // 调试日志
    }, 1000);
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
    
    // 创建动态光线效果
    createLightingEffects();
    
    // 初始化排行榜
    initLeaderboard();
    
    // 启动统一的渲染循环
    renderLoop();
}

// 创建动态光线效果
function createLightingEffects() {
    // 创建焦散层（水面光线）
    const causticsLayer = document.createElement('div');
    causticsLayer.className = 'caustics-layer';
    aquarium.appendChild(causticsLayer);
    
    // 为鱼添加深度属性（用于动态阴影）
    updateFishDepth();
}

// 更新鱼的深度属性（根据Y位置）
function updateFishDepth() {
    allFishes.forEach(fish => {
        const yPercent = fish.y / window.innerHeight;
        
        if (yPercent < 0.33) {
            fish.container.setAttribute('data-depth', 'shallow');
        } else if (yPercent > 0.66) {
            fish.container.setAttribute('data-depth', 'deep');
        } else {
            fish.container.removeAttribute('data-depth');
        }
    });
}

// 页面加载时初始化
window.addEventListener('load', init);

// ========== 排行榜系统 ==========

const scoresRef = database.ref('scores');
let currentLeaderboardPeriod = 'all';

// 保存分数到 Firebase
function saveFishScore(fishId, fishData, score) {
    const timestamp = Date.now();
    const scoreData = {
        fishId: fishId,
        fishName: fishData.name || null, // 添加鱼名
        fishImage: fishData.image,
        fishWidth: fishData.width,
        score: score,
        timestamp: timestamp,
        date: new Date(timestamp).toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    console.log('保存分数到Firebase:', fishId, score, scoreData); // 调试日志
    
    scoresRef.child(fishId).set(scoreData).then(() => {
        console.log('分数保存成功:', fishId, score);
    }).catch((error) => {
        console.error('分数保存失败:', error);
    });
}

// 更新鱼的分数显示（修改版）
function updateFishScore(fishContainer, score) {
    const scoreElement = fishContainer.querySelector('.fish-score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
    
    console.log('更新鱼的分数:', score); // 调试日志
    
    // 检查是否需要移除鱼
    if (score <= -10) {
        removeFish(fishContainer);
        return;
    }
    
    // 保存分数到 Firebase
    const fishInfo = fishScores.get(fishContainer);
    console.log('鱼的信息:', fishInfo); // 调试日志
    
    if (fishInfo) {
        const fishId = fishContainer.dataset.fishId;
        console.log('鱼的ID:', fishId); // 调试日志
        
        if (fishId) {
            saveFishScore(fishId, fishInfo.data, score);
        }
    }
    
    // 不在这里调用updateLeaderboard，让Firebase监听器自动更新
}

// 获取指定时间范围的分数
function getScoresForPeriod(period, callback) {
    scoresRef.once('value', (snapshot) => {
        const scoresData = snapshot.val();
        console.log('从Firebase获取的分数数据:', scoresData); // 调试日志
        
        if (!scoresData) {
            callback([]);
            return;
        }
        
        const now = Date.now();
        const today = new Date(now).toISOString().split('T')[0];
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        
        // 使用Map去重，按fishId（鱼名）去重
        const scoresMap = new Map();
        
        Object.entries(scoresData).forEach(([id, data]) => {
            // Firebase的key就是fishId（鱼名）
            const uniqueKey = id;
            
            console.log('处理分数记录:', id, 'fishName:', data.fishName, '分数:', data.score);
            
            // 直接使用fishId作为唯一key，每个名字只对应一条鱼
            if (!scoresMap.has(uniqueKey)) {
                scoresMap.set(uniqueKey, {
                    id: id,
                    ...data,
                    fishId: data.fishId || id
                });
            }
        });
        
        let scores = Array.from(scoresMap.values());
        
        console.log('处理后的分数数组:', scores);
        console.log('分数数量:', scores.length, '原始数量:', Object.keys(scoresData).length);
        
        // 根据周期过滤
        if (period === 'today') {
            scores = scores.filter(s => s.date === today);
        } else if (period === 'week') {
            scores = scores.filter(s => s.timestamp >= oneWeekAgo);
        }
        // period === 'all' 不需要过滤
        
        // 按分数降序排序
        scores.sort((a, b) => b.score - a.score);
        
        console.log('排序后的分数（前10）:', scores.slice(0, 10));
        
        // 只取前 10 名
        callback(scores.slice(0, 10));
    });
}

// 更新排行榜显示
function updateLeaderboard() {
    getScoresForPeriod(currentLeaderboardPeriod, (scores) => {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-empty">暂无排名数据</div>';
            return;
        }
        
        leaderboardList.innerHTML = scores.map((scoreData, index) => {
            const rank = index + 1;
            let rankClass = 'rank-other';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';
            
            const scoreClass = scoreData.score > 0 ? 'positive' : scoreData.score < 0 ? 'negative' : '';
            
            // 计算🐟和💩的数量
            const fishCount = scoreData.score > 0 ? scoreData.score : 0;
            const poopCount = scoreData.score < 0 ? Math.abs(scoreData.score) : 0;
            
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${rank}</div>
                    <img src="${scoreData.fishImage}" class="leaderboard-fish" alt="fish">
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${scoreData.fishName || '鱼 #' + scoreData.fishId.substring(0, 6)}</div>
                        <div class="leaderboard-stats">
                            <span>🐟 ${fishCount}</span>
                            <span>💩 ${poopCount}</span>
                        </div>
                    </div>
                    <div class="leaderboard-score ${scoreClass}">${scoreData.score}</div>
                </div>
            `;
        }).join('');
    });
}

// 初始化排行榜标签页切换
function initLeaderboardTabs() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 类
            tabs.forEach(t => t.classList.remove('active'));
            // 添加当前 active
            tab.classList.add('active');
            // 更新周期
            currentLeaderboardPeriod = tab.dataset.period;
            // 刷新排行榜
            updateLeaderboard();
        });
    });
}

// 在 init 函数中调用
function initLeaderboard() {
    initLeaderboardTabs();
    updateLeaderboard();
    
    // 监听 Firebase 分数变化，实时更新排行榜
    scoresRef.on('value', () => {
        updateLeaderboard();
    });
}