"""
Encoding schemes for the /encode Discord command
"""

# Braille mappings
BRAILLE_MAP = {
    'A': '⠁', 'B': '⠃', 'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋', 'G': '⠛', 'H': '⠓',
    'I': '⠊', 'J': '⠚', 'K': '⠅', 'L': '⠇', 'M': '⠍', 'N': '⠝', 'O': '⠕', 'P': '⠏',
    'Q': '⠟', 'R': '⠗', 'S': '⠎', 'T': '⠞', 'U': '⠥', 'V': '⠧', 'W': '⠺', 'X': '⠭',
    'Y': '⠽', 'Z': '⠵',
    '0': '⠼⠚', '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋',
    '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊',
    ' ': '⠀'  # Braille space
}

# Morse code mappings
MORSE_CODE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....',
    '7': '--...', '8': '---..', '9': '----.',
    ' ': '/'  # Standard separator for words in Morse code
}

# NATO phonetic alphabet
NATO_ALPHABET_MAP = {
    'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo', 'F': 'Foxtrot',
    'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
    'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo',
    'S': 'Sierra', 'T': 'Tango', 'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
    'Y': 'Yankee', 'Z': 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
    '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
    ' ': 'Space'
}

# Semaphore flag positions (descriptions)
SEMAPHORE_MAP = {
    'A': 'Right down, left down-right', 'B': 'Right up, left down-right', 'C': 'Right up-right, left down-right',
    'D': 'Right up-left, left down-right', 'E': 'Right up-left, left down', 'F': 'Right up, left down',
    'G': 'Right up-right, left down', 'H': 'Right down-right, left down', 'I': 'Right down-left, left down',
    'J': 'Right up, left up-right', 'K': 'Right down, left up', 'L': 'Right down-right, left up',
    'M': 'Right down-left, left up', 'N': 'Right down-left, left up-right', 'O': 'Right down, left up-right',
    'P': 'Right up, left up', 'Q': 'Right up-right, left up', 'R': 'Right up-left, left up',
    'S': 'Right up-left, left up-right', 'T': 'Right up, left up-left', 'U': 'Right up-right, left up-left',
    'V': 'Right down, left up-left', 'W': 'Right up-right, left up-right', 'X': 'Right down-right, left up-left',
    'Y': 'Right up-left, left up-left', 'Z': 'Right down-left, left up-left',
    '1': 'Right down, left down-right (then A)', '2': 'Right up, left down-right (then B)',
    '3': 'Right up-right, left down-right (then C)', '4': 'Right up-left, left down-right (then D)',
    '5': 'Right up-left, left down (then E)', '6': 'Right up, left down (then F)',
    '7': 'Right up-right, left down (then G)', '8': 'Right down-right, left down (then H)',
    '9': 'Right down-left, left down (then I)', '0': 'Right up, left up-right (then J)',
    ' ': 'Rest position'
}

# Resistor color codes
RESISTOR_COLOR_MAP = {
    '0': 'Black', '1': 'Brown', '2': 'Red', '3': 'Orange', '4': 'Yellow',
    '5': 'Green', '6': 'Blue', '7': 'Violet', '8': 'Gray', '9': 'White'
}

# Maritime signal flags
MARITIME_FLAGS_MAP = {
    'A': 'Alpha (white and blue swallow-tail)', 'B': 'Bravo (red)', 'C': 'Charlie (horizontal blue-white-red-white-blue)',
    'D': 'Delta (yellow with blue vertical stripe)', 'E': 'Echo (blue over red)', 'F': 'Foxtrot (red diamond on white)',
    'G': 'Golf (vertical yellow-blue-yellow-blue-yellow-blue)', 'H': 'Hotel (vertical white-red)',
    'I': 'India (yellow circle on black)', 'J': 'Juliet (horizontal blue-white-blue)',
    'K': 'Kilo (vertical yellow-blue)', 'L': 'Lima (vertical yellow-black-yellow-black)',
    'M': 'Mike (blue X on white)', 'N': 'November (blue-white checkered)', 'O': 'Oscar (diagonal yellow-red)',
    'P': 'Papa (blue square on white)', 'Q': 'Quebec (solid yellow)', 'R': 'Romeo (red cross on yellow)',
    'S': 'Sierra (white square on blue)', 'T': 'Tango (vertical red-white-blue)',
    'U': 'Uniform (red and white checkered)', 'V': 'Victor (red X on white)',
    'W': 'Whiskey (white square in blue center)', 'X': 'X-ray (white cross on blue)',
    'Y': 'Yankee (diagonal red-yellow stripes)', 'Z': 'Zulu (diagonal black-yellow-red-blue)',
    '0': 'Pennant Zero (horizontal yellow-red-yellow-red-yellow)', '1': 'Pennant One (white with red dot)',
    '2': 'Pennant Two (blue with white circle)', '3': 'Pennant Three (red-white-red horizontal)',
    '4': 'Pennant Four (red with white X)', '5': 'Pennant Five (yellow over blue)',
    '6': 'Pennant Six (black with white square)', '7': 'Pennant Seven (yellow with red square)',
    '8': 'Pennant Eight (white with red square)', '9': 'Pennant Nine (solid red with white dot)',
    ' ': 'No flag'
}

