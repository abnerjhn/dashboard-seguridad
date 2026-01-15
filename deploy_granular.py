
import os
import subprocess
import time

def run_git(args, check=True):
    print(f"Running: git {' '.join(args)}")
    res = subprocess.run(['git'] + args, capture_output=True, text=True)
    if res.returncode != 0 and check:
        print(f"ERROR: {res.stderr}")
        raise Exception(f"Git command failed: {res.stderr}")
    return res

def incremental_push():
    # 1. Reset everything to mixed (keep files, undo commits)
    # We do a 'soft' reset to origin/main if it exists, or just ensure we are clean.
    # Actually, let's start fresh-ish.
    # But files are partitioned.
    
    print("Resetting git state...")
    if os.path.exists(".git"):
        # We can just remove .git and start super-fresh to be 100% sure no history bloat.
        # But we need to configure remote again.
        subprocess.run(["powershell", "-Command", "Remove-Item .git -Recurse -Force"], shell=True)
    
    run_git(['init'])
    run_git(['config', 'http.postBuffer', '524288000'])
    run_git(['remote', 'add', 'origin', 'https://github.com/abnerjhn/dashboard-seguridad.git'])
    
    # 2. Add Core Files (Excluding Data Chunks)
    print("Adding CORE files...")
    run_git(['add', '.'])
    # Unstage data chunks
    run_git(['reset', 'public/data/*_part*.csv'])
    # Also unstage stop_data.csv if it exists (it shouldn't, but safer)
    run_git(['reset', 'public/data/*.csv']) # Reset all CSVs in data just in case, then re-add small ones?
    # Wait, check small CSVs.
    # analysis_by_comuna_example.csv is small.
    # We should only reset the PART files and the big files if they exist.
    run_git(['reset', 'public/data/combined_historical_part*.csv'])
    run_git(['reset', 'public/data/stop_data_part*.csv'])
    
    run_git(['commit', '-m', "Core: App source code and config"])
    run_git(['branch', '-M', 'main'])
    
    print("Pushing CORE...")
    # Using --force to overwrite the failed partial remote state
    run_git(['push', '-u', '-f', 'origin', 'main'])
    
    # 3. Add chunks one by one
    data_dir = os.path.join('public', 'data')
    files = [f for f in os.listdir(data_dir) if '_part' in f and f.endswith('.csv')]
    files.sort() # Important to verify order? Doesn't matter for git, but nice for logs.
    
    for f in files:
        print(f"Processing chunk: {f}")
        full_path = os.path.join(data_dir, f)
        run_git(['add', full_path])
        run_git(['commit', '-m', f"Data: {f}"])
        
        retries = 3
        while retries > 0:
            try:
                print(f"Pushing {f}...")
                run_git(['push', 'origin', 'main'])
                break
            except Exception as e:
                print(f"Push failed, retrying {f}... ({retries} left)")
                retries -= 1
                time.sleep(5)
                if retries == 0:
                    raise e
                    
    print("\nSUCCESS: All parts uploaded incrementally!")

if __name__ == "__main__":
    incremental_push()
