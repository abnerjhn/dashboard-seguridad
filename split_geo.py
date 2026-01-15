
import os

def split_file(filepath, chunk_size_mb=45):
    """Splits a file into chunks of specified size in MB."""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    file_size = os.path.getsize(filepath)
    limit_bytes = chunk_size_mb * 1024 * 1024

    if file_size <= limit_bytes:
        print(f"Skipping {filepath}: smaller than {chunk_size_mb}MB")
        return

    print(f"Splitting {filepath} ({file_size / (1024*1024):.2f} MB)...")
    
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)
    dirname = os.path.dirname(filepath)
    
    # Text mode splitting to preserve characters
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        part_num = 1
        current_size = 0
        current_lines = []
        
        for line in f:
            line_size = len(line.encode('utf-8'))
            if current_size + line_size > limit_bytes:
                # Flush
                part_name = f"{name}_part{part_num}{ext}"
                part_path = os.path.join(dirname, part_name)
                with open(part_path, 'w', encoding='utf-8') as part_file:
                    part_file.writelines(current_lines)
                
                print(f"Created {part_name}")
                part_num += 1
                current_lines = []
                current_size = 0
            
            current_lines.append(line)
            current_size += line_size
        
        # Flush last
        if current_lines:
            part_name = f"{name}_part{part_num}{ext}"
            part_path = os.path.join(dirname, part_name)
            with open(part_path, 'w', encoding='utf-8') as part_file:
                part_file.writelines(current_lines)
            print(f"Created {part_name}")
            
    print(f"Finished splitting {filepath}")
    # Remove original to avoid Git rejection
    os.remove(filepath)
    print(f"Deleted original {filepath}")

if __name__ == "__main__":
    base_dir = r"c:\web_antigravity\reportes_delicuencia\public\data\geo"
    targets = ["comunas.json", "Provincias.json", "Regional.json"]
    
    for t in targets:
        split_file(os.path.join(base_dir, t))
