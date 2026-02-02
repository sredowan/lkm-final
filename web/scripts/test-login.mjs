import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const LOGIN_URL = 'https://www.crazyparts.com.au/customer/account/loginPost/';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function login() {
    console.log('Logging in...');
    const loginPageRes = await fetch('https://www.crazyparts.com.au/customer/account/login/', {
        headers: {
            'User-Agent': USER_AGENT,
        }
    });
    const loginPageHtml = await loginPageRes.text();
    const formKeyMatch = loginPageHtml.match(/name="form_key" value="([^"]+)"/);
    if (!formKeyMatch) throw new Error('Could not find form_key');
    const formKey = formKeyMatch[1];
    console.log('Form Key:', formKey);

    let cookies = loginPageRes.headers.getSetCookie ? loginPageRes.headers.getSetCookie() : [loginPageRes.headers.get('set-cookie')];
    cookies = cookies.filter(Boolean).map(c => c.split(';')[0]);
    console.log('Initial Cookies:', cookies);

    const params = new URLSearchParams();
    params.append('login[username]', 'aarsayem002@gmail.com');
    params.append('login[password]', 'JJstmg3xpt9@!');
    params.append('form_key', formKey);

    const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies.join('; '),
            'User-Agent': USER_AGENT,
        },
        body: params,
        redirect: 'manual'
    });

    console.log('Login Status:', res.status);
    const loginCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    console.log('Login Cookies:', loginCookies);
}

login().catch(err => console.error('FAILED:', err));
