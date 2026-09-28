const fs = require('fs');
let c = fs.readFileSync('backend/src/server.js', 'utf8');

const startStr = '// Custom emergency alert message';
const startIdx = c.indexOf(startStr);
const endIdx = c.indexOf('if (!client)', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `// Using a predefined template to bypass Twilio India Trial restrictions
    const messageBody = "sms_appointment_reminders";\n\n    `;
    c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
    fs.writeFileSync('backend/src/server.js', c);
}
