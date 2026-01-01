// ==============================
// 1. DOM 요소 & 설정
// ==============================

//이미지 불러오기
// ==============================
const PlayerImgs = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
PlayerImgs[0].src = 'Images/Milloo_Walk_0.png';
PlayerImgs[1].src = 'Images/Milloo_Walk_1.png';
PlayerImgs[2].src = 'Images/Milloo_Walk_2.png';
PlayerImgs[3].src = 'Images/Milloo_Walk_3.png';
PlayerImgs[4].src = 'Images/Milloo_Gameover_0.png';
PlayerImgs[5].src = 'Images/Milloo_Gameover_1.png';
PlayerImgs[6].src = 'Images/Milloo_Gameover_2.png';
PlayerImgs[7].src = 'Images/Milloo_Gameover_3.png';
const ObstacleImg = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
ObstacleImg[0].src = 'Images/Obstacle_0.png';
ObstacleImg[1].src = 'Images/Obstacle_1.png';
ObstacleImg[2].src = 'Images/Obstacle_2.png';
ObstacleImg[3].src = 'Images/Obstacle_3.png';
ObstacleImg[4].src = 'Images/Obstacle_4.png';
ObstacleImg[5].src = 'Images/Obstacle_5.png';
ObstacleImg[6].src = 'Images/Obstacle_6.png';
ObstacleImg[7].src = 'Images/Obstacle_7.png';

const itemImg = new Image();
itemImg.src = 'Images/Item_1.png'; // ⚠️ 파일 경로 확인해주세요!
// ==============================
const bgm1 = new Audio('Sounds/BGM_Cave.mp3'); // 파일 경로 확인 필수!
bgm1.volume = 0.1; // 볼륨 조절 (0.0 ~ 1.0)
// [Sound] BGM 재생 및 루프 구간 설정
// 기존 bgm.loop = true; 는 제거 (수동으로 조절할 것이므로)
bgm1.loop = false;
bgm1.currentTime = 0;

// 루프 이벤트 리스너 (중복 등록 방지를 위해 먼저 제거 후 추가)
if (this.bgmHandler) {
	bgm1.removeEventListener('timeupdate', this.bgmHandler);
}

this.bgmHandler = () => {
	// 만약 인트로도 건너뛰고 싶으면 0 대신 13(드랍 시작 부분)으로 설정하세요.
	if (bgm1.currentTime >= 170.55) {
		bgm1.currentTime = 0;
		bgm1.play();
	}
};

bgm1.addEventListener('timeupdate', this.bgmHandler);
bgm1.play().catch(error => {
	console.log("BGM 재생 실패:", error);
});
const bgm2 = new Audio();
bgm2.src = 'Sounds/BGM_Forest.mp3';
bgm2.volume = 0.1;
bgm2.loop = true;
bgm2.currentTime = 0;
const itemSound = new Audio('Sounds/item.mp3');
const jumpSound = new Audio('Sounds/jump.wav'); // 파일 경로 잘 확인!
const dropSound = new Audio('Sounds/drop.wav');
const crashSound = new Audio('Sounds/explosion.wav');
const meowingSound = new Audio('Sounds/catMeow.mp3');
// 소리 크기 조절 (0.0 ~ 1.0)
itemSound.volume = 0.6;
jumpSound.volume = 0.1;  // 점프는 너무 시끄러우면 귀 아픔
dropSound.volume = 0.1;
crashSound.volume = 0.3;
meowingSound.volume = 0.2;
//소리 배속 조정
meowingSound.playbackRate = 1.5;
// ==============================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const introScreen = document.getElementById('introScreen');
const helpScreen = document.getElementById('helpScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');

const startBtn = document.getElementById('startButton');
const howToPlayBtn = document.getElementById('howToPlayButton');
const closeHelpBtn = document.getElementById('closeHelpButton');
const retryBtn = document.getElementById('retryButton');
const homeBtn = document.getElementById('homeButton');
const levelBtns = document.querySelectorAll('.btn-level');

canvas.width = 800;
canvas.height = 450;

// ==============================
// 2. 난이도 및 해금 설정
// ==============================
// 전역 변수로 해금 레벨 관리
let unlockedLevelIndex = parseInt(localStorage.getItem('milloo_unlocked_level')) || 0;

