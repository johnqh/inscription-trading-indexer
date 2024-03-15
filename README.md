# inscription-trading-indexer

The indexer consists of a database, a REST API to interface with the database, and a scraper that feeds data into the API. The API runs on `localhost:3000`. The scraper is able to get the last parsed block from the API, and can thus be resumed.
