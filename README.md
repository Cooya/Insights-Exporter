# Insights-Exporter
Save Facebook page insights into database

## Install
```bash
git clone https://github.com/Cooya/Insights-Exporter.git
cd Insights-Exporter
npm install
touch config.js // and fill out the needed fields
node set_up_database.js --create-db --create-table
npm start
```

## Config
```js
module.exports = {
  mysql: { // credentials for the MySQL database
    host: 'localhost',
    user: 'TO COMPLETE',
    password: 'TO_COMPLETE',
    database: 'TO_COMPLETE',
    table 'insights',
    schemaFile: 'assets/insights_table.sql'
  },
  userAccessToken: 'TO_COMPLETE' // Facebook user access token
};
```
