const fs = require("fs");
const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
    console.log("\n=== CyberDesk Toolkit ===");
    console.log("1. Password Strength Checker");
    console.log("2. Port Scanner (localhost)");
    console.log("3. File Organizer");
    console.log("4. Log Analyzer");
    console.log("5. Notes Manager");
    console.log("6. Exit");

    rl.question("Choose option: ", (choice) => {
        try {
            switch (choice) {
                case "1": passwordChecker(); break;
                case "2": portScanner(); break;
                case "3": fileOrganizer(); break;
                case "4": logAnalyzer(); break;
                case "5": notesManager(); break;
                case "6": rl.close(); break;
                default: menu();
            }
        } catch (e) {
            console.log("Error:", e.message);
            menu();
        }
    });
}

function passwordChecker() {
    rl.question("Enter password: ", (pwd) => {
        let score = 0;

        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        const levels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"];
        console.log("Strength:", levels[score]);

        menu();
    });
}

function portScanner() {
    rl.question("Start port: ", (start) => {
        rl.question("End port: ", (end) => {

            start = parseInt(start);
            end = parseInt(end);

            if (isNaN(start) || isNaN(end)) {
                console.log("Invalid ports");
                return menu();
            }

            let completed = 0;
            let total = end - start + 1;

            for (let port = start; port <= end; port++) {
                let socket = new net.Socket();
                socket.setTimeout(200);

                socket.on("connect", () => {
                    console.log("Open:", port);
                    socket.destroy();
                });

                socket.on("timeout", () => {
                    socket.destroy();
                });

                socket.on("error", () => {});

                socket.on("close", () => {
                    completed++;
                    if (completed === total) {
                        console.log("Scan complete");
                        menu();
                    }
                });

                socket.connect(port, "127.0.0.1");
            }
        });
    });
}

function fileOrganizer() {
    rl.question("Enter folder path: ", (path) => {
        try {
            let files = fs.readdirSync(path);

            files.forEach(file => {
                let fullPath = `${path}/${file}`;

                if (fs.lstatSync(fullPath).isFile()) {

                    let parts = file.split(".");
                    let ext = parts.length > 1 ? parts.pop() : "others";

                    let dir = `${path}/${ext}`;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    fs.renameSync(fullPath, `${dir}/${file}`);
                }
            });

            console.log("Files organized!");
        } catch (e) {
            console.log("Error:", e.message);
        }

        menu();
    });
}

function logAnalyzer() {
    rl.question("Enter log file path: ", (file) => {
        try {
            let data = fs.readFileSync(file, "utf-8");
            let lines = data.split("\n");

            let suspicious = lines.filter(line =>
                line.toLowerCase().includes("error") ||
                line.toLowerCase().includes("failed") ||
                line.toLowerCase().includes("unauthorized")
            );

            console.log("Suspicious entries:");
            suspicious.forEach(l => console.log(l));

        } catch (e) {
            console.log("Error:", e.message);
        }

        menu();
    });
}

function notesManager() {
    const file = "notes.json";

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]");
    }

    let notes = JSON.parse(fs.readFileSync(file));

    console.log("\n1. Add Note\n2. View Notes\n3. Delete Note");

    rl.question("Choose: ", (opt) => {
        try {
            if (opt === "1") {
                rl.question("Enter note: ", (n) => {
                    notes.push(n);
                    fs.writeFileSync(file, JSON.stringify(notes, null, 2));
                    console.log("Saved!");
                    menu();
                });

            } else if (opt === "2") {
                notes.forEach((n, i) => console.log(i + ": " + n));
                menu();

            } else if (opt === "3") {
                rl.question("Index: ", (i) => {
                    i = parseInt(i);

                    if (!isNaN(i) && i >= 0 && i < notes.length) {
                        notes.splice(i, 1);
                        fs.writeFileSync(file, JSON.stringify(notes, null, 2));
                        console.log("Deleted!");
                    } else {
                        console.log("Invalid index");
                    }

                    menu();
                });

            } else {
                menu();
            }

        } catch (e) {
            console.log("Error:", e.message);
            menu();
        }
    });
}

menu();