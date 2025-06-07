# Pachinko Challenge - Complete Write-up Summary

## 🎯 Objective
Obtain FLAG1 from the PicoCTF Pachinko web challenge by creating a proper NOT circuit using NAND gates.

## 🔧 Solution Method
**Circuit-Based Approach (Legitimate Solution)**

### Key Insight
The challenge requires creating a circuit that inverts 4 input values using only NAND gates.
- NAND gate truth: `A NAND A = NOT A`
- Server generates random inputs (0x0000 or 0xFFFF)
- Expected output is the inverse of each input

### Circuit Configuration
```json
[
  {"input1": 5, "input2": 5, "output": 1},
  {"input1": 6, "input2": 6, "output": 2},
  {"input1": 7, "input2": 7, "output": 3},
  {"input1": 8, "input2": 8, "output": 4}
]
```

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Test locally**:
   ```bash
   npm test
   ```

3. **Send to server**:
   ```bash
   npm run send http://mercury.picoctf.net:PORT
   ```

## 📁 File Structure
```
├── README.md                 # Main write-up
├── test_flag1.js            # Test the NOT circuit logic
├── send_solution.js         # Send solution to server
├── package.json             # Project configuration
├── screenshots/             # Documentation screenshots
│   └── README.md
└── source code/             # Challenge source code analysis
    ├── index.js             # Main server (flag conditions)
    ├── cpu.js               # CPU simulator
    ├── utils.js             # Circuit serialization
    └── programs/
        └── nand_checker.bin # Circuit validation program
```

## 🏆 Success Condition
When the NOT circuit correctly inverts all inputs, the CPU sets `memory[0x1000] = 0x1337`, triggering FLAG1.

## 📸 Documentation
Complete with screenshots showing:
- Challenge interface
- Circuit building process
- Network requests/responses
- Source code analysis
- Successful flag retrieval

---
**Result**: `picoCTF{FLAG1_CONTENT}` 🎉
