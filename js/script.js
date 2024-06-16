class Powerup{
	//Tracks each instance of the Powerup Class
	static puList = [];
	static types = ["oneUp", "wagonWheel", "machineGun", "shotgun", "nuke", "coffee", "badge"];

	constructor(time, active){
		this.x = Math.random() * (square * 14) + (xBound);
		this.y = Math.random() * (square * 14) + (square);
		this.time = time + 500;
		this.active = active;

		//Ensures powerups don't spawn on walls
		while(obstacles.includes(getGrid(this.x, this.y)) || 
		(pX - square < this.x && pX + (square) > this.x && 
		this - square < this.y && pY + (square) > this.y)){
			this.x = Math.random() * (square * 14) + (xBound * 2);
			this.y = Math.random() * (square * 14) + (square * 2);
		}

		this.type = Powerup.types[Math.floor(Math.random() * Powerup.types.length)];

		Powerup.puList.push(this);
	}

	draw(){
		//Powerups fade if not picked up in time
		if(timer >= this.time){
			console.log()
			this.remove();
		}

		if(!this.active){
			ctx.drawImage(eval(this.type), this.x, this.y, square, square);
		}
	}

	//Removes this from the powerup list
	remove(){
		let index = Powerup.puList.indexOf(this)
		if(index !== -1) {
			delete Powerup.puList[index];
		}
	}

	//Returns the bulletList
	static getPuList(){
		return Powerup.puList;
	}
}

//Class for user-created and boss-created projectiles
class Bullet{
	//Tracks each instance of the bullet class
	static bulletList = [];

	constructor(pX, pY, dX, dY, player){
		//Stores the width of the bullet object for drawing and collision purposes
		this.width = square/3.5;

		//Boolean for whether or not the bullet was created by the player (if false, created by final boss)
		//The player should only be hurt by bullets they didn't create
		this.player = player;

		//Scales all bullets to travel at the same speed
		let magnitude = ((dX ** 2) + (dY ** 2)) ** (1/2);
		let scale = 5 / magnitude;

		//Tracks bullet velocity
		this.dX = dX * scale;
		this.dY = dY * scale;

		//Tracks bullets current location
		this.x = pX + (square/2) - (this.width/2);
		this.y = pY + (square/2) - (this.width/2);

		//Adds this bullet to the static bulletList
		Bullet.bulletList.push(this);
	}

	//Deletes this instance of bullet
	//Used for collisions or if bullet moves off-screen
	remove(){
		let index = Bullet.bulletList.indexOf(this)
		if(index !== -1) {
			delete Bullet.bulletList[index];
		}
	}

	//Function to update bullet location, track collisions, and draw
	draw(){
		//Updates bullet location
		this.x += this.dX;
		this.y += this.dY;

		//Draws image on the canvas
		ctx.drawImage(bulletImg, this.x, this.y, this.width, this.width);

		//Removes bullet from the list if it exits game bounds/hits a wall
		if(
			(this.x - this.width < xBound) || 
			(this.x > canvas.width - xBound) ||
			(this.y - this.width < square) || 
			(this.y > yBound - this.width) || 
			getGrid(this.x, this.y) == 7
		){
			this.remove();
		}
	}

	//Returns the bulletList
	static getBulletList(){
		return Bullet.bulletList;
	}
}

//Class for non-boss enemies
class Orc{
	//Tracks each instance of the Orc class
	static orcList = [];

	constructor(start, pos){
		//Randomly determines the first image to begin with
		this.img = orc[Math.floor(Math.random()*2)];
		//Determines how the orc will go around obstacles
		this.around = [-0.25, 0.25][Math.floor(Math.random() * 2)];
		//Sets speed based on the current level (increasing difficulty)
		this.speed = 1 + (level * 0.05);

		//Determines orc starting location on the canvas
		//Top
		if(start == 0){
			this.x = xBound + (square * 7) + (square * pos);
			this.y = square + 5;
		}
		//Left
		else if(start == 1){
			this.x = xBound + 5;
			this.y = (square * 8) + (square * pos);
		}
		//Bottom
		else if(start == 2){
			this.x = xBound + (square * 7) + (square * pos);
			this.y = yBound - (square + 7);
		}
		//Right
		else{
			this.x = canvas.width - (xBound + square + 5);
			this.y = (square * 8) + (square * pos);
		}
		
		//Adds this instance of orc to the static orcList
		Orc.orcList.push(this);
	}

