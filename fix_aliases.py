import json

# Load names.txt
with open('names.txt', 'r') as f:
    names = [line.strip() for line in f if line.strip()]

# Load restaurant_aliases.json
with open('restaurant_aliases.json', 'r') as f:
    aliases = json.load(f)

# Helper to add base name as alias
for name in names:
    if ' - ' in name:
        base = name.split(' - ')[0].strip()
        # If entry exists, add base if not present
        if name in aliases:
            if base not in aliases[name]:
                aliases[name].append(base)
        else:
            aliases[name] = [name, base]

# Save back
with open('restaurant_aliases.json', 'w') as f:
    json.dump(aliases, f, indent=2, ensure_ascii=False)
