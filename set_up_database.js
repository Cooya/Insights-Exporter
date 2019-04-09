const fs = require('fs');
const mysql = require('mysql');
const util = require('util');

const config = require('./config');
const readFile = util.promisify(fs.readFile);

(async () => {
	const args = process.argv;
	const actions = {};
	for(let i = 1; i < args.length; ++i) {
		if(args[i] == '--drop-db')
			actions.dropDatabase = true;
		if(args[i] == '--create-db' || args[i] == '--create-database')
			actions.createDatabase = true;
		if(args[i] == '--create-table')
			actions.createTable = true;
	}

	if(!Object.keys(actions).length) {
		console.warn('Nothing to do.')
		process.exit(0);
	}

	const credentials = {
		host: config.mysql.host,
		user: config.mysql.user,
		password: config.mysql.password,
		schemaFile: config.mysql.schemaFile,
		multipleStatements: true
	};
	
	try {
		await setUpDatabase(credentials, config.mysql.database, actions);
	} catch(e) {
		console.error(e);
		process.exit(1);
	}
})();

async function setUpDatabase(credentials, databaseName, actions) {
	const connection = mysql.createConnection(credentials);
	await connect(connection);

	if(actions.dropDatabase)
		await dropDatabase(connection, databaseName);

	if(actions.createDatabase)
		await createDatabase(connection, databaseName);

	if(actions.createTable) {
		await selectDatabase(connection, databaseName);
		const schema = (await readFile(credentials.schemaFile)).toString();
		await importSchema(connection, schema);
	}

	connection.end();
	console.log('Connection to the database closed.');
}

function connect(connection) {
	return new Promise((resolve, reject) => {
		connection.connect((err) => {
			if (err) reject(err);
			else {
				console.log('Connected to the database.');
				resolve();
			}
		});
	});
}

function createDatabase(connection, name) {
	return new Promise((resolve, reject) => {
		connection.query('CREATE DATABASE `' + name + '`', (err) => {
			if (err) {
				if(err.message.indexOf('ER_DB_CREATE_EXISTS') != -1) {
					console.warn('Database "' + name + '" already exists.');
					resolve(false);
				}
				else reject(err);
			}
			else {
				console.log('Database "' + name + '" created.');
				resolve(true);
			}
		});
	});
}

function selectDatabase(connection, name) {
	return new Promise((resolve, reject) => {
		connection.query('USE `' + name + '`', (err) => {
			if(err) reject(err);
			else  {
				console.log('Database "' + name + '" selected.');
				resolve(true);
			}
		});
	})
}

function dropDatabase(connection, name) {
	return new Promise((resolve, reject) => {
		connection.query('DROP DATABASE `' + name + '`', (err) => {
			if (err) reject(err);
			else {
				console.log('Database "' + name + '" dropped.');
				resolve();
			}
		});
	});
}

function importSchema(connection, schema) {
	return new Promise((resolve, reject) => {
		connection.query(schema, function (err) {
			if (err) reject(err);
			else {
				console.log('Schema imported succesfully into the database.');
				resolve();
			}
		});
	});
}