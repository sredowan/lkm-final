const url = 'https://www.crazyparts.com.au/customer/account/login/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function diag() {
    try {
        console.log('Fetching:', url);
        const res = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
            }
        });
        console.log('Status:', res.status);
        console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
        const body = await res.text();
        console.log('Body length:', body.length);
        console.log('First 200 chars:', body.substring(0, 200));
    } catch (err) {
        console.error('DIAG FAILED:', err);
    }
}

diag();
