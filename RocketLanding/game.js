import {
  addGlobalFunction,
  resources,
  updateCanvasSize,
  loadScene,
  init,
} from "../turbolib/src/turbolib.js";
import { GameObject } from "../turbolib/src/Utils/GameObject.js";
import { FollowerCamera } from "../turbolib/src/Camera/FollowerCamera.js";
import { config } from "../turbolib/src/Config.js";
import { KeyManager } from "../turbolib/src/index.js";
import { Scene } from "../turbolib/src/Utils/Scene.js";

config.path = "./";
config.canvas.background_color = "#dff";
init();

setTimeout(() => {
  const velocityXDiv = document.getElementById("velocity_x");
  const velocityYDiv = document.getElementById("velocity_y");
  const rocketAltitudeDiv = document.getElementById("rocket_altitude");
  const angleDiv = document.getElementById("angle");
  const windDiv = document.getElementById("wind");
  const rocketimgDiv = document.getElementById("rocketimg");
  const winpanelDiv = document.getElementById("win_panel");

  let wind = getRandomFloat(-2, 2);

  class GameScene extends Scene {
    build() {
      GameObject.create(
        "Rocket",
        getRandomFloat(-500, 500),
        getRandomFloat(-2000, -10000),
        40,
        200
      );
      GameObject.find("Rocket").setColor("#000");
      GameObject.find("Rocket").addPhysics();
      GameObject.find("Rocket").getPhysics().solidFriction = 0.2;
      GameObject.find("Rocket").setImage("Rocket");

      GameObject.create("ShipPointer", 0, 0, 25, 25);
      GameObject.find("ShipPointer").rotationZ = 45;
      GameObject.find("ShipPointer").setColor("#C00");
      GameObject.find("ShipPointer").isAbstract = true;
      GameObject.find("ShipPointer").isInteractive = false;

      GameObject.create("ShipPointerAngle", 0, 0, 3, 30);
      GameObject.find("ShipPointerAngle").setColor("#C00");
      GameObject.find("ShipPointerAngle").isAbstract = true;
      GameObject.find("ShipPointerAngle").isInteractive = false;

      GameObject.create("Ocean", 0, 740, 100000, 1200);
      GameObject.find("Ocean").color = "#064273";
      GameObject.find("Ocean").isAbstract = true;
      GameObject.find("Ocean").isInteractive = false;

      GameObject.create("Ship", 0, 95, 600, 150);
      GameObject.find("Ship").setImage("Ship");
      GameObject.find("Ship").isAbstract = true;
      GameObject.find("Ship").isInteractive = false;
      GameObject.create("LandArea", 65, 110, 395, 20);
      GameObject.find("LandArea").color = "#0000";

      this.setMainCamera(new FollowerCamera(GameObject.find("Rocket")));
      this.getMainCamera().offset.update(0, 0);
      this.getMainCamera().zoom = 0.4;
    }
  }

  loadScene(new GameScene());

  updateCanvasSize();

  setInterval(() => {
    game();
  }, 10);

  function game() {
    if (GameObject.find("Rocket").position.y > 100) {
      resetGame();
    }
    if (GameObject.find("Rocket").checkTrigger(0, 0, 0, 110).length > 0) {
      if (
        GameObject.find("Rocket").getPhysics().velocity.y > 3 ||
        GameObject.find("Rocket").rotationZ < -5 || GameObject.find("Rocket").rotationZ > 5
      ) {
        resetGame();
      } else {
        winpanelDiv.style.opacity = 1;
      }
    }

    GameObject.find("Rocket").getPhysics().velocity.x += wind * 0.01;
    GameObject.find("Rocket").rotationZ +=
      GameObject.find("Rocket").rotationZ * 0.001;
    GameObject.find("ShipPointer").position.y = Math.min(
      GameObject.find("Rocket").position.y + 500,
      GameObject.find("Ship").position.y
    );
    GameObject.find("ShipPointer").position.x =
      GameObject.find("Ship").position.x + 50;

    const rocketShipAngle = Math.atan2(
      GameObject.find("Rocket").position.y - GameObject.find("Ship").position.y,
      GameObject.find("Rocket").position.x - GameObject.find("Ship").position.x
    );

    GameObject.find("ShipPointerAngle").position.x =
      GameObject.find("Rocket").position.x -
      5 * Math.cos(rocketShipAngle) * (180 / Math.PI);
    GameObject.find("ShipPointerAngle").position.y =
      GameObject.find("Rocket").position.y -
      5 * Math.sin(rocketShipAngle) * (180 / Math.PI);
    GameObject.find("ShipPointerAngle").rotationZ =
      rocketShipAngle * (180 / Math.PI) + 90;

    rocketimgDiv.style.bottom =
      (GameObject.find("Rocket").position.y - 200) * -0.05 + "px";

    if (KeyManager.KeyW) {
      GameObject.find("Rocket")
        .getPhysics()
        .velocity.add(
          GameObject.find("Rocket").up().x * 0.2,
          GameObject.find("Rocket").up().y * 0.2
        );
    }
    if (KeyManager.KeyA) {
      GameObject.find("Rocket").rotationZ -= 0.25;
    }
    if (KeyManager.KeyD) {
      GameObject.find("Rocket").rotationZ += 0.25;
    }

    updateParameters();
  }
  document.addEventListener("keydown", (e) => {
    if (e.code == "KeyR") {
      resetGame();
    }
  });

  function resetGame() {
    loadScene(new GameScene());
    winpanelDiv.style.opacity = 0;
  }

  function updateParameters() {
    velocityXDiv.innerHTML =
      GameObject.find("Rocket").getPhysics().velocity.x.toFixed(2) + " m/s";
    velocityYDiv.innerHTML =
      GameObject.find("Rocket").getPhysics().velocity.y.toFixed(2) + " m/s";
    rocketAltitudeDiv.innerHTML =
      (GameObject.find("Rocket").position.y * -0.01).toFixed(2) + " m";
    windDiv.innerHTML = wind.toFixed(2) + " m/s";
    angleDiv.innerHTML = Math.floor(GameObject.find("Rocket").rotationZ) + "°";
  }

  function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
}, 1000);
