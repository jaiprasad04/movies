const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const ans = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT 
      movie_name
    FROM 
      movie;`;

  const moviesArray = await db.all(getAllMoviesQuery);
  response.send(moviesArray.map((movieName) => ans(movieName)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES 
      ('${directorId}', '${movieName}', '${leadActor}')`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

const ans2 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM 
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(ans2(movie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE 
      movie
    SET
      director_id = '${directorId}',
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE 
      movie_id = '${movieId}'`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const ans3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getAllDirectoryQuery = `
    SELECT 
      *
    FROM 
      director;`;

  const moviesArray = await db.all(getAllDirectoryQuery);
  response.send(moviesArray.map((director) => ans3(director)));
});

const ans4 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectoryMovieQuery = `
    SELECT
      movie_name
    FROM 
      director INNER JOIN movie
      ON director.director_id = movie.director_id
    WHERE 
      director.director_id = ${directorId};`;

  const movies = await db.all(getDirectoryMovieQuery);
  response.send(movies.map((movieNames) => ans4(movieNames)));
});

module.exports = app;
