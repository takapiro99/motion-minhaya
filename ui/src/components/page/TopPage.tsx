import { FC, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";
import { Canvas } from "@react-three/fiber";
import { TopPagePreview } from "../createQuiz/TopPagePreview";
import LogoImage from "../../../public/logo.png";
import ParticleSettings from "../../../public/particles.json?url";
import useSound from "use-sound";
import MainBGM from "../../../public/music/topPageAndStartGameResult.mp3?url";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  topPage: {
    position: "relative",
    height: "100dvh",
    width: "100%",
    maxWidth: "680px",
    background: "#111",
  },
  componentsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    justifyContent: "space-around",
    zIndex: 10,
  },
  logo: {
    position: "absolute",
    display: "inline-block",
    top: "5px",
    left: "5px",
    transform: "rotate(-8deg)",
    width: "80%",
    userSelect: "none",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
    zIndex: 100,
  },
  toGameButton: {
    backgroundColor: "#A538EE !important",
    color: "white !important",
    borderRadius: "40px !important",
    border: "3px solid white !important",
    padding: "20px 30px !important",
    fontWeight: "normal !important",
    width: "73% !important",
  },
  toCreateQuizButton: {
    backgroundColor: "white !important",
    color: "#A538EE !important",
    borderRadius: "40px !important",
    border: "2px solid #A538EE !important",
    padding: "10px 30px !important",
    fontWeight: "normal !important",
    width: "73% !important",
  },
  canvasContainer: {
    position: "absolute",
    top: "30dvh",
    left: 0,
    width: "100%",
    height: "68dvh",
    zIndex: "8",
    opacity: "0.8",
  },
  canvas: {
    background: "transparent",
  }
});

export const TopPage: FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { updateClientStatus } = useContext(SocketContext);
  const parentRef = useRef<HTMLDivElement>(null);
  const [play, {stop}] = useSound(MainBGM, { volume: 0, loop: true }); // MEMO: うるさいので一旦ミュートにしている
  useEffect(() => {
    play();
  }, [play]);

  useLayoutEffect(() => {
    /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
    // @ts-ignore
    window.particlesJS.load("particles-js", ParticleSettings, function () {
      console.log("callback - particles.js config loaded");
    });
  }, []);

  return (
    <div
      className={classes.topPage}
      ref={parentRef}
      id="particles-js"
    >
      <div className={classes.componentsContainer}>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <img
          className={classes.logo}
          src={LogoImage}
          alt="logo"
        />

        <div className={classes.buttonsContainer}>
          <Button
            onClick={() => {
              stop()
              updateClientStatus("NAME_INPUTING");
              navigate("/game");
            }}
            size="huge"
            className={classes.toGameButton}
          >
            みんなでクイズをとく
          </Button>
          <Button
            className={classes.toCreateQuizButton}
            onClick={() => {
              stop()
              navigate("/create-quiz")}
            }
          >
            クイズをつくる
          </Button>
        </div>
      </div>
      <div className={classes.canvasContainer}>
        <Canvas
          className={classes.canvas}
          camera={{ position: [0, 2.8, 0.4] }}
        >
          <TopPagePreview />
        </Canvas>
      </div>
    </div>
  );
};
