const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * FROM state;
    `;
  const dbRequest = await db.all(getStatesQuery);
  response.send(dbRequest);
});

//GET a specific state API
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
  SELECT * FROM state WHERE state_id=${stateId};
  `;
  const dbRequest = await db.get(getStateQuery);
  response.send(dbRequest);
});
//GET districs API
app.get("/districts/", async (request, response) => {
  const getDIstrictsQuery = `
    SELECT * FROM district;
    `;
  const dbRequest = await db.all(getDIstrictsQuery);
  response.send(dbRequest);
});
//post a district API
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
  INSERT INTO district (district_name,state_id,
    cases,
    cured,
    active,
    deaths) VALUES(
        '${districtName}',
        ${stateId},
         ${cases},
          ${cured},
           ${active},
            ${deaths}
    );
  `;
  const dbRequest = await db.run(addDistrictQuery);
  const districtId = dbRequest.lastID;
  response.send({ districtId: districtId });
});

//GET a specific district API
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `
    SELECT * FROM district WHERE district_id=${districtId};
    `;
  const dbRequest = await db.get(getDistQuery);
  response.send(dbRequest);
});

//DELETE district API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `
  DELETE FROM district WHERE district_id=${districtId};
  `;
  const dbRequest = await db.get(getDistQuery);
  response.send("District removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrict = `
  UPDATE district SET 
  district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths} WHERE district_id=${districtId};
  `;
  const dbRequest = await db.get(updateDistrict);
  response.send("Updated successfully");
});

//GET stats API
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStats = `
  SELECT SUM(cases) as totalCases,
        SUM(cured)  as totalCured,
        SUM(active) as toatalActive,
        SUM(deaths) as totalDeaths
   FROM district WHERE state_id=${stateId};`;
  const dbRequest = await db.get(getStats);
  response.send(dbRequest);
});

//GET district name API
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateDetails = `
  SELECT state_name FROM state JOIN district ON 
  state.state_id=district.state_id
   WHERE district.district_id=${districtId};
  `;
  const dbRequest = await db.get(getStateDetails);
  response.send({ stateName: dbRequest.state_name });
});
