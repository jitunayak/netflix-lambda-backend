import AWS from "aws-sdk";
import express, { Request, Response, NextFunction } from "express";
import { genres, Movie } from "./Movie";
import serverless from "serverless-http";
import { v4 as uuid } from "uuid";

const app = express();

const MOVIES_TABLE = process.env.MOVIES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/movies/:movieId", async function (req: Request, res: Response) {
  const params = {
    TableName: MOVIES_TABLE,
    Key: {
      movieId: req.params.movieId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      res.status(201).json(Item);
    } else {
      res
        .status(404)
        .json({ error: 'Could not find movie with provided "movieId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve movie" });
  }
});

app.post("/movies", async function (req: Request, res: Response) {
  const movie: Movie = req.body;

  const searchParams = {
    TableName: MOVIES_TABLE,
    IndexName: "title-index",
    KeyConditionExpression: "title = :title",
    ExpressionAttributeValues: { ":title": movie.title },
  };
  const params = {
    TableName: MOVIES_TABLE,
    Item: {
      description: movie.description,
      genre: movie.genre,
      title: movie.title,
      thumbnail: movie.thumbnail,
      movieId: uuid(),
      rating: movie.rating,
    },
  };

  try {
    const searchedMovie = await dynamoDbClient.query(searchParams).promise();
    console.log(searchedMovie);
    if (searchedMovie.Items.length > 0) {
      res.status(400).json({ error: "Movie already exists" });
    } else {
      await dynamoDbClient.put(params).promise();
      res.status(201).json(req.body);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create movie details" });
  }
});

app.get("/movies", async function (req: Request, res: Response) {
  const params = {
    TableName: MOVIES_TABLE,
  };
  try {
    const allMovies = await dynamoDbClient.scan(params).promise();
    res.status(200).json(allMovies);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve movies" });
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
