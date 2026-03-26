import json
import re
import glob

for file in glob.glob("src/data/nifty-*.ts"):
    if "index.ts" in file: continue
    with open(file, 'r') as f:
        content = f.read()
        
    start = content.find('[', content.find('='))
    end = content.rfind(']') + 1
    array_str = content[start:end]
    
    # Remove // comments
    array_str = re.sub(r'//.*', '', array_str)
    
    # JS object strings to JSON strings
    array_str = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', array_str)
    # Remove trailing commas
    array_str = re.sub(r',\s*\}', r'}', array_str)
    array_str = re.sub(r',\s*\]', r']', array_str)
    
    try:
        data = json.loads(array_str)
        with open(file.replace('.ts', '.json'), 'w') as out:
            json.dump(data, out, indent=2)
        print(f"Successfully converted {file}")
    except Exception as e:
        print(f"Failed {file}: {e}")
