import { useEffect, useLayoutEffect, useState } from "react";
import { Modal, ModalHeader } from "semantic-ui-react";
import { Quiz } from "../../../../api/src/common/models/game";
import ParticleSettings from "../../../public/particles.json?url";

export const QuizResult: React.FC<{
  quiz: Quiz;
}> = ({ quiz }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const sid = setTimeout(() => {
      setOpen(false);
    }, 3000);
    return () => clearTimeout(sid);
  }, []);

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
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        style={{ maxWidth: "500px", borderRadius: "12px" }}
        closeOnDimmerClick={false}
        closeOnEscape={false}
        closeOnPortalMouseLeave={false}
        closeOnTriggerBlur={false}
        closeOnTriggerMouseLeave={false}
        closeOnDocumentClick={false}
        closeOnTriggerClick={false}
      >
        <ModalHeader
          style={{
            textAlign: "center",
            fontSize: "3rem",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <div style={{ fontSize: "1.8rem" }}>第{quiz.quizNumber}問</div>
          <div style={{ color: "#6D23AA" }}>正解発表</div>
        </ModalHeader>
        <Modal.Content
          style={{
            textAlign: "center",
            fontSize: "1.6rem",
            width: "100%",

            borderRadius: "0 0 12px 12px",
          }}
        >
          <div>答えは…</div>
        </Modal.Content>
      </Modal>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, 0)",
          width: "100%",
          height: "90dvh",
          display: "flex",
          flexDirection: "column",
          // margin: "0 auto",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          // gap: "30px",
        }}
      >
        <div style={{ color: "snow", fontSize: "2rem", marginBottom: "30px" }}>
          第{quiz.quizNumber}問
        </div>
        <div
          style={{
            background: "snow",
            color: "#6D23AA",
            textAlign: "center",
            width: "85%",
            padding: "8px",
            fontWeight: "bold",
            fontSize: "2rem",
            borderRadius: "12px",
            marginBottom: "40px",
          }}
        >
          {quiz.answers.map((s) => (
            <div key={s} style={{ margin: "20px 0" }}>
              {s}
            </div>
          ))}
        </div>
        <div></div>
        {quiz.guesses
          .sort((a, b) => a.quizPoint - b.quizPoint)
          .map((g) => (
            <div
              key={g.name}
              style={{
                margin: "6px 0",
                display: "flex",
                background: "snow",
                width: "85%",
                padding: "16px 0",
                borderRadius: "12px",
                gap: "20px",
                justifyContent: "space-around",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                {g.name}
              </div>
              <div style={{ fontSize: "1.8rem" }}>「{g.guess}」</div>
              <div
                style={{
                  color: "red",
                  fontSize: "2rem",
                  // visibility: g.quizPoint > 0 ? "visible" : "hidden",
                }}
              >
                +{g.quizPoint}{" "}
                <span style={{ color: "#111", fontSize: "1.2rem" }}>pt</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
