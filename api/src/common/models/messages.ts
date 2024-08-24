export interface MotionMinhayaWSClientMessage {
    action: "PING" | "PING_WITH_ACK"
    message?: string
}


export interface MotionMinhayaWSServerMessage {
    event: "PONG" | "PONG_WITH_ACK"
    message?: string
}