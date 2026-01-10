import pandas as pd
import numpy as np
import os

def process_data():
    base_dir = r"C:\Users\hafid\Desktop\datavis"
    
    # 1. Load Data
    print("Loading datasets...")
    try:
        df_v2 = pd.read_csv(os.path.join(base_dir, "cost-of-living_v2.csv"))
        df_edu = pd.read_csv(os.path.join(base_dir, "International_Education_Costs.csv"))
        df_index = pd.read_csv(os.path.join(base_dir, "Cost_of_living_index.csv"))
    except FileNotFoundError as e:
        print(f"Error loading files: {e}")
        return

    # 2. Filter Quality (cost-of-living_v2.csv)
    print("Filtering high quality data...")
    # Column for quality might be 'data_quality'
    if 'data_quality' in df_v2.columns:
        df_v2_clean = df_v2[df_v2['data_quality'] == 1].copy()
    else:
        print("Warning: 'data_quality' column not found, using all data.")
        df_v2_clean = df_v2.copy()
    
    # 3. Standardize Columns (city, country)
    print("Standardizing city and country names...")

    def clean_text(df, cols):
        for col in cols:
            if col in df.columns:
                df[col] = df[col].astype(str).str.lower().str.strip()

    # --- Pre-processing specific files ---
    
    # Fix df_index (City, Country split)
    # Format: "Hamilton, Bermuda"
    # We strip first
    if 'City' in df_index.columns:
        # Split on the LAST comma to be safe, but typically it is ", "
        # rsplits splits from right. n=1 means split once.
        split_data = df_index['City'].str.rsplit(', ', n=1, expand=True)
        if split_data.shape[1] == 2:
            df_index['city'] = split_data[0]
            df_index['country'] = split_data[1]
        else:
            # Fallback if split fails?
            df_index['city'] = df_index['City']
            df_index['country'] = '' # Should likely filter these out or handle manually
    
    # Rename commonly used keys in other DFs
    df_v2_clean = df_v2_clean.rename(columns={'City': 'city', 'Country': 'country'})
    df_edu = df_edu.rename(columns={'City': 'city', 'Country': 'country'})
    
    # Apply cleaning
    for df in [df_v2_clean, df_edu, df_index]:
        clean_text(df, ['city', 'country'])

    # 4. Select and Rename Columns
    
    # v2 mapping
    v2_cols = {
        'city': 'city', 'country': 'country',
        'x48': 'Rent_Studio_Center',
        'x29': 'Transport_Monthly_Pass',
        'x38': 'Internet_60Mbps',
        'x1': 'Meal_Inexpensive',
        'x2': 'Meal_Restaurant_3Course',
        'x28': 'Transport_OneWay',
        'x31': 'Taxi_Start',
        'x4': 'Beer_Domestic',
        'x6': 'Cappuccino',
        'x27': 'Cinema',
        'x54': 'Avg_Monthly_Net_Salary'
    }
    
    v2_cols_to_keep = [c for c in v2_cols.keys() if c in df_v2_clean.columns]
    df_main = df_v2_clean[v2_cols_to_keep].rename(columns=v2_cols)
    
    # Merge Logic
    print("Merging datasets...")
    
    # Merge Education
    # df_edu has 'city' and 'country' now
    master = pd.merge(df_main, df_edu, on=['city', 'country'], how='left')

    # Merge Index
    # df_index has 'city' 'country' (created above)
    cols_to_merge_index = ['city', 'country']
    for col in ['Cost of Living Index', 'Local Purchasing Power Index']:
        if col in df_index.columns:
            cols_to_merge_index.append(col)
            
    master = pd.merge(master, df_index[cols_to_merge_index], on=['city', 'country'], how='left')
    
    # Rename final columns
    master = master.rename(columns={
        'Cost of Living Index': 'Cost_of_Living_Index',
        'Local Purchasing Power Index': 'Purchasing_Power_Index'
    })

    # 5. Feature Engineering
    print("Calculating scores...")
    
    def normalize_min_max_invert(series):
        # lower cost = higher score
        series = pd.to_numeric(series, errors='coerce')
        min_val = series.min()
        max_val = series.max()
        if pd.isna(min_val) or pd.isna(max_val) or max_val == min_val:
            return 50 # Default middle
        return 100 * (max_val - series) / (max_val - min_val)

    # Student Score
    # Components: Rent_Studio_Center, Transport_Monthly_Pass, Tuition_USD (if exists)
    student_cols = ['Rent_Studio_Center', 'Transport_Monthly_Pass']
    if 'Tuition_USD' in master.columns:
        student_cols.append('Tuition_USD')
    
    # Calculate score where data is present
    score_df = master[student_cols].copy()
    norm_cols = []
    for col in student_cols:
        # Let's clean numeric first.
        master[col] = pd.to_numeric(master[col], errors='coerce')
        score_df[col] = master[col]
        
        # Invert normalization
        score_df[col + '_norm'] = normalize_min_max_invert(score_df[col])
        norm_cols.append(col + '_norm')
    
    master['Student_Score'] = score_df[norm_cols].mean(axis=1)

    # Tourist Score
    tourist_cols = ['Meal_Restaurant_3Course', 'Taxi_Start', 'Cinema', 'Transport_OneWay', 'Beer_Domestic', 'Cappuccino']
    score_df_t = master[tourist_cols].copy()
    t_norm_cols = []
    
    for col in tourist_cols:
        if col in master.columns:
            master[col] = pd.to_numeric(master[col], errors='coerce')
            score_df_t[col] = master[col]
            score_df_t[col + '_norm'] = normalize_min_max_invert(score_df_t[col])
            t_norm_cols.append(col + '_norm')
        
    master['Tourist_Score'] = score_df_t[t_norm_cols].mean(axis=1)

    # Round scores
    master['Student_Score'] = master['Student_Score'].round(2)
    master['Tourist_Score'] = master['Tourist_Score'].round(2)

    # Clean up master final columns: only keep requested + Identifiers
    # The prompt explicitly asked for specific columns in output?
    # "Format de sortie : Fournis un fichier unique... avec des noms de colonnes explicites"
    # It implied we should keep the ones we selected.
    
    # 6. Export
    output_path = os.path.join(base_dir, "master_city_data_final.csv")
    print(f"Exporting to {output_path}...")
    master.to_csv(output_path, index=False)
    print("Done!")

if __name__ == "__main__":
    process_data()
