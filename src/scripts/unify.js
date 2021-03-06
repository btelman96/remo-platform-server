// channels & robots > robot_channels

// name, id, created, heartbeat, server_id, chat_id, controls_id

// channels.name > robot_channels.name
// robots.id > robot_channels.id else newId
// channels.created > robot_channels.created
// robots.status[heartBeat] > robot_channels.heartbeat else epoch
// channels.host_id > robot_channels.server_id
// channels.chat > robot_channels.chat_id
// channels.controls > robot_channels.controls_id

/*
CREATE TABLE robot_channels (
    name text NOT NULL,
    id text NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    heartbeat timestamp NOT NULL DEFAULT '1970-1-1',
    server_id text NOT NULL REFERENCES robot_servers(server_id) ON DELETE CASCADE,
    chat_id text NOT NULL,
    controls_id text NOT NULL REFERENCES controls(id) ON DELETE CASCADE
);

run script verify the data is correct then

ALTER TABLE controls DROP COLUMN channel_id;
DROP TABLE channels;
DROP TABLE robots;
*/
//make chat_rooms.id a primary key later
const db = require("../services/db");
const uuidv4 = require("uuid/v4");

function newId() {
  return "rbot-" + uuidv4();
}

function findRobotDataElse(channelId, robots) {
  for (const robot of robots) {
    if (
      robot.status &&
      robot.status.current_channel &&
      robot.status.current_channel === channelId
    ) {
      return {
        id: robot.id,
        heartbeat: robot.status.heartBeat || 0,
        existing: true,
      };
    }
  }

  return { id: newId(), heartbeat: 0 };
}

function getServer(servers, server_id) {
  for (const server of servers) {
    if (server.server_id === server_id) {
      return server;
    }
  }
}

async function run() {
  const channelsQuery = await db.query("SELECT * FROM channels");
  const channels = channelsQuery.rows;

  const robotsQuery = await db.query("SELECT * FROM robots");
  const robots = robotsQuery.rows;

  const serversQuery = await db.query("SELECT * FROM robot_servers");
  const servers = serversQuery.rows;

  let notFoundCount = 0;

  for (const channel of channels) {
    const existingChannelId = channel.id;

    const robotData = findRobotDataElse(channel.id, robots);
    const name = channel.name;
    const id = robotData.id;
    const created = new Date(parseInt(channel.created) || 0);
    const heartbeat = new Date(robotData.heartbeat);
    const server_id = channel.host_id;
    const chat_id = channel.chat;
    const controls_id = channel.controls;

    const robotServer = getServer(servers, server_id);

    if (robotServer) {
      try {
        await db.query(
          "INSERT INTO robot_channels (name, id, created, heartbeat, server_id, chat_id, controls_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [name, id, created, heartbeat, server_id, chat_id, controls_id]
        );
      } catch (e) {
        return console.error(e);
      }

      if (
        robotServer.settings &&
        robotServer.settings.default_channel === existingChannelId
      ) {
        const newSettings = { ...robotServer.settings, default_channel: id };
        await db.query(
          "UPDATE robot_servers SET settings = $1 WHERE server_id = $2",
          [newSettings, server_id]
        );
      }
    } else {
      notFoundCount++;
      console.log(`${server_id} not found`);
    }
  }

  console.log(
    `Finished with ${notFoundCount}/${channels.length} channels servers not found!`
  );
}

run().then(() => {
  console.log("done");
});
