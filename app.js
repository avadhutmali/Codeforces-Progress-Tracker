// Store problems in localStorage
let problems = JSON.parse(localStorage.getItem('cfProblems')) || [];
let solved = new Set(); // Stores solved problem IDs

// Fetch solved problems via Codeforces API
async function loadSolvedProblems() {
    const handle = document.getElementById('cfHandle').value.trim();
    if (!handle) return alert("Enter your Codeforces handle!");

    try {
        // Use CORS proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `https://codeforces.com/api/user.status?handle=${handle}`;
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

        if (!response.ok) throw new Error("Failed to fetch data from Codeforces API");

        const data = await response.json();
        if (data.status !== 'OK') throw new Error(data.comment || "API error");

        data.result.forEach(submission => {
            if (submission.verdict === 'OK') {
                const problemId = `${submission.problem.contestId}${submission.problem.index}`;
                solved.add(problemId);
            }
        });
        refreshProblemList();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Add problem to tracker
function addProblem() {
    const input = document.getElementById('problemInput').value.trim();
    const rating = document.getElementById('problemRating').value.trim();
    const topic = document.getElementById('problemTopic').value;
    const match = input.match(/(\d+)([A-Za-z]+)/); // Extract contest ID and problem code (e.g., 1433C)
    if (!match) return alert("Invalid problem code!");

    const contestId = match[1];
    const problemCode = match[2].toUpperCase();
    const problemId = `${contestId}${problemCode}`;

    // Check if problem already exists
    if (problems.some(p => p.id === problemId)) return alert("Problem already added!");

    // Add problem with id, rating, and topic
    problems.push({ id: problemId, rating, topic });
    localStorage.setItem('cfProblems', JSON.stringify(problems));
    refreshProblemList();
}

// Render problem list
function refreshProblemList() {
    const sections = document.getElementById('sections');
    sections.innerHTML = '';

    // Group problems by topic
    const grouped = problems.reduce((acc, problem) => {
        if (!acc[problem.topic]) acc[problem.topic] = [];
        acc[problem.topic].push(problem);
        return acc;
    }, {});

    // Render each section
    Object.entries(grouped).forEach(([topic, problems]) => {
        const section = document.createElement('div');
        section.className = 'section';
        section.innerHTML = `<h2>${topic}</h2>`;
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Problem</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${problems.map(problem => `
                    <tr class="${solved.has(problem.id) ? 'solved' : ''}">
                        <td>
                            <a href="https://codeforces.com/problemset/problem/${problem.id.slice(0, -1)}/${problem.id.slice(-1)}" target="_blank">
                                Problem ${problem.id}
                            </a>
                        </td>
                        <td>${solved.has(problem.id) ? '✅ Solved' : '❌ Unsolved'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        section.appendChild(table);
        sections.appendChild(section);
    });
}
// localStorage.removeItem('cfProblems');
// Initial load
refreshProblemList();