// ==============================
// 1. 레벨 및 색상 설정 (Centralized Config)
// ==============================
const LEVEL_SETTINGS = {
	PLAINS: {
		index: 0,                 // 👈 [추가] 0번 인덱스 (기본 해금)
		name: "평원 (Plains)",
		description: "조작법을 익히고 점프에 익숙해지세요.",
		speed: 7,
		maxSpeed: 11,
		unlockScore: 0,
		// 🎨 색상 팔레트
		bgColor: '#87CEEB',
		groundColor: '#8B4513',
		grassColor: '#32CD32',
		obsColor: '#1E1E1E',
		uiColor: '#000000'
	},
	FOREST: {
		index: 1,                 // 👈 [추가] 1번 인덱스
		prevLevel: 'PLAINS',      // 👈 [추가] 이전 레벨 키 (잠금 메시지용)
		name: "숲 (Forest)",
		description: "급강하를 연습하고 장애물을 피하세요.",
		speed: 9,
		maxSpeed: 15,
		unlockScore: 500,
		// 🎨 색상 팔레트
		bgColor: '#2E8B57',       // (기존 코드에서 색상값 수정함, 숲 느낌나게)
		groundColor: '#1a472a',
		grassColor: '#006400',
		obsColor: '#7B3503',
		uiColor: '#FFFFFF'
	},
	CAVE: {
		index: 2,                 // 👈 [추가] 2번 인덱스
		prevLevel: 'FOREST',      // 👈 [추가] 이전 레벨 키
		name: "동굴 (Cave)",
		description: "최고 난이도! 극한의 컨트롤을 보여주세요.",
		speed: 11,
		maxSpeed: 16,
		unlockScore: 500,
		// 🎨 색상 팔레트
		bgColor: '#2b1010',
		groundColor: '#3e3e3eff',
		grassColor: '#000000ff',
		obsColor: '#57009fff',
		uiColor: '#FFFFFF'
	}
};

let currentLevelKey = 'PLAINS';

// ==============================
// 3. UI 업데이트 함수
// ==============================
function updateLevelButtons() {
	// 확실하게 하기 위해 저장된 값을 다시 불러옵니다
	unlockedLevelIndex = parseInt(localStorage.getItem('milloo_unlocked_level')) || 0;

	levelBtns.forEach(btn => {
		const levelKey = btn.dataset.level;
		const config = LEVEL_SETTINGS[levelKey];

		if (config.index <= unlockedLevelIndex) {
			btn.classList.remove('locked');
			btn.innerHTML = `${getLevelIcon(levelKey)} ${config.name}<br><span class="desc">${config.description}</span>`;
			btn.disabled = false;
		} else {
			btn.classList.add('locked');
			const prevName = LEVEL_SETTINGS[config.prevLevel].name;
			btn.innerHTML = `🔒 Locked<br><span class="lock-overlay">${prevName} ${config.unlockScore}점 필요</span>`;
			btn.disabled = true;
		}
	});
}

function getLevelIcon(key) {
	if (key === 'PLAINS') return '🌿';
	if (key === 'FOREST') return '🌲';
	if (key === 'CAVE') return '🦇';
	return '';
}

updateLevelButtons();

// ==============================
// 4. 클래스 정의
// ==============================
const COLORS = {
	GROUND: '#3E2723',
	CAVE_GROUND: '#1B1B1B',
	CAVE_GRASS: '#444444',
	GRASS: '#00FF00',
	PLAYER: '#FFFFFF'
};
class BoxCollider {
	constructor(x, y, w, h) {
		this.x = x; this.y = y; this.w = w; this.h = h;
	}
	isCollidingWith(other) {
		const padding = 10;
		return !(
			(this.x + this.w - padding) < (other.x + padding) ||
			(this.x + padding) > (other.x + other.w - padding) ||
			(this.y + this.h - padding) < (other.y + padding) ||
			(this.y + padding) > (other.y + other.h - padding)
		);
	}
}
// ☁️ 배경 장식 (구름 / 자수정 / 나무)
class Decor {
	constructor(w, h, type) {
		this.type = type; // 'CLOUD', 'AMETHYST', 'TREE'
		this.x = w + Math.random() * 200;

		// 🌲 나무는 바닥 쪽에 배치
		if (this.type === 'TREE') {
			// 바닥(h)에서 약간 위쪽
			this.size = Math.random() * 100 + 100; // 나무 높이 (60~100)
			this.y = h - this.size * 0.4 - 40; // 바닥에서 나무 높이만큼 올림
			this.speedFactor = Math.random() * 0.5 + 0.25; // 나무는 구름보다 빨리, 장애물보단 느리게 (원근감)
		}
		// ☁️ 구름 & ✨ 자수정은 공중에 배치
		else {
			this.y = Math.random() * (h - 150);
			this.size = Math.random() * 30 + 20;
			this.speedFactor = 0.25;
		}

		// ✨ 자수정 설정
		this.angle = Math.random() * Math.PI * 2;
		const amethystColors = ['#fb4040ff', '#D500F9', '#3300ffff', '#4ddeffff', '#8eff88ff'];
		this.fillStyle = amethystColors[Math.floor(Math.random() * amethystColors.length)];
	}

	update(gameSpeed) {
		this.x -= gameSpeed * this.speedFactor;
	}

