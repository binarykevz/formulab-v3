window.teamModule = {
    async render() {
        const { esc } = Utils;
        try {
            const users = await API.getTeam();
            document.getElementById('tab-team').innerHTML = `
                <div class="card"><div class="card-header"><h3><i class="fas fa-users"></i> Team Members</h3></div>
                <div class="card-body"><div class="table-wrap"><table><thead><tr><th>Username</th><th>Email</th><th>Department</th><th>Joined</th></tr></thead>
                <tbody>${users.map(u => `<tr>
                    <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:32px;height:32px;font-size:13px">${u.username?.charAt(0).toUpperCase()}</div><strong>${esc(u.username)}</strong></div></td>
                    <td>${esc(u.email)}</td><td><span class="dept-badge">${esc(u.department)}</span></td>
                    <td>${new Date(u.created_at).toLocaleDateString()}</td></tr>`).join('')}
                </tbody></table></div></div></div>`;
        } catch { document.getElementById('tab-team').innerHTML = '<div class="empty-state"><p>Could not load team</p></div>'; }
    }
};
