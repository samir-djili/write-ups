const fs = require('fs').promises;
const { serializeCircuit } = require('./utils');

async function testCircuit() {
    // Test different circuit configurations
    const program = await fs.readFile('./programs/nand_checker.bin');
    
    // Create test input/output states
    const inputState = new Uint16Array([0xffff, 0x0000, 0xffff, 0x0000]);
    const outputState = new Uint16Array([0x0000, 0xffff, 0x0000, 0xffff]);
    
    console.log('Input state:', Array.from(inputState).map(x => x.toString(16)));
    console.log('Output state:', Array.from(outputState).map(x => x.toString(16)));
    
    // Test 1: Empty circuit
    let circuit = [];
    let memory = serializeCircuit(circuit, program, inputState, outputState);
    console.log('\nEmpty circuit memory at 0x1000-0x100F:', Array.from(new Uint16Array(memory.buffer, 0x1000, 8)).map(x => x.toString(16)));
    console.log('Memory at 0x2000-0x200F:', Array.from(new Uint16Array(memory.buffer, 0x2000, 8)).map(x => x.toString(16)));
    
    // Test 2: Simple NAND circuit - NOT gates for each input
    // Assuming input nodes are 5,6,7,8 and output nodes are 1,2,3,4
    circuit = [
        {input1: 5, input2: 5, output: 9},   // NOT input 1
        {input1: 6, input2: 6, output: 10},  // NOT input 2
        {input1: 7, input2: 7, output: 11},  // NOT input 3
        {input1: 8, input2: 8, output: 12},  // NOT input 4
        {input1: 9, input2: 9, output: 1},   // Connect to output 1
        {input1: 10, input2: 10, output: 2}, // Connect to output 2
        {input1: 11, input2: 11, output: 3}, // Connect to output 3
        {input1: 12, input2: 12, output: 4}  // Connect to output 4
    ];
    
    memory = serializeCircuit(circuit, program, inputState, outputState);
    console.log('\nNOT circuit memory at 0x3000-0x301F:', Array.from(new Uint16Array(memory.buffer, 0x3000, 16)).map(x => x.toString(16)));
}

testCircuit().catch(console.error);
