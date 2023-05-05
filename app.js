//importing all the necessary modules like express,sqlite3,sqlite and etc.
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndConnectToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDbAndConnectToServer();

//writing an api to get all the players list
app.get("/players", async (request, response) => {
  try {
    const dbQuery = `
        SELECT 
            *
        FROM
            player_details
    `;
    const dbObj = await db.all(dbQuery);
    const resObj = dbObj.map((item) => {
      return {
        playerId: item.player_id,
        playerName: item.player_name,
      };
    });
    response.send(resObj);
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});

//writing an api to get  the particular player details using player_id
app.get("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const dbQuery = `
        SELECT 
            *
        FROM
            player_details
        WHERE
            player_id = ${playerId}
    `;
    const dbObj = await db.get(dbQuery);
    const resObj = (item) => {
      return {
        playerId: item.player_id,
        playerName: item.player_name,
      };
    };
    response.send(resObj(dbObj));
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});

//writing an api to update  the particular player details using player_id
app.put("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    //console.log(request.body);
    const { playerName } = playerDetails;
    const dbQuery = `
        UPDATE
            player_details
        SET
            player_name = '${playerName}'
        WHERE
            player_id = ${playerId}
    `;
    const dbObj = await db.run(dbQuery);

    response.send("Player Details Updated");
  } catch (e) {
    console.log(`Some thing went wrong ${e.message}`);
  }
});

//Returning the match details of a specific match using mathc_id
app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const dbQuery = `
        SELECT 
            *
        FROM
            match_details
        WHERE
            match_id = ${matchId}
    `;
    const dbObj = await db.get(dbQuery);
    const resObj = (item) => {
      return {
        matchId: item.match_id,
        match: item.match,
        year: item.year,
      };
    };
    response.send(resObj(dbObj));
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});

//Returning a list of all the matches of a player
//applying inner join on player_match_details and match_details
app.get("/players/:playerId/matches/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const dbQuery = `
        SELECT 
            match_details.match_id as matchId,
            match_details.match as match,
            match_details.year as year
        FROM
            player_match_score
        INNER JOIN
            match_details
        ON 
            player_match_score.match_id = match_details.match_id
        WHERE
            player_match_score.player_id = ${playerId}    
        
    `;
    const dbObj = await db.all(dbQuery);

    response.send(dbObj);
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});
//Returning a list of players of a specific match
//applying inner join on player_match_details and player_details
app.get("/matches/:matchId/players/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const dbQuery = `
        SELECT 
            player_details.player_id as playerId,
            player_details.player_name as playerName
        FROM
            player_match_score
        INNER JOIN
            player_details
        ON 
            player_match_score.player_id = player_details.player_id
        WHERE
            player_match_score.match_id = ${matchId}    
        
    `;
    const dbObj = await db.all(dbQuery);

    response.send(dbObj);
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});

//Returning the statistics of the total score, fours, sixes
//of a specific player based on the player ID
app.get("/players/:playerId/playerScores/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const dbQuery = `
        SELECT 
            player_details.player_id as playerId,
            player_details.player_name as playerName,
            SUM(t1.score) as totalScore,
            SUM(t1.fours) as totalFours,
            SUM(t1.sixes) as totalSixes

            
        FROM
            (player_details
        INNER JOIN
             player_match_score
        ON 
            player_details.player_id = player_match_score.player_id )
        AS t1
        WHERE
                player_details.player_id = ${playerId};
        
    `;
    const dbObj = await db.get(dbQuery);

    response.send(dbObj);
  } catch (e) {
    console.log(
      `Some thing went wrong while retrieving players list ${e.message}`
    );
  }
});

//exporting app
module.exports = app;
