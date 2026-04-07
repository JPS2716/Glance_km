import re

files = ["index.html", "upload.html", "results.html"]
for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    content = re.sub(r'<script id="tailwind-config">.*?</script>', '<script src="tailwind-config.js"></script>', content, flags=re.DOTALL)
    content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="styles.css" />\n<script src="main.js" defer></script>', content, flags=re.DOTALL)
    
    if f == "index.html":
        content = content.replace('onclick="window.location.href=\'upload.html\'"', 'id="upload-redirect-btn"')
    elif f == "upload.html":
        content = content.replace('onclick="window.location.href=\'results.html\'"', 'id="results-redirect-btn"')
        
    with open(f, "w") as file:
        file.write(content)
print("Done")
