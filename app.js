const express = require('express');
const http = require('http');
const RSVP = require('rsvp');

const app = express();

app.get('/I/want/title', (req, res) => {
	let addresses = req.query.address;
	if (!Array.isArray(addresses)) {
		addresses = [addresses];
	}
	let titles = [];

	RSVP.all(
		addresses.map((address) => {
			return new RSVP.Promise((resolve, reject) => {
				const url = address.includes('http') ? address : `http://${address}`;
				http
					.get(url, (response) => {
						response.setEncoding('utf8');
						let data = '';
						response.on('data', (chunk) => {
							data += chunk;
						});
						response.on('end', () => {
							const match = data.match(/<title>([\s\S]*)<\/title>/);
							const title = match ? match[1] : 'NO RESPONSE';
							titles.push({ address, title });
							resolve();
						});
					})
					.on('error', () => {
						titles.push({ address, title: 'NO RESPONSE' });
						resolve();
					});
			});
		})
	).then(() => {
		const html = `
      <html>
      <head></head>
      <body>
        <h1> Following are the titles of given websites: </h1>
        <ul>
          ${titles
						.map(({ address, title }) => `<li> ${address} - "${title}" </li>`)
						.join(' ')}
        </ul>
      </body>
      </html>
    `;
		res.send(html);
	});
});

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