	//Deletes this instance of orc (bullet collisions)
	remove(){
		let index = Orc.orcList.indexOf(this);
		if(index !== -1) {
			delete Orc.orcList[index];
		}
	}

	//Returns the static orcList
	static getOrcList(){
		return Orc.orcList;
	}

	//Determines how the orc will move
	route(){
		//Calculates distance from orc to player
		//Player below orc
		let below = pY - (this.y + square);
		//Player above orc
		let above = this.y - (pY + square);
		//Player to left of orc
		let left = this.x - (pX + square);
		//Player to right of orc
		let right = pX - (this.x + square);

		// Checks for obstacles
		// If wall in direction, direction's value becomes -1
		//Moving right
		if(this.x > xBound + (square * 16) || obstacles.includes(getGrid(this.x + square, this.y + (square/2)))){
			left = -1;
			this.x -= this.speed;
			this.y += this.around;
		}
		//Moving left
		if(this.x < xBound || obstacles.includes(getGrid(this.x, this.y + (square/2)))){
			right = -1;
			this.x += this.speed;
			this.y += this.around;
		}
		//Moving down
		if(this.y > yBound || obstacles.includes(getGrid(this.x + (square/2), this.y + square))){
			below = -1;
			this.x += this.around;
			this.y -= this.speed;
		}
		//Moving up
		if(this.y < square || obstacles.includes(getGrid(this.x + (square/2), this.y))){
			above = -1;
			this.x += this.around;
			this.y += this.speed;
		}

		//Chooses the maximum distance to shorten total distance with player
		let dir = Math.max(below, above, left, right);

		//Moves down if player is below the orc
		if(dir == below){
			this.y += this.speed;
		}
		//Moves up if player is above the orc
		else if(dir == above){
			this.y -= this.speed;
		}
		//Moves left if the player is to the left
		else if(dir == left){
			this.x -= this.speed;
		}
		//Moves right if the player is to the right
		else if(dir == right){
			this.x += this.speed;
		}
	}

	//Updates the orc location, checks collisions, and draws the orc on the canvas
	draw(){
		//Calls route to determine how the orc will move
		this.route();

		//Bullet collisions
		Bullet.getBulletList().forEach(bullet => {
			if(
				this.x - bullet.width < bullet.x && this.x + bullet.width + square > bullet.x && 
				this.y - bullet.width < bullet.y && this.y + bullet.width + square > bullet.y
			){
				//Removes the orc and the bullet instances
				this.remove();
				bullet.remove();
			}
		});

		//Updates orc image to create 'walking' illusion
		if(timer % 15 == 0){
			if(this.img == orc[0]){
				this.img = orc[1];
			}
			else{
				this.img = orc[0];
			}
		}

		//Draws the image on the canvas
		ctx.drawImage(this.img, this.x, this.y, square, square);
	}
}

//Event handler for keydown (determines if player has pressed a key)
function keyDownHandler(e){
	//Prevents scrolling on upkey, downkey, or space
	if((e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 40) && e.target == document.body) {
    e.preventDefault();
  }

	switch(e.keyCode){
		case 87: wKey = true; break;
		case 65: aKey = true; break;
		case 83: sKey = true; break;
		case 68: dKey = true; break;
		
		case 38: upKey = true; break;
		case 37: leftKey = true; break;
		case 40: downKey = true; break;
		case 39: rightKey = true; break;

		case 32: space = true; break;
	}
}

//Event handler for keyup (determines if player has released a key)
function keyUpHandler(e){
	switch(e.keyCode){
		case 87: wKey = false; break;
		case 65: aKey = false; break;
		case 83: sKey = false; break;
		case 68: dKey = false; break;

		case 38: upKey = false; break;
		case 37: leftKey = false; break;
		case 40: downKey = false; break;
		case 39: rightKey = false; break;

		case 32: space = false; break;
	}
}

//Uses promises to load the images
//This function is from my Prog7
function loadImage(src) {
	//Sets the source (all images stored in the images folder)
	src = "images/" + src + ".png";
	//Creates a promise with the image
  return new Promise(function(resolve, reject) {
    let img = new Image();
    img.src = src;

		//Promise resolves when the image loadss
    img.onload = () => resolve(img);
		//Promise rejects if image fails to load
    img.onerror = () => reject(new Error("Image load error for " + src));
  });
}

