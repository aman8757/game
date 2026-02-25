async function test() {
    const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userName: "TestUser",
            squadName: "TestSquad",
            phone: "1234567890",
            email: "test@example.com",
            transactionId: "TXN123456789"
        })
    });
    console.log(await res.text());
}
test();
