import csv

file_path = 'c:/web_antigravity/reportes_delicuencia/DATOS/DelitoFrecuencia_CEADD_2005_2014.csv'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        print(f"--- Reading {file_path} with utf-8 ---")
        lines = f.readlines()
        for i, line in enumerate(lines[:20]):
            print(f"Line {i}: {repr(line)}")
except Exception as e:
    print(f"Error reading with utf-8: {e}")
    try:
        with open(file_path, 'r', encoding='latin-1') as f:
            print(f"--- Reading {file_path} with latin-1 ---")
            lines = f.readlines()
            for i, line in enumerate(lines[:20]):
                print(f"Line {i}: {repr(line)}")
    except Exception as e2:
        print(f"Error reading with latin-1: {e2}")
