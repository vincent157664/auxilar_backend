import { Server } from "socket.io";
import Account from "../models/account";

const registerSocketServer = async (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    socket.on("login", async (data) => {

      const account = await Account.findOne({ email: data });
      if (account) {
        if (account.account_type === "admin") {
          socket["account_type"] = 0;
        } else {
          socket["account_type"] = 1;
        }
        socket["accountId"] = account._id.toString();
        socket.join(account._id.toString());
      }
    });
    socket.on("newMessage", (data) => {
      io.to(data["from"]).emit("messageFromServer", data);
      io.to(data["to"]).emit("messageFromServer", data);
    });
    socket.on("currentAccount", (data) => {
      socket.leave(socket["currentAccount"]);
      socket["currentAccount"] = data;
      socket.join(data);
    });
    socket.on("disconnect", () => {});
  });
};

export default registerSocketServer;