	draw(ctx) {
		// 🌲 나무 그리기 (숲)
		if (this.type === 'TREE') {
			ctx.save();
			// 나무 기둥 (갈색)
			ctx.fillStyle = '#4E342E';
			const trunkW = this.size * 0.2;
			const trunkH = this.size * 0.4;
			ctx.fillRect(this.x - trunkW / 2, this.y, trunkW, trunkH);

			// 나무 잎 (삼각형, 짙은 초록)
			ctx.fillStyle = '#1B5E20';
			ctx.beginPath();
			ctx.moveTo(this.x, this.y - this.size * 0.8); // 꼭대기
			ctx.lineTo(this.x + this.size * 0.4, this.y + trunkH * 0.2); // 우측 하단
			ctx.lineTo(this.x - this.size * 0.4, this.y + trunkH * 0.2); // 좌측 하단
			ctx.fill();

			ctx.restore();
		}
		// ✨ 자수정 그리기 (동굴)
		else if (this.type === 'AMETHYST') {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.angle);

			ctx.fillStyle = this.fillStyle;
			ctx.beginPath();
			ctx.moveTo(0, -this.size / 2);
			ctx.lineTo(this.size / 2, 0);
			ctx.lineTo(0, this.size / 2);
			ctx.lineTo(-this.size / 2, 0);
			ctx.fill();

			// 광택
			ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
			ctx.beginPath();
			ctx.moveTo(0, -this.size / 2);
			ctx.lineTo(this.size / 4, -this.size / 4);
			ctx.lineTo(0, 0);
			ctx.fill();

			ctx.restore();
		}
		// ☁️ 구름 그리기 (평원)
		else {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.arc(this.x + this.size * 0.8, this.y + 10, this.size * 0.7, 0, Math.PI * 2);
			ctx.arc(this.x - this.size * 0.8, this.y + 10, this.size * 0.7, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}
// 🦴 아이템 클래스 (뼈다귀)
class Item extends BoxCollider {
	constructor(x, y, gameSpeed) {
		super(x, y, 40, 40); // 크기 40x40
		this.speed = gameSpeed;
		this.markedForDeletion = false;

		// 아이템이 위아래로 둥둥 떠다니는 효과를 위한 변수
		this.bobAngle = 0;
		this.startY = y;
	}

	update(speed) {
		this.x -= speed; // 장애물과 똑같은 속도로 이동

		// 둥둥 떠다니는 효과 (Sine Wave)
		this.bobAngle += 0.1;
		this.y = this.startY + Math.sin(this.bobAngle) * 10;

		if (this.x + this.w < 0) this.markedForDeletion = true;
	}

	draw(ctx) {
		if (itemImg.complete) {
			// 이미지가 로드되었으면 이미지 그리기
			ctx.drawImage(itemImg, this.x, this.y, this.w, this.h);
		} else {
			// 로딩 안 됐으면 임시로 노란 박스
			ctx.fillStyle = 'yellow';
			ctx.fillRect(this.x, this.y, this.w, this.h);
		}
	}
}

// 💬 점수 획득 시 뜨는 텍스트 효과
class FloatingText {
	constructor(x, y, text, color) {
		this.x = x;
		this.y = y;
		this.text = text;
		this.color = color;
		this.life = 1.0; // 투명도
		this.vy = -2;    // 위로 올라가는 속도
	}
	update() {
		this.y += this.vy;
		this.life -= 0.02; // 점점 사라짐
	}
	draw(ctx) {
		ctx.save();
		ctx.globalAlpha = this.life;
		ctx.fillStyle = this.color;
		ctx.font = "bold 30px Arial";
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 3;
		ctx.strokeText(this.text, this.x, this.y);
		ctx.fillText(this.text, this.x, this.y);
		ctx.restore();
	}
}
class Particle {
	constructor(x, y, color, type) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.size = Math.random() * 5 + 5;
		this.speedX = (Math.random() - 0.5) * 6;
		this.speedY = (Math.random() - 0.5) * 6;
		this.life = 1.0
		this.decay = Math.random() * 0.03 + 0.02;

		if (type === 'JUMP') {
			this.speedY = Math.random() * -2 - 1;
			this.color = 'rgba(255, 255, 255, 0.8)';
		} else if (type === 'LAND') {
			this.speedY = Math.random() * -3 - 2;
		} else if (type === 'RUN') {
			this.speedX = (Math.random() - 1.5) * 3;
			this.speedY = Math.random() * 1 - 0.8;
		} else if (type === 'DASH') {
			this.speedX = (Math.random() - 1.5) * 3;
			this.speedY = Math.random() * 5 - 2.5;
		} else if(type === 'BACKGROUND') {
			this.size = Math.random() * 10 + 2;
			this.speedX = -10;
			this.speedY = (Math.random() - 0.5) * 1.5;
			this.decay = Math.random() * 0.01 + 0.005;
		}
	}
	update() {
		this.x += this.speedX;
		this.y += this.speedY;
		this.life -= this.decay;
		this.size *= 0.95;
	}
	draw(ctx) {
		ctx.save();
		ctx.globalAlpha = this.life;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.size, this.size);
		ctx.restore();
	}
}
class Player extends BoxCollider {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.vy = 0;

		this.gravity = 1.2;
		this.jumpPower = 19;
		this.divePower = 35;

		this.isGrounded = false;
		this.coyoteTime = 0;

		// 이미지 배열 (0~3: 걷기, 4~7: 게임오버)
		this.sprites = PlayerImgs;

		// 걷기 애니메이션 변수
		this.frameIndex = 0;
		this.animTimer = 0;

