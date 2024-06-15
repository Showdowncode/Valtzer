// Få tilgang til canvas og kontekst
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Definerer spilleren
let player = {
    x: (canvas.width - 50) / 2,
    y: (canvas.height - 50) / 2,
    width: 50,
    height: 50,
    speed: 5,
    lives: 5,
    maxLives: 5
};

// Lister for sirkler og fiender
let circles = [];
let enemies = [];
let gameRunning = false;
let score = 0;

// Startspillet når knappen trykkes
document.getElementById("startButton").addEventListener("click", startGame);

function startGame() {
    gameRunning = true;
    document.getElementById("startScreen").style.display = "none";
    initGame();
}

// Initialiserer spillet
function initGame() {
    player.lives = 5;
    score = 0;
    circles = [];
    enemies = [];
    createCircle();
    createEnemy();
    draw();
}

// Oppretter en sirkel
function createCircle() {
    let radius = 10;
    let x = Math.random() * (canvas.width - 2 * radius) + radius;
    let y = Math.random() * (canvas.height - 2 * radius) + radius;
    circles.push({ x: x, y: y, radius: radius });
    setTimeout(() => circles.shift(), 4000); // Fjern sirkel etter 4 sekunder
}

// Oppretter en fiende
function createEnemy() {
    let size = 20;
    let x = Math.random() * (canvas.width - size);
    let y = Math.random() * (canvas.height - size);
    enemies.push({ x: x, y: y, size: size, speed: 1 });
}

// Tegner sirkler
function drawCircles() {
    ctx.fillStyle = "#00FF00";
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Tegner fiender
function drawEnemies() {
    ctx.fillStyle = "#FF0000";
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.size / 2, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + enemy.size);
        ctx.lineTo(enemy.x + enemy.size, enemy.y + enemy.size);
        ctx.closePath();
        ctx.fill();
    });
}

// Tegner spilleren
function drawPlayer() {
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Tegner liv
function drawLives() {
    let barWidth = player.maxLives * 20;
    let barHeight = 20;
    let barX = 10;
    let barY = 10;

    // Tegner rød rektangel (bakgrunn)
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Tegner grønn rektangel (gjenværende liv)
    let greenWidth = (player.lives / player.maxLives) * barWidth;
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(barX, barY, greenWidth, barHeight);
}

// Tegner poengsum
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Score: " + score, canvas.width - 100, 30);
}

// Oppdaterer spillerens posisjon
function updatePlayer(mouseEvent) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = mouseEvent.clientX - rect.left;
    let mouseY = mouseEvent.clientY - rect.top;

    player.x = mouseX - player.width / 2;
    player.y = mouseY - player.height / 2;
}

// Oppdaterer sirkler
function updateCircles() {
    circles = circles.filter(circle => {
        if (
            player.x < circle.x + circle.radius &&
            player.x + player.width > circle.x - circle.radius &&
            player.y < circle.y + circle.radius &&
            player.y + player.height > circle.y - circle.radius
        ) {
            score++;
            return false;
        }
        return true;
    });
}

// Oppdaterer fiender
function updateEnemies() {
    enemies.forEach((enemy, enemyIndex) => {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < enemy.size + player.width / 2) {
            player.lives--;
            enemies.splice(enemyIndex, 1); // Fjern fienden som har kollidert
            if (player.lives <= 0) {
                endGame();
            }
        } else {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        // Kollisjonslogikk for fiender
        enemies.forEach(otherEnemy => {
            if (enemy !== otherEnemy) {
                let edx = otherEnemy.x - enemy.x;
                let edy = otherEnemy.y - enemy.y;
                let edistance = Math.sqrt(edx * edx + edy * edy);

                if (edistance < enemy.size) {
                    let overlap = (enemy.size - edistance) / 2;
                    let angle = Math.atan2(edy, edx);
                    enemy.x -= Math.cos(angle) * overlap;
                    enemy.y -= Math.sin(angle) * overlap;
                    otherEnemy.x += Math.cos(angle) * overlap;
                    otherEnemy.y += Math.sin(angle) * overlap;

                    // Begrens fiendens bevegelse innenfor canvas-grensene
                    if (enemy.x < 0 || enemy.x + enemy.size > canvas.width) {
                        enemy.x = Math.max(0, Math.min(enemy.x, canvas.width - enemy.size));
                    }
                    if (enemy.y < 0 || enemy.y + enemy.size > canvas.height) {
                        enemy.y = Math.max(0, Math.min(enemy.y, canvas.height - enemy.size));
                    }
                }
            }
        });
    });
}

// Tegner alle elementer på skjermen
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawCircles();
    drawEnemies();
    drawLives();
    drawScore();

    updateCircles();
    updateEnemies();

    requestAnimationFrame(draw);
}

// Slutter spillet
function endGame() {
    gameRunning = false;
    document.getElementById("startScreen").style.display = "flex";
}

// Legger til eventlistener for musbevegelser
canvas.addEventListener("mousemove", updatePlayer);

// Oppretter sirkler og fiender med intervaller
setInterval(() => {
    if (gameRunning) createCircle();
}, 3000);

setInterval(() => {
    if (gameRunning) createEnemy();
}, 5000);



