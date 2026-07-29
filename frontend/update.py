import os
import re

files = [
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/auth/login/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/auth/register/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/dashboard/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/dashboard/strategies/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/dashboard/strategies/nifty-martingale/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/dashboard/marketplace/page.tsx',
    '/Users/likhith/.gemini/antigravity/scratch/igris/frontend/src/app/dashboard/mission-control/page.tsx',
]

replacements = [
    (r'\$', '₹'),
    (r'bg-\[\#0a0a0a\]', ''),
    (r'bg-\[\#111111\]', ''),
    (r'bg-\[\#060a16\]', ''),
    (r'bg-gray-950', ''),
    (r'bg-gray-900(?![/\-])', ''),
    (r'bg-gray-900/50', 'bg-white/30'),
    (r'bg-gray-800/50', 'bg-white/30'),
    (r'text-white', 'text-[#1a1a2e]'),
    (r'text-gray-500', 'text-[#64748b]'),
    (r'text-gray-400', 'text-[#94a3b8]'),
    (r'text-\[\#22d3ee\]', 'text-[#7c3aed]'),
    (r'bg-\[\#22d3ee\]', 'bg-[#7c3aed]'),
    (r'text-\[\#22c55e\]', 'text-[#10b981]'),
    (r'bg-\[\#22c55e\]', 'bg-[#10b981]'),
    (r'border-gray-800', 'border-white/30'),
    (r'border-gray-900', 'border-white/30'),
    (r'border-\[\#1a1a1a\]', 'border-white/30'),
    (r'hover:bg-gray-900/30', 'hover:bg-[#7c3aed]/5'),
    (r'bg-black/80', 'bg-black/30 backdrop-blur-sm'),
    (r'bg-gray-800/20', 'bg-white/60'), 
    (r'bg-gray-900/20', 'bg-white/60'),
    (r'bg-black/50', 'bg-white/60'),
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    for k, v in replacements:
        content = re.sub(k, v, content)
        
    content = re.sub(r' +', ' ', content)
    content = content.replace('className=" ', 'className="')
    content = content.replace(' className="\"', ' className="')
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Processed: {filepath}")
