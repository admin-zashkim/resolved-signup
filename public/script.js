async function auth(type) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
        alert(type === 'signin' ? "Success! Welcome back." : "Account created! Please login.");
        if(type === 'signup') window.location.href = 'index.html';
    } else {
        alert(data.error);
    }
}