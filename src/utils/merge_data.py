import pandas as pd
import os
import io

# Paths
file1 = 'c:/web_antigravity/reportes_delicuencia/DATOS/DelitoFrecuencia_CEADD_2005_2014.csv'
file2 = 'c:/web_antigravity/reportes_delicuencia/DATOS/DelitoFrecuencia_CEADD_2015_2024.csv'
output_path = 'c:/web_antigravity/reportes_delicuencia/public/data/combined_historical.csv'

def read_clean_csv(filepath):
    print(f"Processing {filepath}...")
    # Read as text first to find header
    with open(filepath, 'r', encoding='latin-1') as f:
        lines = f.readlines()

    header_idx = -1
    for i, line in enumerate(lines):
        if "GRUPO DELICTUAL" in line or "DELITO" in line:
            header_idx = i
            break
    
    if header_idx == -1:
        print(f"Could not find header in {filepath}")
        return None

    print(f"Found header at line {header_idx}")
    
    # Read properly skipping bad lines
    # We use io.StringIO to parse the cleaner part
    content = "".join(lines[header_idx:])
    
    # Use pandas to read
    try:
        df = pd.read_csv(io.StringIO(content), sep=',')
        # Clean col names
        df.columns = [c.strip() for c in df.columns]
        return df
    except Exception as e:
        print(f"Error parsing dataframe: {e}")
        return None

# Redirect output to file
import sys

with open('c:/web_antigravity/reportes_delicuencia/debug_merge.txt', 'w', encoding='utf-8') as log_file:
    sys.stdout = log_file

    df1 = read_clean_csv(file1)
    df2 = read_clean_csv(file2)

    if df1 is not None:
        print("--- DF1 Info ---")
        print(df1.columns.tolist())
        print(df1.dtypes)

    if df2 is not None:
        print("--- DF2 Info ---")
        print(df2.columns.tolist())
        print(df2.dtypes)

    if df1 is not None and df2 is not None:
        col0 = df1.columns[0]
        print(f"Key column candidate: {col0}")
        
        if col0 in df2.columns:
            print("Key column present in both.")
            try:
                # Cast key to string
                df1[col0] = df1[col0].astype(str)
                df2[col0] = df2[col0].astype(str)
                
                # Merge
                merged_df = pd.merge(df1, df2, on=col0, how='outer', suffixes=('_old', ''))
                print(f"Merge success. Shape: {merged_df.shape}")
                
                # Ssave
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                merged_df.to_csv(output_path, index=False, encoding='utf-8') 
                print("Saved to CSV.")
            except Exception as e:
                print(f"Merge failed: {e}")
                # Fallback: simple append
                print("Attempting vertical concat...")
                try:
                    res = pd.concat([df1, df2], ignore_index=True)
                    print(f"Concat success. Shape: {res.shape}")
                    res.to_csv(output_path, index=False, encoding='utf-8')
                    print("Saved to CSV.")
                except Exception as e2:
                    print(f"Concat failed: {e2}")
        else:
            print(f"Column {col0} not found in DF2")
            print("DF2 Cols:", df2.columns.tolist())
