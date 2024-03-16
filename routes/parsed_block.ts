import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../connection';

interface ParsedBlock extends RowDataPacket {
	last_parsed_block: number
}

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
	let response: ParsedBlock[] = await selectParsedBlock();

	if (response.length == 0) {
		return res.status(404).send({ error: 'No parsed block available.' });
	}

	res.send(response[0]);
});

router.post('/', async (req: Request, res: Response) => {
	const request: ParsedBlock = req.body;
	const last_parsed_block = request.last_parsed_block;

	if (!last_parsed_block) {
		return res.status(400).send({ error: 'Invalid input.' })
	}

	await setParsedBlock(last_parsed_block);

	res.send({
		message: 'Last parsed block processed successfully.', last_parsed_block
	});
});

export default router;

function selectParsedBlock(): Promise<ParsedBlock[]> {
	return new Promise((resolve, reject) => {
		connection.query<ParsedBlock[]>(
			"SELECT * FROM parsed_block LIMIT 1",
			(err, res) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(res);
				}
			});
	});
}

async function setParsedBlock(new_val: number) {
	const response: ParsedBlock[] = await selectParsedBlock();

	if (response.length > 0) {
		connection.execute(
			`UPDATE parsed_block SET last_parsed_block = ?`,
			[new_val]);
	} else {
		connection.execute(
			`INSERT INTO parsed_block (last_parsed_block) VALUES (?)`,
			[new_val]);
	}
}
