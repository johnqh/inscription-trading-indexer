import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();
/* the DATABASE_URL variable is always going to be there, so assure that it is
 * fine */
export default mysql.createConnection(process.env.DATABASE_URL!);
