const url = 'https://www.crazyparts.com.au/customer/account/login/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function diag() {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const body = await res.text();
        console.log('Body length:', body.length);

        const index = body.indexOf('form_key');
        if (index !== -1) {
            console.log('Found "form_key" at index:', index);
            console.log('Snippet:', body.substring(index - 50, index + 100));
        } else {
            console.log('"form_key" not found in body.');
            console.log('First 1000 chars:', body.substring(0, 1000));
        }
    } catch (err) {
        console.error('DIAG FAILED:', err);
    }
}

diag();
