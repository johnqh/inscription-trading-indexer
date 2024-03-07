import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../connection';

interface Action extends RowDataPacket {
	address: string,
	tick: string,
	action: number,
	amt: number,
	destination?: string,
	block: number
}

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {

	// check query string
	let addr = req.query.address;
	let tick = req.query.tick;

	// response
	let query: string = "SELECT * FROM actions";

	// multiple conditions require the AND keyword, making things difficult
	if (addr && tick) {
		console.log('addr & tick');
		query += ` WHERE address = "${addr}" AND tick = "${tick}"`
	} else if (addr) {
		console.log(`addr only (${addr})`);
		query += `WHERE address = "${addr}"`
	} else if (tick) {
		console.log('tick only');
		query += `WHERE tick = "${tick}"`
	}

	let x = await selectActions(query);

	res.send(x);
});

export default router;

function selectActions(query: string): Promise<Action[]>{
	return new Promise((resolve, reject) => {
		connection.query<Action[]>(query, (err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		});
	});
}
