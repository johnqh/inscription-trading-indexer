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
	let conditions: String[] = [];
	let params: String[] = [];

	// multiple conditions require the AND keyword, making things difficult
	if (addr) {
		conditions.push('address = ?');
		params.push(`${addr}`);
	}

	if (tick) {
		conditions.push('tick = ?');
		params.push(`${tick}`);
	}

	if (conditions.length) {
		query += ' WHERE ' + conditions.join(' AND ');
	}

	let response: Action[] = await selectActions(query, params);
	res.send(response);
});

router.post('/', async (req: Request, res: Response) => {
	const request: Action = req.body;

	await addAction(request);

	// TODO return res.status(400).send({error: 'Invalid input.'})

	res.send({ message: 'Action added', request })
})

export default router;

function selectActions(query: string, params: String[]): Promise<Action[]> {
	return new Promise((resolve, reject) => {
		connection.query<Action[]>(query, params, (err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		});
	});
}

async function addAction(request: Action): Promise<void> {
	// Allow nullable destination
	if (request.destination) {
		connection.execute(
			`INSERT INTO actions (address, tick, action, amt, destination, block) VALUES (?, ?, ?, ?, ?, ?)`,
			[request.address, request.tick, request.action, request.amt, request.destination, request.block],
			err => {
				if (err) {
					console.log(err);
				}
			}
		);
	} else {
		connection.execute(
			`INSERT INTO actions (address, tick, action, amt, block) VALUES (?, ?, ?, ?, ?)`,
			[request.address, request.tick, request.action, request.amt, request.block],
			err => {
				if (err) {
					console.log(err);
				}
			}
		);
	}
}
