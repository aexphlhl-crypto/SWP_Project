import os
import re
import json

app_ex_pattern = re.compile(r'AppException\.(badRequest|notFound|unauthorized|forbidden|internalServerError)\(\s*"(.*?)"\s*\)')
api_res_pattern = re.compile(r'ApiResponse\.error\(\s*".*?"\s*,\s*"(.*?)"\s*\)')

strings = set()
for root, dirs, files in os.walk(r'C:\Users\Dell\Downloads\SWP_Project-develop (1)\SWP_Project-develop\backend\src'):
    for file in files:
        if file.endswith('.java'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                for match in app_ex_pattern.finditer(content):
                    strings.add(match.group(2))
                for match in api_res_pattern.finditer(content):
                    strings.add(match.group(1))

print(json.dumps(list(strings), indent=2))