		// [추가] 게임오버 애니메이션 변수
		this.deadFrameIndex = 0; // 0, 1, 2, 3 (실제 인덱스는 +4)
		this.deadAnimTimer = 0;
		this.rotation = 0; // 회전 각도
	}

	// [기존 update는 살았을 때만 호출됨]
	update(game) {
		// ... (기존 물리/점프/달리기 로직 그대로 유지) ...
		this.vy += this.gravity;
		this.y += this.vy;
		const groundY = canvas.height - 40;

		if (this.y + this.h >= groundY) {
			if (this.vy > 20) {
				game.shakeTime = 15;
				game.spawnParticles(this.x + this.w / 2, groundY, '#FFFF00', 50, 'LAND');
				if (typeof dropSound !== 'undefined') {
					dropSound.currentTime = 0;
					dropSound.play();
				}
			}
			this.y = groundY - this.h;
			this.vy = 0;
			this.isGrounded = true;
			this.coyoteTime = 5;
		} else {
			this.isGrounded = false;
			if (this.coyoteTime > 0) this.coyoteTime--;
		}

		if (game.gameSpeed > 10 && this.isGrounded) {
			game.spawnParticles(this.x + (7 * this.w / 8), this.y + this.h, '#8D6E63', Math.ceil(game.gameSpeed - 10), 'RUN');
		}
		if(game.gameSpeed > 14) {
			game.spawnParticles(this.x + this.w -20, this.y + 3 * this.h / 4 + (Math.random() - 0.5) * 20, '#ffffffff', 1, 'DASH');
		}

		// 걷기 애니메이션
		if (this.isGrounded) {
			const switchThreshold = 50 / game.gameSpeed;
			this.animTimer++;
			if (this.animTimer >= switchThreshold) {
				this.frameIndex = (this.frameIndex + 1) % 4;
				this.animTimer = 0;
			}
		} else {
			this.frameIndex = 5;
			this.rotation = this.vy > 4 ? Math.PI / 6 : (this.vy < -4 ? -Math.PI / 6 : 0);
			if(this.vy > 15) this.rotation = Math.PI / 2;
		}
	}

	// [추가] 죽었을 때 애니메이션 업데이트 함수
	updateDeadAnimation() {
		// 게임오버 이미지는 총 4장 (인덱스 0~3)
		// 마지막 프레임(3)에 도달하면 더 이상 업데이트 하지 않음 (멈춤)
		if (this.deadFrameIndex < 3) {
			this.deadAnimTimer++;
			// 속도 조절: 숫자가 클수록 느리게 재생됨 (현재 10프레임마다 교체)
			if (this.deadAnimTimer > 8) {
				this.deadFrameIndex++;
				this.deadAnimTimer = 0;
			}
		}
	}
	draw(ctx, isDead) {
		let currentImg;

		// 이미지 선택 로직
		if (isDead) {
			const spriteIndex = 4 + this.deadFrameIndex;
			currentImg = this.sprites[spriteIndex];
		} else {
			currentImg = this.sprites[this.frameIndex];
		}

		// 🌀 회전 그리기를 위한 준비
		ctx.save(); // 현재 캔버스 상태 저장

		// 1. 캔버스의 원점(0,0)을 캐릭터의 정중앙(Center)으로 이동
		ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

		// 2. 공중에 떠 있고, 살아있다면 회전 적용
		if (!this.isGrounded && !isDead) {
			ctx.rotate(this.rotation);
		}

		// 3. 죽었을 때 약간 삐딱하게 누워있게 하려면 아래 주석 해제
		// if (isDead) ctx.rotate(Math.PI / 2); 

		// 4. 이미지 그리기
		// (원점을 중앙으로 옮겼으므로, 좌표는 -w/2, -h/2 부터 그려야 함)
		if (currentImg && currentImg.complete) {
			ctx.drawImage(currentImg, -this.w / 2, -this.h / 2, this.w, this.h);
		} else {
			// 이미지 로딩 전 박스 그리기
			ctx.fillStyle = isDead ? 'gray' : COLORS.PLAYER;
			ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
		}

		ctx.restore(); // 캔버스 상태 복구 (다음 그림에 영향 안 주게)
	}
	inputJump() {
		if (this.isGrounded || this.coyoteTime > 0) {
			this.vy = -this.jumpPower;
			this.isGrounded = false;
			this.coyoteTime = 0;
			return true;
		} else {
			this.vy = this.divePower;
			return false;
		}
	}
}