//Function to load all images
async function loadImages(images) {
  let promises = [];
	
	//Pushes all promises into an array of promises
  images.forEach(src => promises.push(loadImage(src)));

	//Groups promises together so they display simultaneously
  try {
    let loadedImages = await Promise.all(promises);
    return loadedImages;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//Canvas variables
let canvas=document.getElementById('canvas');
let ctx=canvas.getContext('2d');

//Image variables
let player = -1;
let pImg = -1;

let boots = -1;
let bImg = -1;

let controls = -1;

let terrain = -1;

let bulletImg = -1;

let orc = -1;

let lifeImg = -1;

let timeImg = -1;
let titleImg = -1;

let bossMsg = -1;
let bossImg = 0;
let boss = -1;

let end = -1;
let wave = -1;

let oneUp = -1;
let wagonWheel = -1;
let machineGun = -1;
let shotgun = -1;
let nuke = -1;
let coffee = -1;
let badge = -1;

$(document).ready(async function(){
	//Loads images on page load
	let images = await loadImages([
		"player_down", "player_left", "player_up", "player_right", "player",
		"boots0", "boots1", "boots2", "boots1",
		"controls", "bullet",
		"orc0", "orc1",
		"lives", "time", "title", "bossMsg",
		"boss0", "boss1", "boss2", "boss3", 
		"end", "wave",
		"wagon_wheel", "machineGun", "shotgun", "nuke", "coffee", "badge",
		"desert0", "desert1", "desert2", "desert3", "desert4", "cactus0", "cactus1", "barrel", "canyon0", "canyon1"
	]);

	//Sets player images/initial image
	player = images.slice(0, 5);
	pImg = player[4];

	//Sets boot images/initial image
	boots = images.slice(5, 9);
	bImg = 1;

	//Sets the controls image
	controls = images[9];

	//Sets the bullet image
	bulletImg = images[10];

	//Sets the orc images
	orc = [images[11], images[12]];

	//Sets life, time, and the title screen image
	lifeImg = images[13];
	timeImg = images[14];
	titleImg = images[15];

	//Sets boss images/"You'll Never Take Me Alive!!" message
	bossMsg = images[16];
	boss = images.slice(17, 21);

	//Sets end-screen images
	end = images[21];
	wave = images[22];

	//Sets the powerup images
	oneUp = lifeImg;
	wagonWheel = images[23];
	machineGun = images[24];
	shotgun = images[25];
	nuke = images[26];
	coffee = images[27];
	badge = images[28];
	
	//Sets terrain images
	terrain = images.slice(images.length-10, images.length);

	//Adds eventListeners for keydown and keyup
	document.addEventListener("keydown", keyDownHandler);
	document.addEventListener("keyup", keyUpHandler);

	//Calls the update function, which controls all game mechanics
	update();
});

//Stores the size of a grid square
let square = 28;

//Tracks the x-bound and y-bound of the game grid
let xBound = (canvas.width - (square * 16)) / 2;
let yBound = square * 17;

//Move control keybinds
let wKey = false;
let aKey = false;
let sKey = false;
let dKey = false;

//Shoot control keybinds
let upKey = false;
let leftKey = false;
let downKey = false;
let rightKey = false;

//Start control
let space = false;

//Initializes timer at -1 (game hasn't started)
let timer = -1;
//Initializes level at 0
let level = 0;

//Player is not moving from one level to another
let transition = false;

//Loads the audio for the game music and sets it to loop
let music = new Audio("audio/74. Journey Of The Prairie King (Overworld).mp3");
music.loop = true;

//Cactus variable exists to animate the cacti
//The value changes between 5 and 6 to use different images
let cactus = 5;
//Tracks the layout for each level
//0-1 are dirt and rocks
//2-4 are sand
//5-6 are cacti (obstacles)
//7 is walls (obstacles)
//8-9 are canyon squares (obstacles)
let levels = [
	[
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 2, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
		[0, 2, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5]
	],
	[
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 2, 4, 3, 3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 7, 7, 3, 3, 3, 3, 7, 7, 3, 3, 2, 5],
		[5, 2, 3, 4, 7, 3, 4, 3, 3, 4, 3, 7, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[0, 2, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[5, 2, 4, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 2, 5],
		[5, 2, 4, 3, 7, 3, 3, 3, 3, 3, 3, 7, 3, 3, 2, 5],
		[5, 2, 3, 3, 7, 7, 3, 4, 3, 3, 7, 7, 3, 3, 2, 5],
		[5, 2, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5]
	],
	[
		[5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 5, 5, 5, 5, 5, 5],
		[5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5],
		[5, 5, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5],
		[5, 2, 3, 3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 2, 5],
		[5, 2, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 2, 5],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 7, 4, 3, 3, 4, 3, 3, 3, 7, 3, 2, 0],
		[0, 2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 2, 0],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 2, 5],
		[5, 5, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 5, 5],
		[5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5],
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5]
	],
	[
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 3, 2, 5],
		[5, 2, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 5],
		[5, 2, 3, 3, 3, 7, 7, 7, 4, 7, 7, 7, 3, 3, 2, 5],
		[5, 2, 3, 3, 4, 7, 3, 3, 3, 3, 3, 7, 3, 3, 2, 5],
		[0, 2, 3, 3, 3, 7, 3, 3, 3, 3, 3, 7, 4, 3, 2, 1],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[1, 2, 3, 3, 3, 7, 3, 3, 3, 3, 3, 7, 4, 3, 2, 1],
		[5, 2, 3, 3, 3, 7, 3, 3, 3, 3, 3, 7, 3, 3, 2, 5],
		[5, 2, 3, 4, 3, 7, 7, 7, 3, 7, 7, 7, 3, 3, 2, 5],
		[5, 2, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 2, 5],
		[5, 2, 3, 3, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 2, 5],
		[5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5],
		[5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 5, 5, 5, 5, 5]
	],
	[
		[0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0],
		[1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
		[1, 2, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
		[0, 2, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 2, 0],
		[1, 2, 3, 3, 3, 3, 3, 3, 7, 4, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 5, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
		[8, 9, 8, 9, 8, 9, 8, 9, 8, 9, 8, 9, 8, 9, 8, 9],
		[1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0],
		[0, 2, 3, 3, 3, 4, 3, 7, 7, 7, 4, 4, 3, 3, 2, 1],
		[0, 2, 4, 4, 4, 3, 3, 3, 4, 3, 3, 3, 3, 3, 2, 0],
		[1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
		[1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1]
	],
]

//Player variables
//Location
let pX = (canvas.width - square) / 2;
let pY = yBound / 2;

//Player lives
let lives = 3;

//Sets the grid to the current level
let grid = levels[0];

//Tracks all possible obstacles
let obstacles = [5, 6, 7, 8, 9];

//Cooldown before more enemies appear
let enemyTimer = 150;

//Cooldown before powerups appear
let puTimer = Math.floor(Math.random() * 200) + 300;

//Adjusts how much time until level completion (higher weight = less time)
let levelTime = 0.12;

//Final Boss Variables
let bossHP = 30;
//MaxHP for drawing healthbar across bottom of the screen
let bossMaxHP = 30;
let bossAction = 0;
let bossX = xBound + (square * 8);
let bossY = yBound - (square * 3);
let bossSpeed = 1.5;

//Resets on game start/when player loses a life
function reset(){
	Orc.orcList = [];
	Bullet.bulletList = [];
	Powerup.puList = [];
	if(level != 4){
		pX = xBound + (square * 8);
		pY = yBound / 2;
	}
	else{
		pX = xBound + (square * 8);
		pY = square * 3
	}
	
	enemyTimer = timer + 150;
	puTimer = timer + (Math.floor(Math.random() * 200) + 300);
}

//Gets the grid location of the entity for collision-tracking
function getGrid(x, y){
	if(y >= square && y <= yBound - square && x > xBound && x < xBound + (square * 16)){
		return(grid[parseInt((y-square) / square)][parseInt((x - xBound) / square)]);
	}
	else{
		return 5;
	}
}

//Animates the boss as he moves by swapping his image
function animateBoss(){
	if(timer % 10 == 0){
		if(bossImg == 2){
			bossImg = 3;
		}
		else{
			bossImg = 2;
		}
	}
}

//Draws all active images on the canvas
function draw() {
	//Clears the canvas by filling it with a black rectangle
	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();

	//Draw Time Icon
	ctx.drawImage(timeImg, xBound, 0, square-3, square);

	//Draw Lives
	ctx.beginPath();
	//Life icon
	ctx.drawImage(lifeImg, xBound - (square * 2), square * 1.5, square, square);
	ctx.font = "15px Pixelify Sans";
	ctx.fillStyle = "white";
	//Text for number of lives
	ctx.fillText("x" + lives.toString(), xBound - (square), square * 2.15, square);
	ctx.closePath();

	//Draws the game only if player has begun playing and boss has not been defeated
	if(timer >= 0 && bossHP > 0){
		//Draw terrain using grid variable
		for(let i = 0; i < 16; i++){
			for(let j = 0; j < 16; j++){
				ctx.drawImage(terrain[grid[j][i]], xBound + (i * square), square + (j * square), square, square);
			}
		}

		//Draw Player Boots
		if(wKey || aKey || sKey || dKey){
			ctx.drawImage(boots[bImg], pX, pY + square - 5, square, (square) * (1/5));
		}

		//Draw enemies
		Orc.getOrcList().forEach(orc => {
			orc.draw();
		});

		//Draw bullets
		Bullet.getBulletList().forEach(bullet => {
			bullet.draw();
		});

		//Draw powerups
		Powerup.getPuList().forEach(pu => {
			pu.draw();
		});

		//Draw Level Time
		if(timer * levelTime < square * 15 && level != 4){
			ctx.beginPath();
			ctx.fillStyle = "#95a522";
			ctx.fillRect(xBound + square, square * .5, (square * 15) - (timer * levelTime), square/4);
			ctx.closePath();
		}

		//Draws transition text between levels
		if(timer * levelTime >= square * 15 && level < 4 && !transition){
			ctx.beginPath();
			ctx.font = "60px Pixelify Sans";
			ctx.fillStyle = "white";
			ctx.fillText("Level Clear!", xBound + (square * 2), square * 9);
			ctx.closePath();
		}

		//Draw Player
		ctx.drawImage(pImg, pX, pY, square, square);

		//Draw Final Boss if final level
		if(level == 4){
			//BossMessage
			if(timer <= 200){
				ctx.drawImage(bossMsg, bossX-square, bossY-square*3, square*3, square*3);
			}
			if(timer > 200 & !transition && bossHP >= 0){
				ctx.beginPath();
				ctx.fillStyle = "#8e2437";
				ctx.fillRect(xBound, yBound+5, square * bossHP * (16 / bossMaxHP), square/4);
				ctx.closePath();
			}
			ctx.drawImage(boss[bossImg], bossX, bossY, square, square);
		}
	}
	//Game has not started/has ended
	else{
		//Start/Restart Screen
		if(bossHP > 0){
			ctx.drawImage(titleImg, xBound + (square * 3), square * 4, square*10, square*8);
		}
		//End Screen
		else{
			ctx.drawImage(end, xBound, square * 1, square*16, square*12);
			ctx.drawImage(wave, xBound + (square * 8), yBound - (square * 5), square * 4, square * 4);
		}
	}

	//Draw Controls
	ctx.drawImage(controls, (canvas.width-180)/2, yBound+15, 180, 95);
}

//Controls game mechanics
function update(){
	//Starts the game when the player presses space
	if(timer < 0 && space){
		timer = 0;
		
		music.pause();
		music = new Audio("audio/75. Journey Of The Prairie King (The Outlaw).mp3");
		music.loop = true;
		music.play();
	}

	//Resets the game if the player loses all lives
	if(lives < 0){
		level = 0;
		timer = -1;
		lives = 3;
	}

	//Game mechanics active if game has begun and boss not defeated
	if(timer >= 0 && bossHP > 0){
		//Sets the grid to the current level
		grid = levels[level];

		//Animates cacti every 60 iterations of the update function
		//The animation occurs by swapping the images
		if(timer % 60 == 0){
			if(cactus == 5){
				let temp = terrain[5];
				terrain[5] = terrain[6];
				terrain[6] = temp;

				cactus = 6;
			}
			else{
				let temp = terrain[5];
				terrain[5] = terrain[6];
				terrain[6] = temp;

				cactus = 5;
			}
		}

		//Tracks if orc collides with player
		Orc.getOrcList().forEach(orc => {
			if(
					pX - square < orc.x && pX + (square) > orc.x && 
					pY - square < orc.y && pY + (square) > orc.y
				){
					//Removes a life, decrements timer to prevent another enemy from instantly spawning
					lives -= 1;
					timer -= 150;
					reset();
				}
		});

		//Powerup Spawning
		if(timer == puTimer && level < 4){
			let pu = new Powerup(timer, false);
			puTimer = (Math.floor(Math.random() * 200) + 300) + timer;
		}

		//Powerup Collisions
		Powerup.getPuList().forEach(pu => {
			if(
					pX - square < pu.x && pX + (square) > pu.x && 
					pY - square < pu.y && pY + (square) > pu.y
				){
					if(pu.type == "oneUp"){
						//Adds a life, removes powerup
						lives += 1;
						pu.remove();
					}
					else if(pu.type == "nuke"){
						//Clears all enemies
						Orc.orcList = [];
						pu.remove();
					}
					else{
						pu.time = timer + 400;
						pu.active = true;
					}
				}
		});

		//Player Speed
		let pSpeed = 2;

		//Shoot controls
		let bX = 0;
		let bY = 0;

		let bSpeed = 5;
		let bTime = 20;

		let sg = false;
		let ww = false;

		Powerup.getPuList().forEach(pu => {
			if(pu.active){
				if(pu.type == "shotgun"){
					sg = true;
				}
				if(pu.type == "machineGun"){
					bTime = 7;
				}
				if(pu.type == "wagonWheel"){
					ww = true;
				}
				if(pu.type == "badge"){
					sg = true;
					bTime = 7;
					ww = true;
				}
				if(pu.type == "coffee"){
					pSpeed = 3;
				}
			}
		});

		//Sets bullet velocity depending on which keys are pressed
		if(upKey){
			bY -= bSpeed;
		}
		if(leftKey){
			bX -= bSpeed;
		}
		if(downKey){
			bY += bSpeed;
		}
		if(rightKey){
			bX += bSpeed;
		}

		//If bullet should move, a new bullet is created
		if((bX != 0 || bY != 0) && timer % bTime == 0){
			let bullet = new Bullet(pX, pY, bX, bY, true);

			if(sg){
				//Shotgun Extra Bullets
				if(bX == 0){
					bX += bSpeed / 2;
					bullet = new Bullet(pX, pY, bX, bY, true);
					bullet = new Bullet(pX, pY, -bX, bY, true);
				}
				else if(bY == 0){
					bY += bSpeed / 2;
					bullet = new Bullet(pX, pY, bX, bY, true);
					bullet = new Bullet(pX, pY, bX, -bY, true);
				}
				else{
					bullet = new Bullet(pX, pY, bX, bY / 2, true);
					bullet = new Bullet(pX, pY, bX / 2, bY, true);
				}
			}
			if(ww){
				//Wagon Wheel Extra Bullets
				bullet = new Bullet(pX, pY, bSpeed, 0); //Right
				bullet = new Bullet(pX, pY, -bSpeed, 0); //Left
				bullet = new Bullet(pX, pY, 0, -bSpeed); //Up
				bullet = new Bullet(pX, pY, 0, bSpeed); //Down
				bullet = new Bullet(pX, pY, -bSpeed, -bSpeed); //NW
				bullet = new Bullet(pX, pY, bSpeed, -bSpeed); //NE
				bullet = new Bullet(pX, pY, -bSpeed, bSpeed); //SW
				bullet = new Bullet(pX, pY, bSpeed, bSpeed); //SE
			}
		}

		//Move controls
		//Down
		if(sKey && pY < (yBound - square) && !obstacles.includes(getGrid(pX + (square/2), pY + square))){
			pImg = player[0];
			pY += pSpeed;
		}
		//Up
		if(wKey && pY > square && !obstacles.includes(getGrid(pX + (square/2), pY))){
			pImg = player[2];
			pY -= pSpeed;
		}
		//Left
		if(aKey && pX > xBound && !obstacles.includes(getGrid(pX, pY + (square/2)))){
			pImg = player[1];
			pX -= pSpeed;
		}
		//Right
		if(dKey && pX < canvas.width - square - xBound && !obstacles.includes(getGrid(pX+square, pY+(square/2)))){
			pImg = player[3];
			pX += pSpeed;
		}
		//Stationary
		if(!sKey && !wKey && !aKey && !dKey){
			pImg = player[4];
		}
		//Player boots moving
		else{
			if(timer % 10 == 0){
				bImg += 1;
				if(bImg >= 4){
					bImg = 0;
				}
			}
		}

		//Enemy spawning
		if(timer == enemyTimer && level < 4 && timer * levelTime < square * 15){
			let start = Math.floor(Math.random()*4);
			for(let pos = 0; pos < Math.floor(Math.random()*3)+1; pos++){
				let orc = new Orc(start, pos);
			}
			
			//Sets the new time an enemy will appear
			enemyTimer = (Math.floor(Math.random() * (100 - (5 * level)))) + timer + 50;
		}
		
		//Next level transition
		if(timer * levelTime >= square * 15 && level < 4){
			//Temporarily removes player controls
			document.removeEventListener("keydown", keyDownHandler);
			document.removeEventListener("keyup", keyUpHandler);

			//Clears all enemies
			Orc.orcList = [];

			//Clears all powerups
			Powerup.puList = [];
			
			//Sets player to move to the opening at the bottom of the screen
			dKey = (pX < xBound + (square * 8));
			aKey = (pX > xBound + (square * 8));
			//Player cannot move upward
			wKey = false;
			//Player moves until they have reached the bottom of the grid
			sKey = ((!transition && pY < yBound) || (transition && pY < yBound / 2));

			upKey = false;
			leftKey = false;
			downKey = false;
			rightKey = false;

			//Removes all obstacles so the player can exit the current grid
			obstacles = [];

			//When the player reaches the bottom, increases the level and moves the player to the top
			if(!transition && pY >= yBound - (square * 1.2)){
				level += 1;
				pY = square;

				//When player has moved to the bottom, player has transitioned to the next level
				transition = true;
			}
			//Player has moved to the next level
			if(transition && pY == yBound / 2){	
				transition = false;

				dKey = false;
				aKey = false;
				sKey = false;

				//Resets obstacles
				obstacles = [5, 6, 7, 8, 9];

				//Resets timer and player location
				timer = 0;
				reset();
				
				//Adds key handlers back in, player now has control
				document.addEventListener("keydown", keyDownHandler);
				document.addEventListener("keyup", keyUpHandler);
			}			
		}
		//Final Boss Logic
		if(level == 4){
			if(transition && pY == square * 7.5){
				//Sets new final boss music
				music.pause();
				music = new Audio("audio/75. Journey Of The Prairie King (The Outlaw).mp3");
				music.loop = true;
				music.play();

				//Player has transitioned to the next level
				sKey = false;
				dKey = false;
				aKey = false;
				transition = false;
				obstacles = [5, 6, 7, 8, 9];

				//Resets timer and enemy timer
				timer = 0;
				enemyTimer = 200;
				
				document.addEventListener("keydown", keyDownHandler);
				document.addEventListener("keyup", keyUpHandler);
			}
			//Final boss attacks
			if(timer >= 200 && bossHP > 0){
				//Bullet collisions
				Bullet.getBulletList().forEach(bullet => {
					//Boss bullets hitting player
					if(
						pX - square < bullet.x && pX + (square) > bullet.x && 
						pY - square < bullet.y && pY + (square) > bullet.y &&
						!bullet.player
					){
						lives -= 1;
						timer -= 150;
						reset();
					}
					//Player bullets hitting boss
					if(
						bossX - square + 15 < bullet.x && bossX + (square) - 5 > bullet.x && 
						bossY - square < bullet.y && bossY + (square) > bullet.y &&
						bullet.player
					){
						bossHP -= 1;
						bullet.remove();
					}
				});
				//Sets new boss behavior on next enemyTimer
				if(timer == enemyTimer){
					bossAction = Math.floor(Math.random() * 4);
					enemyTimer = (Math.floor(Math.random() * (100 - (10 * level)))) + timer + 50;
					
				}
				//If action is 1 or 3, move to player location and shoot
				if(bossAction % 2 != 0){
					if(bossX > pX - 5){
						bossX -= bossSpeed;
						animateBoss();
					}
					else if(bossX < pX + square + 5){
						bossX += bossSpeed;
						animateBoss();
					}
					if(timer % 20 == 0){
						let bullet = new Bullet(bossX, bossY, 0, -5, false);
					}
				}
				//If action is 2, hide behind wall
				else if(bossAction == 2){
					if(bossX > xBound + (square * 7)){
						bossX -= bossSpeed;
						animateBoss();
					}
					else if(bossX < xBound + (square * 9)){
						bossX += bossSpeed;
						animateBoss();
					}
					else{
						bossImg = 0;
					}
				}
				//Otherwise, stay where boss is
				else{
					bossImg = 0;
				}
			}
		}

		//Increments timer
		timer += 1;
		console.log(timer, puTimer);
	}
	
	//If boss defeated, stop looping music
	if(bossHP <= 0){
		music.loop = false;
	}

	//Draw the game
	draw();
	//Animate the update function
	requestAnimationFrame(update);
}