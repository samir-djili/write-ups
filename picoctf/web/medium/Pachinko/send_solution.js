// Script to send the NOT circuit solution to the Pachinko challenge server
// Usage: node send_solution.js <server_url>
// Example: node send_solution.js http://mercury.picoctf.net:34574

const axios = require('axios');

async function sendFlag1Solution(serverUrl) {
    console.log(`Sending FLAG1 solution to: ${serverUrl}`);
    
    // NOT circuit configuration
    // Each input is NAND'ed with itself to create NOT logic
    const notCircuit = [
        {"input1": 5, "input2": 5, "output": 1},  // NOT Input 5 -> Output 1
        {"input1": 6, "input2": 6, "output": 2},  // NOT Input 6 -> Output 2
        {"input1": 7, "input2": 7, "output": 3},  // NOT Input 7 -> Output 3
        {"input1": 8, "input2": 8, "output": 4}   // NOT Input 8 -> Output 4
    ];
    
    try {
        console.log('\nSending circuit configuration:');
        console.log(JSON.stringify(notCircuit, null, 2));
        
        const response = await axios.post(`${serverUrl}/check`, {
            circuit: notCircuit
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
          console.log('\n🎉 Response received:');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        
        // Check if we got a flag in the response
        const responseText = JSON.stringify(response.data);
        if (responseText.includes('picoCTF{') || (response.data.flag && response.data.flag.includes('picoCTF{'))) {
            console.log('\n✅ FLAG1 obtained successfully!');
            
            // Extract and display the flag
            if (response.data.flag) {
                console.log(`🚩 Flag: ${response.data.flag.trim()}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error sending solution:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Get server URL from command line arguments
const serverUrl = process.argv[2];
if (!serverUrl) {
    console.log('Usage: node send_solution.js <server_url>');
    console.log('Example: node send_solution.js http://mercury.picoctf.net:34574');
    process.exit(1);
}

sendFlag1Solution(serverUrl);
