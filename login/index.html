<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <title>Anime Catch Authentication</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-gold: #C1973E;
            --gold-gradient: linear-gradient(135deg, #C1973E, #e0b75c);
            --bg-dark: #0a0a0a;
            --card-dark: #1c1c1c;
            --text-light: #ffffff;
        }

        body {
            font-family: 'Roboto', sans-serif;
            text-align: center;
            padding: 20px;
            background-color: var(--bg-dark);
            color: var(--text-light);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 95vh;
            margin: 0;
            background-image: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
        }

        .container {
            max-width: 450px;
            background: var(--card-dark);
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(193, 151, 62, 0.15);
            border: 1px solid rgba(193, 151, 62, 0.2);
            position: relative;
            overflow: hidden;
            width: 100%;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: var(--gold-gradient);
        }

        .logo-circle {
            width: 80px;
            height: 80px;
            background: var(--gold-gradient);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 5px 15px rgba(193, 151, 62, 0.4);
        }

        .logo-circle svg {
            width: 40px;
            height: 40px;
            fill: white;
            margin-left: 5px;
        }

        h1 {
            color: var(--text-light);
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        p {
            color: #aaaaaa;
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 25px;
        }

        .code-box {
            background-color: #2a2a2a;
            border: 1px solid #333;
            padding: 15px;
            border-radius: 12px;
            font-family: monospace;
            word-wrap: break-word;
            font-size: 14px;
            color: #4da6ff;
            margin-bottom: 20px;
            user-select: all;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--gold-gradient);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(193, 151, 62, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            cursor: pointer;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 15px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(193, 151, 62, 0.6);
        }

        .btn-secondary {
            background: #333;
            box-shadow: none;
        }

        .btn-secondary:hover {
            background: #444;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }

        .btn svg {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            fill: currentColor;
        }
        
        .loading {
            display: none;
            margin-top: 15px;
            color: var(--primary-gold);
            font-weight: bold;
            font-size: 14px;
        }
        
        .spinner {
            display: inline-block;
            width: 15px;
            height: 15px;
            border: 2px solid rgba(193, 151, 62, 0.3);
            border-radius: 50%;
            border-top-color: var(--primary-gold);
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        #successMessage {
            display: none;
            color: #4caf50;
            margin-top: 15px;
            font-weight: bold;
            font-size: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-circle">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
        
        <h1>Authentication Successful!</h1>
        <p>You have successfully authenticated with <span id="providerName">your provider</span>. We are now redirecting you back to Anime Catch.</p>
        
        <div class="code-box" id="authCode">Extracting code...</div>

        <a href="#" id="deepLinkBtn" class="btn">
            <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
            Return to App (Android)
        </a>
        
        <button id="copyBtn" class="btn btn-secondary">
            <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            Copy the full URL manually
        </button>
        
        <div class="loading" id="loadingState">
            <div class="spinner"></div> Syncing with PC app...
        </div>
        <div id="successMessage">✓ Automatically signed in on PC!</div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            const code = urlParams.get('code');
            const token = hashParams.get('access_token');
            const fullUrl = window.location.href;
            
            const authCodeBox = document.getElementById('authCode');
            const deepLinkBtn = document.getElementById('deepLinkBtn');
            const copyBtn = document.getElementById('copyBtn');
            const providerName = document.getElementById('providerName');
            const loadingState = document.getElementById('loadingState');
            const successMessage = document.getElementById('successMessage');

            authCodeBox.innerText = fullUrl;
            let paramKey = '';
            let paramValue = '';

            if (code) {
                providerName.innerText = 'MyAnimeList';
                paramKey = 'code';
                paramValue = code;
                deepLinkBtn.href = `animecatch://login?code=${code}`;
            } else if (token) {
                providerName.innerText = 'AniList';
                paramKey = 'token';
                paramValue = token;
                deepLinkBtn.href = `animecatch://login?token=${token}`;
            } else {
                providerName.innerText = 'the provider';
                authCodeBox.innerText = "No code or token found in URL.";
                deepLinkBtn.style.display = 'none';
            }

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(fullUrl).then(() => {
                    copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> URL Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> Copy the full URL manually';
                    }, 3000);
                });
            });

            if (paramValue) {
                loadingState.style.display = 'block';
                const localUrl = `http://127.0.0.1:57342/auth?${paramKey}=${paramValue}`;
                
                fetch(localUrl, { method: 'GET', mode: 'no-cors' })
                    .then(() => {
                        loadingState.style.display = 'none';
                        successMessage.style.display = 'block';
                    })
                    .catch((err) => {
                        console.log("Local PC sync failed (normal on Android): ", err);
                        loadingState.style.display = 'none';
                        // Auto deep-link redirect for mobile
                        window.location.href = deepLinkBtn.href;
                    });
            }
        });
    </script>
</body>
</html>