# American Sign Language descriptions (basic hand positions)
ASL_MAP = {
    'A': 'Closed fist with thumb to side', 'B': 'Open palm with fingers up, thumb across palm',
    'C': 'Curved hand forming C shape', 'D': 'Index finger up, thumb and middle finger touching',
    'E': 'Fingers bent over thumb', 'F': 'Index and thumb touching, other fingers up',
    'G': 'Index finger pointing sideways', 'H': 'Two fingers pointing sideways',
    'I': 'Pinky finger up', 'J': 'Pinky up, hook motion', 'K': 'Two fingers up in V, thumb between',
    'L': 'Thumb and index in L shape', 'M': 'Thumb under three fingers',
    'N': 'Thumb under two fingers', 'O': 'Fingers and thumb forming O',
    'P': 'Index and middle down, thumb between', 'Q': 'Thumb and index down',
    'R': 'Two fingers crossed', 'S': 'Closed fist with thumb over fingers',
    'T': 'Thumb between index and middle', 'U': 'Two fingers up together',
    'V': 'Two fingers in V shape', 'W': 'Three fingers up', 'X': 'Index finger hooked',
    'Y': 'Thumb and pinky out', 'Z': 'Index finger tracing Z in air',
    '1': 'Index finger up', '2': 'Two fingers up in V', '3': 'Three fingers up',
    '4': 'Four fingers up', '5': 'Five fingers spread', '6': 'Three fingers up, pinky and thumb touching',
    '7': 'Three fingers up, ring and thumb touching', '8': 'Three fingers up, middle and thumb touching',
    '9': 'Thumb touching index, circle', '0': 'Thumb and index in O shape',
    ' ': 'Open palm'
}

def encode_text(text: str, encoding_scheme: str) -> str:
    """Encode text using the specified encoding scheme."""
    text = text.upper()
    encoded_chars = []

    if encoding_scheme == "braille":
        for char in text:
            encoded_chars.append(BRAILLE_MAP.get(char, '?'))
        return "".join(encoded_chars)
    
    elif encoding_scheme == "morse":
        for char in text:
            encoded_chars.append(MORSE_CODE_MAP.get(char, '?'))
        return " ".join(encoded_chars)
    
    elif encoding_scheme == "ascii":
        for char in text:
            if char == ' ':
                encoded_chars.append('32')
            else:
                encoded_chars.append(str(ord(char)))
        return " ".join(encoded_chars)
    
    elif encoding_scheme == "ordinal":
        for char in text:
            if char == ' ':
                encoded_chars.append('0')  # Space as 0
            elif char.isalpha():
                encoded_chars.append(str(ord(char) - ord('A') + 1))
            elif char.isdigit():
                encoded_chars.append(char)  # Numbers stay as numbers
            else:
                encoded_chars.append('?')
        return " ".join(encoded_chars)
    
    elif encoding_scheme == "rot13":
        for char in text:
            if char.isalpha():
                shifted = ord(char) - ord('A')
                shifted = (shifted + 13) % 26
                encoded_chars.append(chr(shifted + ord('A')))
            else:
                encoded_chars.append(char)
        return "".join(encoded_chars)
    
    elif encoding_scheme == "ternary":
        for char in text:
            if char == ' ':
                encoded_chars.append('100')  # Space as base-3 for 32 (space ASCII)
            else:
                decimal_val = ord(char)
                ternary = ""
                if decimal_val == 0:
                    ternary = "0"
                else:
                    while decimal_val > 0:
                        ternary = str(decimal_val % 3) + ternary
                        decimal_val //= 3
                encoded_chars.append(ternary)
        return " ".join(encoded_chars)
    
    elif encoding_scheme == "resistor":
        for char in text:
            if char.isdigit():
                encoded_chars.append(RESISTOR_COLOR_MAP.get(char, '?'))
            elif char.isalpha():
                # Convert letter to ordinal, then to colors
                ordinal = ord(char) - ord('A') + 1
                color_sequence = []
                if ordinal >= 10:
                    color_sequence.append(RESISTOR_COLOR_MAP.get(str(ordinal // 10), '?'))
                color_sequence.append(RESISTOR_COLOR_MAP.get(str(ordinal % 10), '?'))
                encoded_chars.append("-".join(color_sequence))
            elif char == ' ':
                encoded_chars.append('(Space)')
            else:
                encoded_chars.append('?')
        return " / ".join(encoded_chars)
    
    elif encoding_scheme == "nato":
        for char in text:
            encoded_chars.append(NATO_ALPHABET_MAP.get(char, '?'))
        return " ".join(encoded_chars)
    
    elif encoding_scheme == "semaphore":
        for char in text:
            encoded_chars.append(SEMAPHORE_MAP.get(char, '?'))
        return " | ".join(encoded_chars)
    
    elif encoding_scheme == "maritime":
        for char in text:
            encoded_chars.append(MARITIME_FLAGS_MAP.get(char, '?'))
        return " | ".join(encoded_chars)
    
    elif encoding_scheme == "asl":
        for char in text:
            encoded_chars.append(ASL_MAP.get(char, '?'))
        return " | ".join(encoded_chars)
    
    else:
        return "Unsupported encoding scheme."

def get_encoding_choices():
    """Return the list of encoding choices for Discord command."""
    return [
        {"name": "Braille", "value": "braille"},
        {"name": "Morse Code", "value": "morse"},
        {"name": "ASCII Codepoint", "value": "ascii"},
        {"name": "Alphabet Ordinal (A=1, B=2...)", "value": "ordinal"},
        {"name": "ROT13", "value": "rot13"},
        {"name": "Ternary (Base 3)", "value": "ternary"},
        {"name": "Resistor Colors", "value": "resistor"},
        {"name": "NATO Phonetic Alphabet", "value": "nato"},
        {"name": "Semaphore Flags", "value": "semaphore"},
        {"name": "Maritime Signal Flags", "value": "maritime"},
        {"name": "American Sign Language", "value": "asl"}
    ] 