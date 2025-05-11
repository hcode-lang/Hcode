let commandMap = [];

async function loadLibrary(name) {
  try {
    const commands = await fetch(name + "/commands.txt").then(r => r.text());
    const functions = await fetch(name + "/functions.txt").then(r => r.text());

    const commandLines = commands.trim().split("\n");
    const functionLines = functions.trim().split("\n");

    for (let i = 0; i < commandLines.length; i++) {
      commandMap.push({
        regex: new RegExp("^" + commandLines[i] + "$"),
        code: functionLines[i]
      });
    }
  } catch (err) {
    console.error(`ERR: Library "${name}" was not found.`);
  }
}

function interpretLine(line) {
  for (const entry of commandMap) {
    const match = line.match(entry.regex);
    if (match) {
      let result = entry.code;
      match.slice(1).forEach((val, i) => {
        result = result.replace(`$${i + 1}`, val);
      });
      eval(result);
      return;
    }
  }

  // Dahili komutlar (örnek: yaz)
  if (line.startsWith("say(")) {
    const msg = line.match(/yaz"(.*)"/)?.[1];
    if (msg) console.log(msg);
  }
}

async function runHCode(code) {
  const lines = code.split("\n").map(l => l.trim()).filter(Boolean);
  for (let line of lines) {
    if (line.startsWith("import ")) {
      const libName = line.split(" ")[1];
      await loadLibrary(libName);
    } else {
      interpretLine(line);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const scripts = document.querySelectorAll('script[type="text/hcode"]');
  scripts.forEach(script => {
    runHCode(script.textContent);
  });
});
