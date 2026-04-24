$body = @{
    baseUrl='https://kaundalpoonam26.atlassian.net'
    username='poonam.kaundal26@gmail.com'
    apiToken='YOUR_ATLASSIAN_API_TOKEN'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/settings/jira' -Method POST -ContentType 'application/json' -Body $body