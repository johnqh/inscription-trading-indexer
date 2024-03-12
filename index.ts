import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import parsed_block from './routes/parsed_block';
import actions from './routes/actions';
import holdings from './routes/holdings';

// Get address for MySQL server
dotenv.config();
const databaseURL = process.env.DATABASE_URL;
console.log("Database: " + databaseURL);

const app = express();

app.use(express.json());

// Have / provide status of indexer
app.get('/', (_: Request, res: Response) => {
	res.send("Indexer is running");
});

app.use('/parsed_block', parsed_block);
app.use('/actions', actions);
app.use('/holdings', holdings);

app.listen(3000, () => {
	console.log("Indexer is running on port 3000");
})
