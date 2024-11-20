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

export const TopPage: FC = () => {
  const navigate = useNavigate();
  const { updateClientStatus } = useContext(SocketContext);
  const parentRef = useRef<HTMLDivElement>(null);
  const [play, {stop}] = useSound(MainBGM, { volume: 0.3, loop: true });
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
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        maxWidth: "680px",
        background: "#111",
      }}
      ref={parentRef}
      id="particles-js"
    >
      <div
        style={{
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
        }}
      >
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <img
          style={{
            position: "absolute",
            display: "inline-block",
            top: "5px",
            left: "5px",
            transform: "rotate(-8deg)",
            width: "80%",
            userSelect: "none",
          }}
          src={LogoImage}
          alt="logo"
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <Button
            onClick={() => {
              stop()
              updateClientStatus("NAME_INPUTING");
              navigate("/game");
            }}
            size="huge"
            style={{
              backgroundColor: "#A538EE",
              color: "white",
              borderRadius: "40px",
              border: "3px solid white",
              padding: "20px 30px",
              fontWeight: "normal",
              width: "73%",
            }}
          >
            みんなでクイズをとく
          </Button>
          <Button
            style={{
              backgroundColor: "white",
              color: "#A538EE",
              borderRadius: "40px",
              border: "2px solid #A538EE",
              padding: "10px 30px",
              fontWeight: "normal",
              width: "73%",
            }}
            onClick={() => {
              stop()
              window.location.href = "/create-quiz";
            }}
          >
            クイズをつくる
          </Button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "30dvh",
          left: 0,
          width: "100%",
          height: "68dvh",
          zIndex: "8",
          opacity: "0.8",
        }}
      >
        <Canvas
          style={{ background: "transparent" }}
          camera={{ position: [0, 2.8, 0.4] }}
        >
          <TopPagePreview />
        </Canvas>
      </div>
    </div>
  );
};