class Obstacle extends BoxCollider {
	constructor(x, y, w, h, speed, color, type) {
		super(x, y, w, h);
		this.speed = speed;
		this.color = color;
		this.markedForDeletion = false;
		this.isTrap = false;
		this.type = type; // 'PLAIN', 'FOREST', 'CAVE'
		this.sprite = ObstacleImg;
		switch(type) {
			case 'PLAIN':
			case 'PLAINS':
				this.spriteIndex = Math.floor(Math.random() * 4); // 0~3
				break;
			case 'FOREST':
				this.spriteIndex = Math.floor(Math.random() * 4); // 0~3
				break;
			case 'CAVE':
				this.spriteIndex = Math.floor(Math.random() * 4) + 4; // 4~7
				break;
		}
	}
	update() {
		this.x -= this.speed;
		if (this.x + this.w < 0) this.markedForDeletion = true;
	}
	draw(ctx) {
		// 1. 공중에 떠있는지 판별 (바닥 높이인 canvas.height - 40 보다 위쪽인지 확인)
		// 여유값(10px)을 두어 바닥에 살짝 떠있는 건 무시
		const groundLevel = ctx.canvas.height - 40;
		const isFloating = (this.y + this.h) < (groundLevel - 10);

		ctx.save(); // 현재 그리기 상태 저장

		// 2. 장애물의 '정중앙'을 기준점으로 잡음 (회전을 위해 필수)
		ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

		// 3. 공중에 떠 있다면 180도 회전 (뒤집기)
		if (isFloating) {
			ctx.rotate(Math.PI);
		}

		// 4. 그리기 (기준점이 중앙(0,0)으로 옮겨졌으므로 좌표는 -w/2, -h/2 부터 그림)

		// (1) 이미지 그리기 (아까 오류 났던 부분 안전장치 포함)
		if (this.sprite && this.sprite[this.spriteIndex] && this.sprite[this.spriteIndex].complete) {
			ctx.drawImage(this.sprite[this.spriteIndex], -this.w / 2, -this.h / 2, this.w, this.h);
		} else {
			// 이미지가 없으면 색깔 박스
			ctx.fillStyle = this.color;
			ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
		}

		// (2) 테두리 및 함정 표시
		if (this.isTrap) {
			ctx.strokeStyle = '#FF0000';
			ctx.lineWidth = 4;
			ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

			// 느낌표(!) 표시 - 중앙 정렬
			ctx.fillStyle = 'white';
			ctx.font = 'bold 20px Arial';
			ctx.textAlign = 'center';     // 가로 중앙
			ctx.textBaseline = 'middle';  // 세로 중앙
			ctx.fillText('!', 0, 0);      // 정중앙에 그리기
		}

		ctx.restore(); // 저장해둔 상태 복구 (다음 그림에 영향 안 주게)
	}
}

// ==============================
// 5. 게임 매니저 (Game Class) - 전략적 아이템 배치 버전
// ==============================
class Game {
	constructor(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.player = null;
		this.obstacles = [];
		this.items = [];
		this.floatingTexts = [];
		this.particles = [];
		this.decors = [];

		this.isRunning = false;
		this.isDead = false;
		this.animationId = null;
		this.score = 0;
		this.highScore = 0;

		this.warningActive = false;
		this.warningTimer = 0;
		this.showWarningIcon = false;

		this.finalScore = 0;
		this.isNewRecord = false;
		this.unlockMessage = "";
		this.shakeTime = 0;

		this.levelConfig = LEVEL_SETTINGS[currentLevelKey];
		this.drawBackground();
		this.bgm = null;
	}

