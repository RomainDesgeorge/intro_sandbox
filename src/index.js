import Phaser from "phaser";
import "./styles.css";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var groupe_plateformes;
var player; // désigne le sprite du joueur
var clavier;
var groupe_etoiles;
var score = 0;
var zone_texte_score;
var groupe_bombes;
var gameOver = false;

function preload() {
  this.load.image("img_ciel", "src/assets/sunset.png");
  this.load.image("img_plateforme", "src/assets/platform.png");
  this.load.spritesheet("img_perso", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("img_etoile", "src/assets/index(1).png");
}
function create() {
  this.add.image(400, 300, "img_ciel");

  groupe_plateformes = this.physics.add.staticGroup();
  groupe_plateformes.create(200, 584, "img_plateforme");
  groupe_plateformes.create(600, 584, "img_plateforme");
  groupe_plateformes.create(50, 300, "img_plateforme");
  groupe_plateformes.create(600, 450, "img_plateforme");
  groupe_plateformes.create(750, 270, "img_plateforme");
  player = this.physics.add.sprite(100, 450, "img_perso");
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, groupe_plateformes);
  player.setBounce(0.2);
  clavier = this.input.keyboard.createCursorKeys();
  this.anims.create({
    key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  });
  this.anims.create({
    key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  });
  this.anims.create({
    key: "anim_face",
    frames: [{ key: "img_perso", frame: 4 }],
    frameRate: 20
  });
  groupe_etoiles = this.physics.add.group();
  for (var i = 0; i < 10; i++) {
    var coordX = 70 + 70 * i;
    groupe_etoiles.create(coordX, 10, "img_etoile");
  }
  this.physics.add.collider(groupe_etoiles, groupe_plateformes);
  groupe_etoiles.children.iterate(function iterateur(etoile_i) {
    // On tire un coefficient aléatoire de rerebond : valeur entre 0.4 et 0.8
    var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
    etoile_i.setBounceY(coef_rebond); // on attribut le coefficient de rebond à l'étoile etoile_i
  });
  zone_texte_score = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000"
  });
  groupe_bombes = this.physics.add.group();
  this.physics.add.collider(groupe_bombes, groupe_plateformes);
  this.physics.add.collider(player, groupe_bombes, chocAvecBombe, null, this);
}
function update() {
  if (clavier.right.isDown == true) {
    player.setVelocityX(160);
  }
  if (clavier.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("anim_tourne_droite", true);
  } else if (clavier.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("anim_tourne_gauche", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("anim_face");
  }
  if (clavier.space.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
  this.physics.add.overlap(player, groupe_etoiles, ramasserEtoile, null, this);
  if (gameOver) {
    return;
  }
}
function ramasserEtoile(player, une_etoile) {
  // on désactive le "corps physique" de l'étoile mais aussi sa texture
  // l'étoile existe alors sans exister : elle est invisible et ne peut plus intéragir
  une_etoile.disableBody(true, true);

  score += 10;
  zone_texte_score.setText("Score: " + score);
  if (groupe_etoiles.countActive(true) === 0) {
    // si ce nombre est égal à 0 : on va réactiver toutes les étoiles désactivées
    // pour chaque étoile etoile_i du groupe, on réacttive etoile_i avec la méthode enableBody
    // ceci s'ecrit bizarrement : avec un itérateur sur les enfants (children) du groupe (equivalent du for)
    var x;
    if (player.x < 400) {
      x = Phaser.Math.Between(400, 800);
    } else {
      x = Phaser.Math.Between(0, 400);
    }

    var une_bombe = groupe_bombes.create(x, 16, "img_bombe");
    une_bombe.setBounce(1);
    une_bombe.setCollideWorldBounds(true);
    une_bombe.setVelocity(Phaser.Math.Between(-200, 200), 20);
    une_bombe.allowGravity = false;
    groupe_etoiles.children.iterate(function iterateur(etoile_i) {
      etoile_i.enableBody(true, etoile_i.x, 0, true, true);
    });
  }
}
function chocAvecBombe(un_player, une_bombe) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("anim_face");
  gameOver = true;
}
