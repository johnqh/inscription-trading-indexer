import express, { Request, Response } from 'express';
import dotenv from 'dotenv'; 

// Get address for MySQL server
dotenv.config();
const databaseURL = process.env.DATABASE_URL;

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
	console.log("Database: " + databaseURL);
	res.send('test');
});

export default router;
