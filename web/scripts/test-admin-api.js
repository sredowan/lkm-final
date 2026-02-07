
async function testApi() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/products?pageSize=5');
        const data = await response.json();

        console.log('API Response Status:', response.status);
        if (data.products && data.products.length > 0) {
            console.log('Sample Products:');
            data.products.slice(0, 3).forEach(p => {
                console.log(`- ${p.name}: Image=${p.primaryImage}`);
            });
        } else {
            console.log('No products found or error in data structure:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testApi();
