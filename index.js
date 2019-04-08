const request = require('request-promise');

const config = require('./config');
const DatabaseConnection = require('./DatabaseConnection')

const apiUrlPrefix = 'https://graph.facebook.com/v3.2';
const requiredMetrics = [
	'page_actions_post_reactions_like_total',
	'page_impressions',
	'page_consumptions',
	'page_engaged_users'
];

async function main() {
	const databaseConnection = new DatabaseConnection(config.mysql);
	await databaseConnection.connect();

	console.log('Getting list of accounts...');
	let res = await request.get(apiUrlPrefix + '/me/accounts', {
		qs: {
			access_token: config.userAccessToken,
			limit: 1000
		}
	});

	console.log('Processing accounts...');
	const json = JSON.parse(res);
	let item;
	for(let entry of json.data) {
		try {
			res = await request.get(apiUrlPrefix + '/' + entry.id + '/insights', {
				qs: {
					access_token: entry.access_token,
					metric: requiredMetrics,
					period: 'day',
					date_preset: 'yesterday'
				}
			});
			res = JSON.parse(res);
			//console.debug(JSON.stringify(res, null, '  '));
			
			item = {
				date: new Date(),
				page_id: entry.id,
				page_name: entry.name
			};
			for(let metric of res.data)
				item[metric.name] = metric.values[0].value;

			//console.debug(item);
			await databaseConnection.insertItem(item, 'page_name'); 
		} catch(e) {
			if(e.code == 'ER_DUP_ENTRY') console.warn('Account "%s" already processed today.', entry.name);
			else throw e;
		}
	}

	console.log(json.data.length + ' account insights exported successfully.');
	await databaseConnection.end();
}

(async () => {
	try {
		await main();
	} catch(e) {
		console.error(e);
		process.exit(1);
	}
})();