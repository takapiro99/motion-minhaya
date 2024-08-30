import { ChangeEvent, FC, useContext, useLayoutEffect } from "react";
import { Button, Input } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";
import ParticleSettings from "../../../public/particles.json?url";
// type NameInputingProps = {}

export const NameInputing: FC = () => {
  const { updateClientStatus, user, updateUser, enterWaitingRoom } =
    useContext(SocketContext);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateUser({
      ...user,
      name: event.target.value,
    });
  };

  const handleButtonClick = () => {
    enterWaitingRoom(user.name);
    updateClientStatus("CONFIRMING_WAITING_ROOM_JOINABLE");
  };

  useLayoutEffect(() => {
    /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
    // @ts-ignore
    window.particlesJS.load("particles-js", ParticleSettings, function () {
      console.log("callback - particles.js config loaded");
    });
  }, []);

  // return (
  //   <div
  //     style={{
  //       // position: "relative",
  //       height: "100%",
  //       width: "100%",
  //       // maxWidth: "680px",
  //       background: "#111",
  //     }}
  //     id="particles-js"
  //   >

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "80%",
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
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 10,
          gap: "15px",
        }}
      >
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "30px",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ color: "snow", fontSize: "1.8rem" }}>なまえを入力</div>
          <Input
            style={{ width: "100%" }}
            fluid
            placeholder={"山田 名前"}
            value={user.name}
            onChange={handleInputChange}
            size="massive"
            maxLength={5}
          />
        </div>
        <div>&nbsp;</div>
        <Button
          size="huge"
          style={{
            backgroundColor: "#A538EE",
            color: "white",
            borderRadius: "40px",
            border: "3px solid white",
            padding: "20px 20px",
            fontWeight: "normal",
            width: "100%",
          }}
          onClick={handleButtonClick}
          disabled={user.name === ""}
        >
          ランダムマッチ開始
        </Button>
      </div>
    </div>
  );
};

// useLayoutEffect(() => {
//   /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
//   // @ts-ignore
//   window.particlesJS.load("particles-js", ParticleSettings, function () {
//     console.log("callback - particles.js config loaded");
//   });
// }, []);

// if (clientStatus === "OUT_OF_GAME") {
//   alert("宇宙の力によって不正なステータスとなりました。トップに戻ります！");
//   return <Navigate replace to="/" />;
// }

// return (
//   <div
//     style={{
//       // position: "relative",
//       height: "100%",
//       width: "100%",
//       // maxWidth: "680px",
//       background: "#111",
//     }}
//     id="particles-js"
//   >
