const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 화면 요소
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startButton = document.getElementById("start-button");

// 이미지 설정
const santaImage = new Image();
santaImage.src = "santa.png";
const debrisImage = new Image();
const background = new Image();
debrisImage.src = "space_debris.png";
background.src = "space_background.png";

// 게임 설정
let player = { x: canvas.width / 2, y: canvas.height / 2, size: 70, speed: 5, dx: 0, dy: 0 };
let obstacles = [];
let lasers = [];
let score = 0;
let hp = 100;
let bgX = 0;
let bgSpeed = 2;
let gameRunning = false;
let scoreTimer = 0;
let remainingBullets = 30; // 남은 총알 갯수
let impactEffect = false; // 임팩트 효과

// 게임 시작
startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    score = 0;
    hp = 100;
    remainingBullets = 30; // 게임 시작 시 총알 리셋
    gameRunning = true;
    gameLoop();
});

// 장애물 생성
function createObstacle() {
    const size = 70; // 장애물 크기 줄이기
    const x = canvas.width;
    const y = Math.random() * (canvas.height - size);
    obstacles.push({ x, y, size });
}

// 레이저 발사
function shootLaser() {
    if (remainingBullets > 0) {
        lasers.push({ x: player.x + player.size, y: player.y + player.size / 2 - 5, width: 20, height: 5, speed: 10 });
        remainingBullets--; // 총알 하나 사용
    }
}

// 장애물 업데이트
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 4;

        // 레이저와 장애물 충돌 체크
        for (let j = lasers.length - 1; j >= 0; j--) {
            if (
                lasers[j].x < obstacles[i].x + obstacles[i].size &&
                lasers[j].x + lasers[j].width > obstacles[i].x &&
                lasers[j].y < obstacles[i].y + obstacles[i].size &&
                lasers[j].y + lasers[j].height > obstacles[i].y
            ) {
                // 레이저와 장애물 모두 제거
                obstacles.splice(i, 1);
                lasers.splice(j, 1);
                break;
            }
        }

        // 플레이어와 장애물 충돌 체크
        if (
            obstacles[i] != null &&
            player.x < obstacles[i].x + obstacles[i].size &&
            player.x + player.size > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].size &&
            player.y + player.size > obstacles[i].y
        ) {
            obstacles.splice(i, 1);
            hp -= 10;
            impactEffect = true; // 임팩트 효과 활성화
            if (hp <= 0) {
                endGame();
                return;
            }
        }

        // 화면 밖으로 나간 장애물 삭제
        if (obstacles[i] && obstacles[i].x + obstacles[i].size < 0) obstacles.splice(i, 1);
    }
}

// 레이저 업데이트
function updateLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].x += lasers[i].speed;
        if (lasers[i].x > canvas.width) lasers.splice(i, 1);
    }
}

// 배경 업데이트
function updateBackground() {
    bgX -= bgSpeed;
    if (bgX <= -canvas.width) bgX = 0;
}

// 게임 종료
function endGame() {
    gameRunning = false;
    gameOverScreen.style.display = "flex";
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    updateBackground();
    ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);

    // 장애물 생성 및 업데이트
    if (Math.random() < 0.02 + score / 5000) createObstacle(); // 스코어에 따라 장애물 개수 증가
    updateObstacles();

    // 레이저 생성 및 업데이트
    updateLasers();

    // 플레이어 이동
    player.x += player.dx;
    player.y += player.dy;
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    // 그리기
    for (let obstacle of obstacles) {
        ctx.drawImage(debrisImage, obstacle.x, obstacle.y, obstacle.size, obstacle.size); // 장애물 크기 줄이기
    }
    for (let laser of lasers) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }
    ctx.drawImage(santaImage, player.x, player.y, player.size, player.size); // 산타 크기 줄이기

    // 임팩트 효과
    if (impactEffect) {
        ctx.fillStyle = "red";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(player.x + player.size / 2, player.y + player.size / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        setTimeout(() => impactEffect = false, 200); // 임팩트 효과 지속 시간
    }

    // 스코어 업데이트
    scoreTimer++;
    if (scoreTimer % 60 === 0) {
        score++;
    }

    // UI 표시
    ctx.fillStyle = "white";
    ctx.font = "30px Arial"; // 스코어와 HP 크기 증가
    ctx.fillText(`Score: ${score}`, 10, 40);
    ctx.fillText(`HP: ${hp}`, 10, 80);
    ctx.fillText(`남은 총알: ${remainingBullets}`, 10, 120); // 남은 총알 표시

    requestAnimationFrame(gameLoop);
}

// 키 입력 처리
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") player.dy = -player.speed;
    if (e.key === "ArrowDown") player.dy = player.speed;
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
    if (e.key === " ") shootLaser();
});

document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown"].includes(e.key)) player.dy = 0;
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) player.dx = 0;
});







