import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../connection';

interface ParsedBlock extends RowDataPacket {
	last_parsed_block: number
}


const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
	let response = await selectParsedBlock();
	res.send(response);
});

export default router;

function selectParsedBlock(): Promise<ParsedBlock>{
	return new Promise((resolve, reject) => {
		connection.query<ParsedBlock[]>(
			"SELECT * FROM parsed_block",
			(err, res) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(res?.[0]);
				}
			});
	});
}
