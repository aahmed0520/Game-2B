class Movement extends Phaser.Scene {
    constructor() {
        super("movementScene");
        this.my = {sprite: {}, enemies: []};  

        this.bodyX = 400;
        this.bodyY = 550;

        this.bulletY = this.bodyY - 15;

        this.aKey = null;
        this.dKey = null;
        this.spaceKey = null;
        this.rKey = null;

        this.speedEnemy = 50;
        this.direction = 1;  
        this.dropDistance = 20;
        this.gameOver = false;
    }

    
    preload() {
        // Assets from Kenny Assets pack "Shape Characters"
        // https://kenney.nl/assets/shape-characters
        this.load.setPath("./assets/");

        this.load.image("character", "spaceShips_007.png");
        this.load.image("bullet", "laserRed10.png");
        this.load.image("enemy", "spider.png");
        this.load.image("enemy2", "slimeBlock.png");
        this.load.image("enemy3", "slimeBlue.png");
        this.load.image("enemy4", "snake.png");
    }

    create() {
        let my = this.my;   

        my.sprite.character = this.physics.add.sprite(this.bodyX, this.bodyY, "character").setScale(0.5);
        my.sprite.bullet = this.add.sprite(this.bodyX, this.bulletY, "bullet").setScale(0.5);

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        my.sprite.bullet.rotation = 300;

        my.sprite.bullet.visible = false;

        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.createEnemyGrid();

        this.physics.add.collider(this.bullets, this.enemies, this.handleBulletCollision, null, this);
        this.physics.add.collider(this.enemies, my.sprite.character, this.handleEnemyCollision, null, this);

        
        this.time.addEvent({
            delay: 1000,
            callback: this.moveEnemies,
            callbackScope: this,
            loop: true
        });

        this.endGameText = this.add.text(300, 250, '', { fontSize: '32px', fill: '#fff' });
        this.restartText = this.add.text(250, 300, '', { fontSize: '24px', fill: '#fff' });
        this.restartText.visible = false;

        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.restartGame();
            }
        });
    }

    update() {
        let my = this.my;   
    
        if (my.sprite.character.x > 0) {
            if (this.aKey.isDown) {
                my.sprite.character.x -= 10;
            }
        }
        if (my.sprite.character.x < 800) {
            if (this.dKey.isDown) {
                my.sprite.character.x += 10;
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let bullet = this.physics.add.sprite(my.sprite.character.x, my.sprite.character.y, "bullet").setScale(0.5);
            bullet.rotation = 300;
            this.bullets.add(bullet);
            bullet.setVelocityY(-300); 
        }
    
        
        this.bullets.children.iterate((bullet) => {
            if (bullet.y < 0) {
                bullet.destroy();
            }
        });
    
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.restartGame();
        }
    }

    createEnemyGrid() {
        const rows = 6;
        const cols = 6;
        const offsetX = 50;
        const offsetY = -80;  
        const spacingX = 80;
        const spacingY = 60;

        const enemyTypes = ["enemy", "enemy2", "enemy3", "enemy4"];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let enemyX = offsetX + col * spacingX;
                let enemyY = offsetY + row * spacingY;
                let enemyType = Phaser.Math.RND.pick(enemyTypes);  
                let enemy = this.physics.add.sprite(enemyX, enemyY, enemyType).setScale(0.5);
                this.enemies.add(enemy);
            }
        }
    }

    moveEnemies() {
        
        let changeDirection = false;

        this.enemies.children.iterate((enemy) => {
            if (enemy.x >= 750 && this.direction === 1) {
                changeDirection = true;
            } else if (enemy.x <= 50 && this.direction === -1) {
                changeDirection = true;
            }
        });

        
        if (changeDirection) {
            this.direction *= -1;
            this.enemies.children.iterate((enemy) => {
                enemy.y += this.dropDistance;
            });
        } else {
            
            this.enemies.children.iterate((enemy) => {
                enemy.x += this.direction * this.speedEnemy;
            });
        }
    }

    handleBulletCollision(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();

        let remainingEnemies = this.enemies.getChildren().filter((enemy) => enemy.active);

        if (remainingEnemies.length === 0) {
            this.endGame('You Win!');
        }
    }

    handleEnemyCollision(player, enemy) {
        this.endGame('Game Over!');
    }

    endGame(message) {
        
        this.endGameText.setText(message);
        this.restartText.setText('Press R to restart');
        this.endGameText.visible = true;
        this.restartText.visible = true;
        this.physics.pause();
        this.gameOver = true;
    }

    restartGame() {
        this.scene.restart();
        this.gameOver = false;
        this.endGameText.visible = false;
        this.restartText.visible = false;
        this.physics.resume();
    }
}