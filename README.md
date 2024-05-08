# inscription-trading-indexer

The indexer retrieves the current state of inscriptions. It communicates with the Bitcoin blockchain, loops through each block, and within each block, loops through all the transactions, parsing the transaction's metadata. It retrieves the key fields from the metadata to store the current state of inscriptions in the database.

The indexer consists of a database, a REST API to interface with the database, and a scraper that feeds data into the API. The API runs on `localhost:3000`. The scraper is able to get the last parsed block from the API, and thus be resumed.

## Installation and Running

NodeJS is required to install and run the API and order matching.

From a clone or archive of the repository, run `npm install` to install the
dependencies. 

A `.env` file will need to be made in order to store secrets, or else the API
cannot communicate to the database or UniSat. The following variables are required:

```
DATABASE_URL=<url to mysql database>
```

Then run `npm run start` to start the API. By default, it runs
on port 3000.

To run the indexer, run `ts-node indexer/indexer.ts`.
