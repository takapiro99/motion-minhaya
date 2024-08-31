import { FC, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import { GameResult } from "./GameResult";
import useSound from "use-sound";
import MainBGM from "../../../public/music/topPageAndStartGameResult.mp3?url";
import ParticleSettings from "../../../public/particles.json?url";
import { TopPagePreview } from "../createQuiz/TopPagePreview";
import { Canvas } from "@react-three/fiber";

// type GameFinishedProps = {}

export const GameFinished: FC = () => {
  const { updateClientStatus } = useContext(SocketContext);
  const navigate = useNavigate();

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
    <>
      {/* <GameResult /> */}
      {/* <div>ゲーム終了！！！</div>
      {/* <ul>
        <li>たろう: 100 点</li>
        <li>じろう: 100 点</li>
        <li>さぶろう: 100 点</li>
        <li>しろう: 100 点</li>
      </ul> */}
      {/* <GameResult /> */}
      {/* <Button
        onClick={() => {
          updateClientStatus("OUT_OF_GAME")
          navigate("/")
        }}
      >
        TopPage に戻る
      </Button> */}
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
          <div
            style={{
              color: "snow",
              width: "100%",
              textAlign: "center",
              fontSize: "4rem",
            }}
          >
            最終結果
          </div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div style={{ width: "100%" }}>
            <GameResult />
          </div>
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
                updateClientStatus("OUT_OF_GAME");
                navigate("/");
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
              ホームに戻る
            </Button>
          </div>
        </div>
        <div
          style={{
            // border: "2px solid green",
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
    </>
  );
};