	setup() {
		this.levelConfig = LEVEL_SETTINGS[currentLevelKey];
		this.player = new Player(50, 50, 70, 70);
		this.obstacles = [];
		this.items = [];
		this.floatingTexts = [];
		this.particles = [];
		this.decors = [];

		for (let i = 0; i < 5; i++) {
			this.spawnDecor(true);
		}

		this.score = 0;
		this.gameSpeed = this.levelConfig.speed;
		this.spawnTimer = 0;
		// itemSpawnTimer는 삭제 (장애물과 연동하므로 불필요)

		this.warningActive = false;
		this.warningTimer = 0;
		this.showWarningIcon = false;
		this.shakeTime = 0;

		this.isRunning = true;
		this.isDead = false;
		if(currentLevelKey === 'CAVE') {
			this.bgm = bgm1;
		} else if(currentLevelKey === 'FOREST') {
			this.bgm = bgm2;
		} else {
			this.bgm = bgm2;
		}
		this.bgm.currentTime = 0;
		this.bgm.play().catch(error => { console.log(error); });

		const saveKey = `milloo_highscore_${currentLevelKey}`;
		this.highScore = parseInt(localStorage.getItem(saveKey)) || 0;

		introScreen.style.display = 'none';
		gameOverScreen.style.display = 'none';
		helpScreen.style.display = 'none';

		if (!this.handleInput) {
			this.handleInput = (e) => {
				if (this.isRunning && !this.isDead) {
					if (e.code === 'Space' || e.code === 'ArrowUp') {
						e.preventDefault();
						this.triggerJump();
					}
				}
			};
			window.addEventListener('keydown', this.handleInput);

			this.handleTouch = (e) => {
				if (e.cancelable && e.type === 'touchstart') e.preventDefault();
				if (this.isRunning && !this.isDead) {
					this.triggerJump();
				}
			};
			this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });
			this.canvas.addEventListener('mousedown', this.handleTouch);
		}

		this.loop();
	}

	triggerJump() {
		const isJump = this.player.inputJump();
		if (isJump) {
			if (typeof jumpSound !== 'undefined') {
				jumpSound.currentTime = 0;
				jumpSound.play().catch(() => { });
			}
			this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h, '#FFF', 10, 'JUMP');
		}
	}

	spawnParticles(x, y, color, amount, type) {
		for (let i = 0; i < amount; i++) {
			this.particles.push(new Particle(x, y, color, type));
		}
	}

	spawnDecor(randomX = false) {
		let type;

		if (currentLevelKey === 'FOREST') {
			type = 'TREE';     // 숲이면 나무
		} else if (currentLevelKey === 'CAVE') {
			type = 'AMETHYST'; // 동굴이면 자수정
		} else {
			type = 'CLOUD';    // 평원이면 구름
		}

		const decor = new Decor(this.canvas.width, this.canvas.height, type);

		if (randomX) {
			decor.x = Math.random() * this.canvas.width;
		}

		this.decors.push(decor);
	}

	updateWarningSequence() {
		if (!this.warningActive) return;
		this.warningTimer += 2;
		if ((this.warningTimer >= 0 && this.warningTimer < 20) ||
			(this.warningTimer >= 40 && this.warningTimer < 60) ||
			(this.warningTimer >= 80 && this.warningTimer < 100)) {
			this.showWarningIcon = true;
		} else {
			this.showWarningIcon = false;
		}
		if (this.warningTimer === 120) {
			this.spawnFastTrap();
			this.warningActive = false;
			this.showWarningIcon = false;
			this.spawnTimer = 0;
		}
	}

	spawnFastTrap() {
		const groundY = this.canvas.height - 40;
		const w = 40; const h = 40;
		let trapSpeed = this.gameSpeed * 3;
		const trap = new Obstacle(this.canvas.width, groundY - h, w, h, trapSpeed, '#FF3333');
		trap.isTrap = true;
		meowingSound.currentTime = 0;
		meowingSound.play().catch(() => { });
		this.obstacles.push(trap);
	}

	// [수정] 장애물 생성 시 아이템 위치를 계산해서 배치
	spawnObstacle() {
		if (this.warningActive) return;
		
		const rand = Math.random();
		const groundY = this.canvas.height - 40;
		const color = this.levelConfig.obsColor;
		let newObstacles = []; // 이번 턴에 생성된 장애물들

		if (currentLevelKey === 'FOREST' && rand < 0.15) {
			this.warningActive = true; this.warningTimer = 0; return;
		}
		if (currentLevelKey === 'CAVE' && rand < 0.25) {
			this.warningActive = true; this.warningTimer = 0; return;
		}

		// --- 장애물 생성 로직 ---
		if (currentLevelKey === 'PLAINS' && this.score < 5000) {
			const w = 30 + Math.random() * 20; const h = 30 + Math.random() * 20;
			let obs = new Obstacle(this.canvas.width, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
			this.obstacles.push(obs);
			newObstacles.push(obs);
		}
		else if (currentLevelKey === 'FOREST' || (currentLevelKey === 'PLAINS' && this.score >= 5000)) {
			if (rand < 0.4) {
				const yPos = groundY - 50 - (60 + Math.random() * 40);
				let obs1 = new Obstacle(this.canvas.width, groundY - 60, 40, 60, this.gameSpeed, color, currentLevelKey);
				let obs2 = new Obstacle(this.canvas.width + 220, yPos, 40, 40, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(obs1, obs2);
				newObstacles.push(obs1, obs2);
			} else if (rand < 0.8) {
				const w = 30 + Math.random() * 20;
				const h = 40 + Math.random() * 20;
				let obs = new Obstacle(this.canvas.width, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(obs);
				newObstacles.push(obs);
			} else {
				const w = 30; const h = 40;
				let obs1 = new Obstacle(this.canvas.width, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				let obs2 = new Obstacle(this.canvas.width + 250, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(obs1, obs2);
				newObstacles.push(obs1, obs2);
			}
		}
		else if (currentLevelKey === 'CAVE') {
			if (rand < 0.333) {
				let o1 = new Obstacle(this.canvas.width, groundY - 60, 40, 60, this.gameSpeed, color, currentLevelKey);
				let o2 = new Obstacle(this.canvas.width + 160, groundY - 120, 40, 60, this.gameSpeed, color, currentLevelKey);
				let o3 = new Obstacle(this.canvas.width + 400, groundY - 60, 40, 60, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(o1, o2, o3);
				newObstacles.push(o1, o2, o3);
			} else if (rand < 0.666) {
				let o1 = new Obstacle(this.canvas.width, groundY - 140, 40, 60, this.gameSpeed, color, currentLevelKey);
				let o2 = new Obstacle(this.canvas.width + 240, groundY - 60, 40, 60, this.gameSpeed, color, currentLevelKey);
				let o3 = new Obstacle(this.canvas.width + 400, groundY - 140, 40, 60, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(o1, o2, o3);
				newObstacles.push(o1, o2, o3);
			} else {
				const w = 30; const h = 40;
				let o1 = new Obstacle(this.canvas.width, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				let o2 = new Obstacle(this.canvas.width + 250, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				let o3 = new Obstacle(this.canvas.width + 500, groundY - h, w, h, this.gameSpeed, color, currentLevelKey);
				this.obstacles.push(o1, o2, o3);
				newObstacles.push(o1, o2, o3);
			}
		}

		// [전략적 아이템 배치]
		// 40% 확률로 장애물 세트와 함께 아이템 생성
		if (Math.random() < 0.40 && newObstacles.length > 0) {
			// 생성된 장애물 중 하나를 고름 (주로 첫 번째 것)
			const targetObs = newObstacles[Math.floor(Math.random() * newObstacles.length)];

			let itemX = targetObs.x;
			let itemY = 0;
			itemX = targetObs.x - 100; // 장애물 앞
			itemY = targetObs.y; // 높이

			// 아이템 생성
			this.items.push(new Item(itemX, itemY, this.gameSpeed));
		}
	}

	loop() {
		if (!this.isRunning) return;

		if (!this.isDead) {
			this.score++;
			this.player.update(this);
			this.updateWarningSequence();

			this.spawnTimer++;
			let interval = 90;
			if (this.spawnTimer > interval) {
				this.spawnObstacle();
				this.spawnTimer = 0;
			}

			// [변경] 별도의 아이템 타이머 제거됨 (spawnObstacle에서 처리)

			if (Math.random() < 0.02) this.spawnDecor();

			for (let obs of this.obstacles) {
				obs.update();
				if (this.player.isCollidingWith(obs)) {
					this.triggerGameOverSequence();
				}
			}
			this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion);

			// 아이템 처리
			for (let item of this.items) {
				item.update(this.gameSpeed);
				if (!item.markedForDeletion && this.player.isCollidingWith(item)) {
					item.markedForDeletion = true;
					this.score += 500;

					if (typeof itemSound !== 'undefined') {
						itemSound.currentTime = 0;
						itemSound.play().catch(() => { });
					}

					this.floatingTexts.push(new FloatingText(item.x, item.y, "+50", "#FFFF00"));
					this.spawnParticles(item.x + 20, item.y + 20, '#FFFF00', 10, 'JUMP');
				}
			}
			this.items = this.items.filter(item => !item.markedForDeletion);

			this.floatingTexts.forEach(ft => ft.update());
			this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

			this.decors.forEach(d => d.update(this.gameSpeed));
			this.decors = this.decors.filter(d => d.x > -100);
			if(currentLevelKey === 'CAVE') this.spawnParticles(this.canvas.width, Math.random() * canvas.height, '#AAAAAA', 1, 'BACKGROUND');

			if (this.gameSpeed < this.levelConfig.maxSpeed) {
				this.gameSpeed += 0.002;
			}
		}
		else {
			this.player.y = this.canvas.height - 40 - this.player.h;
			this.player.updateDeadAnimation();
		}

		this.particles.forEach(p => p.update());
		this.particles = this.particles.filter(p => p.life > 0);

		if (this.shakeTime > 0) this.shakeTime--;

		this.draw();
		this.animationId = requestAnimationFrame(() => this.loop());
	}

	draw() {
		this.ctx.save();

		if (this.shakeTime > 0) {
			const magnitude = 5;
			const dx = (Math.random() - 0.5) * magnitude;
			const dy = (Math.random() - 0.5) * magnitude;
			this.ctx.translate(dx, dy);
		}

		this.drawBackground();

		this.decors.forEach(d => d.draw(this.ctx));
		this.obstacles.forEach(obs => obs.draw(this.ctx));

		this.items.forEach(item => item.draw(this.ctx));

		if (currentLevelKey === 'CAVE') {
			const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
			gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
			gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
			this.ctx.fillStyle = gradient;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		} else if (currentLevelKey === 'FOREST') {
			const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
			gradient.addColorStop(0, 'rgba(129, 199, 132, 0)');
			gradient.addColorStop(1, 'rgba(129, 199, 135, 0.8)');
			this.ctx.fillStyle = gradient;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		if (this.showWarningIcon) {
			this.ctx.fillStyle = 'red';
			this.ctx.textAlign = 'center';
			this.ctx.font = 'bold 60px Arial';
			this.ctx.fillText('⚠️', this.canvas.width - 60, this.canvas.height / 2);
			this.ctx.font = 'bold 20px Arial';
			this.ctx.fillText('DANGER!', this.canvas.width - 60, this.canvas.height / 2 + 40);
		}

		this.player.draw(this.ctx, this.isDead);
		this.particles.forEach(p => p.draw(this.ctx));
		this.floatingTexts.forEach(ft => ft.draw(this.ctx));
		this.ctx.fillStyle = this.levelConfig.uiColor;
		this.ctx.textAlign = 'right';
		this.ctx.font = 'bold 20px Arial';
		const currentScore = Math.floor(this.score / 10);
		if (currentLevelKey !== 'PLAINS') {
			this.ctx.fillText(`Best: ${this.highScore}  |  Score: ${currentScore}`, this.canvas.width - 20, 30);
		} else {
			this.ctx.fillText(`Score: ${currentScore}`, this.canvas.width - 20, 30);
		}
		this.ctx.font = '14px Arial';
		this.ctx.fillText(this.levelConfig.name, this.canvas.width - 20, 50);

		this.ctx.restore();
	}

	drawBackground() {
		// 1. 배경 (하늘)
		this.ctx.fillStyle = this.levelConfig.bgColor;
		// 화면보다 크게 그려서 흔들림(Shake) 효과 때 흰 여백 방지
		this.ctx.fillRect(-200, -200, this.canvas.width + 400, this.canvas.height + 400);

		// 2. 땅 (Ground)
		this.ctx.fillStyle = this.levelConfig.groundColor;
		this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);

		// 3. 잔디/윗면 (Grass)
		this.ctx.fillStyle = this.levelConfig.grassColor;
		this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 10);
	}

	triggerGameOverSequence() {
		this.isDead = true;
		this.shakeTime = 20;

		this.bgm.pause();
		if (typeof crashSound !== 'undefined') {
			crashSound.currentTime = 0;
			crashSound.play().catch(() => { });
		}

		this.calculateScore();
		setTimeout(() => { this.showGameOverUI(); }, 1000);
	}

	calculateScore() {
		this.finalScore = Math.floor(this.score / 10);
		this.isNewRecord = false;
		this.unlockMessage = "";

		if (currentLevelKey !== 'PLAINS') {
			if (this.finalScore > this.highScore) {
				this.highScore = this.finalScore;
				localStorage.setItem(`milloo_highscore_${currentLevelKey}`, this.highScore);
				this.isNewRecord = true;
			}
		}

		unlockedLevelIndex = parseInt(localStorage.getItem('milloo_unlocked_level')) || 0;
		let newUnlock = false;

		if (currentLevelKey === 'PLAINS' && this.finalScore >= LEVEL_SETTINGS.FOREST.unlockScore) {
			if (unlockedLevelIndex < 1) {
				unlockedLevelIndex = 1;
				newUnlock = true;
				this.unlockMessage = `\n🎉 축하합니다! "숲" 코스가 열렸습니다!`;
			}
		}
		else if (currentLevelKey === 'FOREST' && this.finalScore >= LEVEL_SETTINGS.CAVE.unlockScore) {
			if (unlockedLevelIndex < 2) {
				unlockedLevelIndex = 2;
				newUnlock = true;
				this.unlockMessage = `\n🎉 대단해요! "동굴" 코스가 열렸습니다!`;
			}
		}

		if (newUnlock) {
			localStorage.setItem('milloo_unlocked_level', unlockedLevelIndex);
			updateLevelButtons();
		}
	}

	showGameOverUI() {
		this.isRunning = false;
		cancelAnimationFrame(this.animationId);

		let message = `[${this.levelConfig.name}] 최종 점수: ${this.finalScore}`;
		message += this.unlockMessage;
		if (this.isNewRecord) message += `\n🏆 NEW RECORD! 🏆`;
		if(currentLevelKey !== 'PLAINS') this.sendScore(this.finalScore);
		finalScoreText.innerText = message;
		gameOverScreen.style.display = 'flex';
	}
	sendScore(score) {
		// 1. 화면에 로딩 표시
		const rankText = document.getElementById('rankDisplay');
		if (rankText) {
			rankText.innerText = "📡 랭킹 등록 중...";
			rankText.style.color = "#AAAAAA";
		}

		// ⚠️ 주소 뒤에 '/submit'을 꼭 붙여야 합니다!
		const serverURL = "https://spaceship-adventure-server.onrender.com/submit";

		fetch(serverURL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				game_id: "Milloo_Extremely_Dangerous_Walk_"+currentLevelKey, // 게임 ID는 마음대로
				score: score
			})
		})
			.then(response => response.json())
			.then(data => {
				console.log("서버 응답:", data);

				if (rankText) {
					// 서버가 { rank: 5 } 처럼 등수를 줬다고 가정
					if (data.rank && data.total) {
						rankText.innerText = `🏆 현재 순위: ${data.rank}위`;
						rankText.style.color = "#FFD700"; // 황금색
					} else {
						rankText.innerText = "등록 완료! (등수 정보 없음)";
						rankText.style.color = "white";
					}
				}
			})
			.catch(error => {
				console.error("전송 실패:", error);
				if (rankText) {
					rankText.innerText = "서버 연결 실패(서버를 작동합니다. 어 안되잖아, 자, 작동이 안돼, 안돼! 으아아아아아아아아아)";
					rankText.style.color = "red";
				}
			});
	}
}
// ==============================
// 6. 이벤트 리스너
// ==============================
const game = new Game(canvas, ctx);

levelBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		if (btn.classList.contains('locked')) return;
		levelBtns.forEach(b => b.classList.remove('selected'));
		btn.classList.add('selected');
		currentLevelKey = btn.dataset.level;
	});
});

startBtn.addEventListener('click', () => game.setup());

howToPlayBtn.addEventListener('click', () => {
	introScreen.style.display = 'none';
	helpScreen.style.display = 'flex';
});

closeHelpBtn.addEventListener('click', () => {
	helpScreen.style.display = 'none';
	introScreen.style.display = 'flex';
});

retryBtn.addEventListener('click', () => game.setup());

homeBtn.addEventListener('click', () => {
	game.bgm.pause();
	game.bgm.currentTime = 0;
	gameOverScreen.style.display = 'none';
	introScreen.style.display = 'flex';
	game.drawBackground();
});