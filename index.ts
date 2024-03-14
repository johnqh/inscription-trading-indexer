import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import parsed_block from './routes/parsed_block';
import actions from './routes/actions';
import holdings from './routes/holdings';
import deploy from './routes/deploy';

// Get address for MySQL server
dotenv.config();
const databaseURL = process.env.DATABASE_URL;
console.log("Database: " + databaseURL);

const app = express();
const port = 3000;

app.use(express.json());

// Have root state that the indexer is running
app.get('/', (_req: Request, res: Response) => {
	res.send("Indexer is running");
});

app.use('/parsed_block', parsed_block);
app.use('/actions', actions);
app.use('/holdings', holdings);
app.use('/deploy', deploy);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
})
