// Test script to find the correct circuit for FLAG2
const fs = require('fs').promises;
const { serializeCircuit } = require('./utils');
const { runCPU } = require('./cpu');

async function testFlag2() {
    console.log('Testing different circuit configurations for FLAG2...\n');
    
    const program = await fs.readFile('./programs/nand_checker.bin');
    
    // Test with fixed input/output states to understand the pattern
    const inputState = new Uint16Array([0xffff, 0x0000, 0xffff, 0x0000]);
    const outputState = new Uint16Array([0x0000, 0xffff, 0x0000, 0xffff]); // Inverse of input
    
    console.log('Input state:', Array.from(inputState).map(x => x.toString(16)));
    console.log('Expected output state:', Array.from(outputState).map(x => x.toString(16)));
    
    // Test different circuit configurations
    const testCases = [
        {
            name: "Empty circuit",
            circuit: []
        },
        {
            name: "Identity circuit (passthrough)",
            circuit: [
                {input1: 5, input2: 5, output: 1}, // Input 1 -> Output 1
                {input1: 6, input2: 6, output: 2}, // Input 2 -> Output 2  
                {input1: 7, input2: 7, output: 3}, // Input 3 -> Output 3
                {input1: 8, input2: 8, output: 4}  // Input 4 -> Output 4
            ]
        },
        {
            name: "NOT gates (inversion)",
            circuit: [
                {input1: 5, input2: 5, output: 9},   // NOT input 1
                {input1: 6, input2: 6, output: 10},  // NOT input 2
                {input1: 7, input2: 7, output: 11},  // NOT input 3
                {input1: 8, input2: 8, output: 12},  // NOT input 4
                {input1: 9, input2: 9, output: 1},   // Connect NOT 1 to output 1
                {input1: 10, input2: 10, output: 2}, // Connect NOT 2 to output 2
                {input1: 11, input2: 11, output: 3}, // Connect NOT 3 to output 3
                {input1: 12, input2: 12, output: 4}  // Connect NOT 4 to output 4
            ]
        },
        {
            name: "Simpler NOT (direct)",
            circuit: [
                {input1: 5, input2: 5, output: 1},   // NOT input 1 -> output 1
                {input1: 6, input2: 6, output: 2},   // NOT input 2 -> output 2
                {input1: 7, input2: 7, output: 3},   // NOT input 3 -> output 3
                {input1: 8, input2: 8, output: 4}    // NOT input 4 -> output 4
            ]
        },
        {
            name: "Alternative node numbering",
            circuit: [
                {input1: 1, input2: 1, output: 5},   // Assuming different numbering
                {input1: 2, input2: 2, output: 6},
                {input1: 3, input2: 3, output: 7},
                {input1: 4, input2: 4, output: 8}
            ]
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        
        try {
            const memory = serializeCircuit(testCase.circuit, program, inputState, outputState);
            const flag = runCPU(memory);
            
            console.log(`Flag result: ${flag}`);
            
            // Check what's written at 0x1000
            const result = memory[0x1000] | (memory[0x1001] << 8);
            console.log(`Memory result: 0x${result.toString(16)} (${result})`);
            
            if (flag) {
                console.log('🎉 FLAG2 found with circuit:', JSON.stringify(testCase.circuit));
                break;
            } else if (result === 0x1337) {
                console.log('📍 FLAG1 condition found');
            } else if (result === 0x3333) {
                console.log('❌ Wrong answer condition');
            }
            
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

testFlag2().catch(console.error);
