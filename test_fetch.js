async function test() {
  const loginRes = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@dev.local", password: "password123" })
  });
  
  const setCookie = loginRes.headers.getSetCookie();
  if (!setCookie || setCookie.length === 0) {
    console.error("Login failed", await loginRes.text());
    return;
  }
  
  const token = setCookie[0].split(';')[0];
  
  const balRes = await fetch("http://localhost:3000/api/v1/inventory/balances", {
    headers: {
      "Cookie": token
    }
  });
  
  console.log("Status:", balRes.status);
  const text = await balRes.text();
  console.log("Response:", text);
}

test();
