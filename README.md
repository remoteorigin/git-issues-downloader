# Download and Convert GitHub Issues into CSV

Change `<PASSWORD>` for the real password.

    curl -u pavelbinar:<PASSWORD> -v "https://api.github.com/repos/OptumSoft/Controller/issues?per_page=100&state=all&page=1" > all_issues_p1.json

This is necessary to run multiple times for all pages returned in the request response.

Each time update the number of page:

    page=1" > all_issues_p1.json