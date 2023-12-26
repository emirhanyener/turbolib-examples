import {
  addGlobalFunction,
  resources,
  updateCanvasSize,
  loadScene,
  config,
  init,
  GameObject,
  Vector,
  Camera,
  FollowerCamera,
  UILine,
  UIText,
  UIBox,
  ObjectFunction,
  Function,
  KeyManager,
  Scene,
} from "../turbolib/src/index.js";

config.images_path = "https://emirhanyener.github.io/turbolib-examples/archer/images/";
config.canvas.background = "Background";
config.canvas.width = window.innerWidth;
config.canvas.height = window.innerHeight;
updateCanvasSize();
init();

setTimeout(() => {
  class Arrow extends GameObject {
    constructor() {
      super("Arrow", new Vector(0, 0), new Vector(100, 25));
      this.addPhysics();
      this.isInteractive = false;
      this.active = false;
      this.setImage("Arrow");
    }
  }

  //Object Pool
  class ArrowObjectPool {
    //Constructor(create objects)
    constructor(poolSize, objectInstance) {
      this.index = 0;
      this.objects = [];
      for (let i = 0; i < poolSize; i++) {
        this.objects.push(objectInstance.clone());
        this.objects[i].name += i;
      }
    }

    //Get next object in object pool
    getObject() {
      let temp = this.objects[this.index];
      temp.active = true;
      this.index++;
      if (this.index > this.objects.length - 1) {
        this.index = 0;
      }
      return temp;
    }
  }

  class Bow {
    constructor(x, y, arrowCount, delay) {
      //Game init
      this.angle = 0;
      this.power = 0;
      this.delay = delay;
      this.clickDelay = true;
      this._arrow;

      //Create arrow instance and object pool
      this.arrowPool = new ArrowObjectPool(arrowCount, new Arrow());

      //Create bow object
      this.bowGameObject = GameObject.create("BowObject", x, y, 150, 150);
      this.bowGameObject.isInteractive = false;
      this.bowGameObject.setImage("Bow1");
    }

    getPosition() {
      return this.bowGameObject.position;
    }
    setAngle(angle) {
      this.angle = angle;
      this.bowGameObject.rotationZ = angle * (180 / Math.PI);
    }
    setPower(power) {
      this.power = power;
      this.bowGameObject.setImage(
        "Bow" + Math.min(Math.floor(power / 100) + 1, 7)
      );
    }

    release() {
      //Release bow
      if (this.clickDelay) {
        //Get arrow from object pool(reuse)
        this.releaseArrow();
        this.clickDelay = false;
        setTimeout(() => {
          this.clickDelay = true;
        }, this.delay);
      }
    }

    releaseArrow() {
      this._arrow = this.arrowPool.getObject();
      this._arrow.position.update(
        this.bowGameObject.position.x,
        this.bowGameObject.position.y
      );
      this._arrow
        .getPhysics()
        .velocity.update(
          Math.cos(this.angle) * (this.power / 25),
          Math.sin(this.angle) * (this.power / 25)
        );
    }
  }

  const score_text = document.getElementById("score_text");
  let score = 0;
  const bow = new Bow(100, window.innerHeight / 2 - 50, 50, 250);

  const apple = GameObject.create("Apple", 500, 200, 51, 54);
  apple.setImage("Apple");

  const arrowLine = new UILine("ArrowLine", new Vector(0, 0));
  arrowLine.color = "#00FF00";
  arrowLine.gameWorld = true;
  resources.scene.addUI(arrowLine);

  //Main function
  function game() {
    //Calculate angle and power
    bow.setAngle(
      Math.atan2(
        resources.getMousePosition().y - bow.getPosition().y,
        resources.getMousePosition().x - bow.getPosition().x
      )
    );
    bow.setPower(
      Math.sqrt(
        Math.pow(resources.getMousePosition().y - bow.getPosition().y, 2) +
          Math.pow(resources.getMousePosition().x - bow.getPosition().x, 2)
      )
    );

    if (resources.mouse.isPointerDown) {
      bow.release();
    }

    //Arrow head rotation calculation
    bow.arrowPool.objects.forEach((arrowItem) => {
      arrowItem.rotationZ =
        Math.atan2(
          arrowItem.getPhysics().velocity.y,
          arrowItem.getPhysics().velocity.x
        ) *
        (180 / Math.PI);
      if (arrowItem.active) {
        //Formula
        //Math.cos(bow._arrow.rotationZ * (Math.PI / 180)) * 40, Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 40 + 10, Math.cos(bow._arrow.rotationZ * (Math.PI / 180)) * 70, Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 70 + 10
        arrowForward(
          arrowItem.checkTrigger(
            0,
            Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 40 + 10,
            Math.cos(bow._arrow.rotationZ * (Math.PI / 180)) * 100,
            Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 100 + 10
          )
        );
        arrowForward(
          arrowItem.checkTrigger(
            0,
            Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 40 - 10,
            Math.cos(bow._arrow.rotationZ * (Math.PI / 180)) * 100,
            Math.sin(bow._arrow.rotationZ * (Math.PI / 180)) * 100 - 10
          )
        );
      }
    });
  }

  //Arrow apple trigger control function
  function arrowForward(trigger) {
    if (trigger.length > 0) {
      trigger[0].position.x = 150 + Math.random() * (window.innerWidth - 250);
      trigger[0].position.y = 50 + Math.random() * (window.innerHeight - 50);
      updateScore();
    }
  }

  //Update score text
  function updateScore() {
    score++;
    score_text.innerHTML = score;
  }

  //Game interval
  setInterval(() => {
    game();
  }, 10);
}, 1000);
