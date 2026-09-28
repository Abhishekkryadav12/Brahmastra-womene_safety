const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/SOSButton.tsx', 'utf8');
const startIdx = c.indexOf('const handleConfirmSOS = async () => {');
const endIdx = c.indexOf('setShowConfirmation(false);', startIdx) + 'setShowConfirmation(false);'.length;

const replacement = `const handleConfirmSOS = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const response = await fetch(\`\${(import.meta.env.VITE_API_URL || "").replace(/\\/$/, "")}/api/send-sos\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user?.name || "Unknown user",
          location: "Malout",
          contacts: ["+918740852097"], 
          userId: user?._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.error("🚨 SOS ACTIVATED! Emergency contacts notified!");
      } else {
        toast.error("❌ Failed to send SOS message!");
      }
    } catch (error) {
      toast.error("⚠️ Error connecting to server");
    }

    setShowConfirmation(false);`;

c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
fs.writeFileSync('frontend/src/components/SOSButton.tsx', c);
