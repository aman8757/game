document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('registrationTableBody');
    const totalCount = document.getElementById('totalCount');
    const clearBtn = document.getElementById('clearDataBtn');
    const exportBtn = document.getElementById('exportBtn');

    // Login Elements
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const adminUser = document.getElementById('adminUser');
    const adminPass = document.getElementById('adminPass');

    // Admin Credentials
    const ADMIN_CRED = { user: 'admin', pass: 'admin123' };

    // Check auth status
    if (sessionStorage.getItem('adminAuth') === 'true') {
        showDashboard();
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        adminPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuth');
            dashboardSection.style.display = 'none';
            logoutBtn.style.display = 'none';
            loginSection.style.display = 'block';
            adminUser.value = '';
            adminPass.value = '';
            loginError.style.display = 'none';
        });
    }

    function handleLogin() {
        if (adminUser.value === ADMIN_CRED.user && adminPass.value === ADMIN_CRED.pass) {
            sessionStorage.setItem('adminAuth', 'true');
            loginError.style.display = 'none';
            showDashboard();
        } else {
            loginError.style.display = 'block';
            adminPass.value = '';
        }
    }

    function showDashboard() {
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        loadPreData();
        loadData();
        loadQueries();
    }

    function loadPreData() {
        if (!localStorage.getItem('esports_registrations')) {
            const demoData = [
                {
                    id: "1",
                    userName: "Alex Hunt",
                    squadName: "Team Alpha",
                    phone: "9876543210",
                    email: "alex@example.com",
                    transactionId: "TXN123456789",
                    timestamp: new Date().toLocaleString()
                },
                {
                    id: "2",
                    userName: "Sarah Connor",
                    squadName: "Terminators",
                    phone: "9123456780",
                    email: "sarah@skynet.com",
                    transactionId: "TXN987654321",
                    timestamp: new Date().toLocaleString()
                }
            ];
            localStorage.setItem('esports_registrations', JSON.stringify(demoData));
        }
    }

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : '';

    async function loadData() {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading data...</td></tr>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/squads`);
            const registrations = await response.json();

            totalCount.textContent = registrations.length;
            tableBody.innerHTML = '';

            if (registrations.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">No registrations found</td></tr>';
                return;
            }

            registrations.forEach((reg, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${registrations.length - index}</td>
                    <td>${escapeHTML(reg.userName)}</td>
                    <td style="color: var(--primary); font-weight: bold; letter-spacing: 1px;">${escapeHTML(reg.squadName)}</td>
                    <td>${escapeHTML(reg.phone)}</td>
                    <td>${escapeHTML(reg.email)}</td>
                    <td class="tx-id">${escapeHTML(reg.transactionId)}</td>
                    <td style="color: var(--text-muted); font-size: 0.9em;">${new Date(reg.createdAt).toLocaleString()}</td>
                    <td>
                        <button class="delete-btn" data-id="${reg._id}">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Add delete event listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    deleteRegistration(id);
                });
            });
        } catch (error) {
            console.error('Error loading data:', error);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red; padding: 30px;">Failed to load data. Ensure server is running.</td></tr>';
        }
    }

    async function deleteRegistration(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/register/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    loadData();
                } else {
                    alert('Failed to delete registration. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting data:', error);
                alert('Server error. Please try again later.');
            }
        }
    }

    clearBtn.addEventListener('click', async () => {
        if (confirm('WARNING: This will delete ALL registrations! Are you sure?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    loadData();
                } else {
                    alert('Failed to clear registrations.');
                }
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('Server error.');
            }
        }
    });

    const clearQueriesBtn = document.getElementById('clearQueriesBtn');
    if (clearQueriesBtn) {
        clearQueriesBtn.addEventListener('click', () => {
            if (confirm('WARNING: This will delete ALL community queries! Are you sure?')) {
                localStorage.removeItem('esports_queries');
                loadQueries();
            }
        });
    }

    function loadQueries() {
        const queriesBody = document.getElementById('queriesTableBody');
        if (!queriesBody) return;

        const queries = JSON.parse(localStorage.getItem('esports_queries')) || [];

        const totalQueriesCount = document.getElementById('totalQueriesCount');
        if (totalQueriesCount) {
            totalQueriesCount.textContent = queries.length;
        }

        queriesBody.innerHTML = '';

        if (queries.length === 0) {
            queriesBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No queries found</td></tr>';
            return;
        }

        queries.forEach((q, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${queries.length - index}</td>
                <td style="color: var(--primary); font-weight: bold;">${escapeHTML(q.name)}</td>
                <td>${escapeHTML(q.number)}</td>
                <td style="max-width: 300px; white-space: normal;">${escapeHTML(q.query)}</td>
                <td style="color: var(--text-muted); font-size: 0.9em;">${q.timestamp}</td>
                <td>
                    <button class="delete-query-btn delete-btn" data-id="${q.id}">Delete</button>
                </td>
            `;

            queriesBody.appendChild(row);
        });

        document.querySelectorAll('.delete-query-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteQuery(id);
            });
        });
    }

    function deleteQuery(id) {
        if (confirm('Are you sure you want to delete this query?')) {
            let queries = JSON.parse(localStorage.getItem('esports_queries')) || [];
            queries = queries.filter(q => q.id !== id);
            localStorage.setItem('esports_queries', JSON.stringify(queries));
            loadQueries();
        }
    }

    exportBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/squads`);
            const registrations = await response.json();

            if (registrations.length === 0) {
                alert('No data to export');
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Name,Squad Name,Phone,Email,Transaction ID,Date\n";

            registrations.forEach(reg => {
                const row = `"${reg.userName}","${reg.squadName}","${reg.phone}","${reg.email}","${reg.transactionId}","${reg.createdAt ? new Date(reg.createdAt).toLocaleString() : ''}"`;
                csvContent += row + "\r\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "tournament_registrations.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data.');
        }
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
