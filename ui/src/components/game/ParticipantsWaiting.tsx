import { FC, useContext, useEffect, useLayoutEffect, useState } from "react";
import { SocketContext } from "../../SocketContext";
import ParticleSettings from "../../../public/particles.json?url";

// type ParticipantsWaitingProps = {}

export const ParticipantsWaiting: FC = () => {
  const { game } = useContext(SocketContext);

  useLayoutEffect(() => {
    /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
    // @ts-ignore
    window.particlesJS.load("particles-js", ParticleSettings, function () {
      console.log("callback - particles.js config loaded");
    });
  }, []);
  const [p, setP] = useState<number>(0);

  useEffect(() => {
    const sid = setInterval(() => {
      setP((p) => (p + 1) % 4);
    }, 500);
    return () => clearInterval(sid);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        margin: "0 auto",
        background: "#111",
      }}
      id="particles-js"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, 0)",
          width: "80%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // margin: "0 auto",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          gap: "30px",
        }}
      >
        <div style={{ color: "snow", fontSize: "2rem", fontWeight: "bold" }}>
          対戦メンバーを募集中{".".repeat(p)}
          <span style={{ visibility: "hidden" }}>{".".repeat(3 - p)}</span>
        </div>
        <div style={{ color: "snow", fontSize: "1.6rem", marginTop: "0px" }}>
          ({game.participants?.length}/4)
        </div>
        <div>
          {game.participants?.map((participant) => {
            return <div>{participant.name}</div>;
          })}
        </div>
        <div style={{ width: "100%" }}>
          {game.participants?.map((participant, i) => {
            return (
              <div
                key={participant.clientId}
                style={{
                  background: getColorFromIndex(i),
                  width: "85%",
                  margin: "15px auto",
                  textAlign: "center",
                  borderRadius: "30px",
                  padding: "20px 0",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  userSelect: "none",
                }}
              >
                {participant.name}
              </div>
            );
          })}
        </div>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export const getColorFromIndex = (index: number) => {
  const colors = ["#C8B3F4", "#7DE390", "#5ACCFD", "#D7EC82"];
  return colors[index % colors.length];
};
