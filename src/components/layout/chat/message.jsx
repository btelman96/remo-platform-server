import React, { useState } from "react";
import Emotes from "../../../emotes/emotes";
import defaultImages from "../../../imgs/placeholders";
import { mobileMessageFadeOut } from "../../../config/clientSettings";

const Message = ({ message }) => {
  const [fadeout, setFadeout] = useState(
    setTimeout(() => handleFade(), mobileMessageFadeOut)
  );

  const handleFade = () => {
    setFadeout(true);
  };

  const types = {
    default: "",
    moderation: "moderation",
    robot: "robot",
    admin: "admin",
    channel: "channel",
    special: "special",
    siteCommand: "site-command",
    self: "self"
  };

  const handleEmotes = filterMessage => {
    let filter = [];
    filterMessage.split(" ").forEach((word, i) => {
      if (Emotes.hasOwnProperty(word)) {
        filter.push(
          <span key={`${word}${i}`} title={word}>
            <img className="emote" src={Emotes[word]} alt={word} />{" "}
          </span>
        );
      } else {
        filter.push(word + " ");
      }
    });
    return filter;
  };

  /*
  Badges: 
  Slot 1: Global (example: Staff, Global MOderator), 
  Slot 2: Local (example: owner, moderator), 
  Slot 3: Global Support (AKA Patreon), 
  Slot 4: Local Support (AKA Server Sub) 
  */

  const handleBadges = message => {
    const { badges } = message;
    if (message && message.type === types.moderation) return <React.Fragment />;
    if (badges && badges.length > 0) {
      // console.log("BADGES GET: ", badges);
      return badges.map(badge => {
        // console.log("BADGE GET: ", badge);
        if (badge === "staff") {
          // console.log("ADD BADGE!");
          return (
            <span key={message.id + badge}>
              <img
                className="message-badge"
                src={defaultImages["remoStaffBadge"]}
                alt={badge}
                title={"Remo Developer"}
              />
            </span>
          );
        }

        if (badge === "owner") {
          return (
            <span key={message.id + badge}>
              <img
                className="message-badge"
                src={defaultImages["owner"]}
                alt={badge}
                title={"Robot Server Owner"}
              />
            </span>
          );
        }

        if (badge === "global_moderator") {
          return (
            <span key={message.id + badge}>
              <img
                className="message-badge"
                src={defaultImages["globalModerator"]}
                alt={badge}
                title={"Global Moderator"}
              />
            </span>
          );
        }
        if (badge === "local_moderator") {
          return (
            <span key={message.id + badge}>
              <img
                className="message-badge"
                src={defaultImages["moderator"]}
                alt={badge}
                title={"Moderator"}
              />
            </span>
          );
        }

        if (badge === "robot") {
          return (
            <span key={message.id + badge}>
              <img
                className="message-badge"
                src={defaultImages["robot"]}
                alt={badge}
                title={"Robot"}
              />
            </span>
          );
        }
        return <React.Fragment key={badge} />;
      });
    }
  };

  const handleMessageType = message => {
    const { color } = message;
    if (message.type === types.moderation) {
      // console.log("Moderation Type Message");
      return `chat-message system-message`;
    } else if (message.type === types.robot) {
      return `chat-message robot-message`;
    } else {
      return `chat-message ${color} ${
        // return `chat-message rainbow ${
        message.type === types.self ? types.self : ""
      }`;
    }
  };

  const handleMessageSender = message => {
    if (message && message.type === types.moderation) {
      return "System";
    }
    return message.sender;
  };

  const handleSenderColor = message => {
    let color = "chat-user-name";
    //if (message.sender === "remo") return "chat-user-name rainbow";
    //another temporary solution:
    rainbowForLifeNames.map(name => {
      //console.log("Mapping Names");
      if (message.sender.toLowerCase() === name.toLowerCase()) {
        //console.log(`Found Match: ${name}`);
        color = "chat-user-name rainbow";
        return;
      }
    });
    return color;
  };

  const handleMessageContainer = () => {
    if (fadeout === true) return "chat-message-container fade-out";
    return "chat-message-container";
  };

  return (
    <div className={handleMessageContainer()}>
      <div className={handleMessageType(message)}>
        {handleBadges(message)}
        <span
          className={handleSenderColor(message)}
          title={new Date(parseInt(message.time_stamp)).toLocaleString()}
        >{`${handleMessageSender(message)}${
          message.type === types.self ? "" : ":"
        }  `}</span>
        <span className="message-spacing">
          {handleEmotes(message.message).map(element => {
            return element;
          })}
        </span>
      </div>
    </div>
  );
};

export default Message;

const rainbowForLifeNames = [
  "Admanta",
  "TGCFabian",
  "onlybrezel",
  "robosim",
  "backslashkieran",
  "mikey",
  "skeet",
  "andrak",
  "xyamom",
  "RoyE",
  "bruh116",
  "Boland",
  "chad",
  "gcurtis79",
  "neviklink",
  "cheshy",
  "BunkyFakerino",
  "Remo",
  "ReconDelta090",
  "Peter",
  "hgriswold89",
  "sybergoosejr",
  "Nocturnal",
  "Hopper"
];
