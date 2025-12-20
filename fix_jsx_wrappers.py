#!/usr/bin/env python3
"""
Fix JSX files that have Alert/Button elements without proper parent wrappers
"""

import re
from pathlib import Path

# Base directory
BASE_DIR = Path(r"C:\Users\surya\OneDrive\Desktop\multilevel\react-user-panel\src\pages")

# Files with errors based on build output
FILES_TO_FIX = [
    "rank/Achievements.tsx",
]

def fix_error_return(content):
    """Fix error return statements that have Alert + Button without wrapper"""
    # Pattern to match error returns without wrapper
    pattern = r'(if \([^)]+\) \{\s*return \(\s*)\n(\s*<Alert[^>]*>.*?</Alert>\s*\n\s*<Button[^>]*>.*?</Button>\s*)\n(\s*\);\s*\})'

    def replacer(match):
        prefix = match.group(1)
        jsx_content = match.group(2)
        suffix = match.group(3)

        # Add Box wrapper
        return f'''{prefix}
      <Box>
{jsx_content}
      </Box>
{suffix}'''

    return re.sub(pattern, replacer, content, flags=re.DOTALL)

def main():
    """Main execution."""
    print("=" * 60)
    print("JSX Wrapper Fix Script")
    print("=" * 60)
    print()

    for relative_path in FILES_TO_FIX:
        filepath = BASE_DIR / relative_path

        if not filepath.exists():
            print(f"[X] File not found: {relative_path}")
            continue

        print(f"Processing: {relative_path}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content
            content = fix_error_return(content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  [OK] Fixed successfully")
            else:
                print(f"  [-] No changes needed")

        except Exception as e:
            print(f"  [ERROR] {e}")

    print()
    print("=" * 60)
    print("Done!")
    print("=" * 60)

if __name__ == "__main__":
    main()
