import pandas as pd
import numpy as np
import os

def polish_data():
    base_dir = r"C:\Users\hafid\Desktop\Global-Cost-of-Living\Nettoyage"
    # Note: process_data.py used C:\Users\hafid\Desktop\datavis as base_dir in the code,
    # but the user says the file is master_city_data_final.csv in the context.
    # I will assume the file is where process_data.py is or in datavis.
    # Let me check where process_data.py wrote it. 
    # process_data.py output_path = os.path.join(base_dir, "master_city_data_final.csv") where base_dir was ...\datavis
    # The user workspace is ...\Global-Cost-of-Living\Nettoyage.
    # I will look for the input file in datavis folder if possible, or try the current dir.
    
    # Path configurations
    # Based on previous file content, the data seems to be in C:\Users\hafid\Desktop\datavis
    input_path = r"C:\Users\hafid\Desktop\datavis\master_city_data_final.csv"
    output_path = r"C:\Users\hafid\Desktop\datavis\master_city_data_polished.csv"
    
    if not os.path.exists(input_path):
        # Fallback to local directory if datavis is not accessible or file not there
        input_path = "master_city_data_final.csv"
        output_path = "master_city_data_polished.csv"

    print(f"Loading data from {input_path}...")
    try:
        df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"Error: File not found at {input_path}")
        return

    # --- 1. Outlier Detection and Treatment (IQR) ---
    print("Handling outliers...")
    outlier_cols = ['Rent_Studio_Center', 'Meal_Inexpensive', 'Avg_Monthly_Net_Salary']
    
    # Ensure numeric
    for col in outlier_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Apply IQR per Country
    if 'country' in df.columns:
        for col in outlier_cols:
            if col not in df.columns: continue
            
            # Calculate bounds per country
            # We use transform to get a Series aligned with df
            grouped = df.groupby('country')[col]
            q1 = grouped.transform(lambda x: x.quantile(0.25))
            q3 = grouped.transform(lambda x: x.quantile(0.75))
            iqr = q3 - q1
            
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            # Identify outliers
            outliers = (df[col] < lower_bound) | (df[col] > upper_bound)
            
            # Update with Median
            medians = grouped.transform('median')
            
            count = outliers.sum()
            if count > 0:
                print(f"  Replcaing {count} outliers in {col} with country medians.")
                df.loc[outliers, col] = medians[outliers]
    else:
        print("Warning: 'country' column missing, skipping granular outlier detection.")

    # --- 2. Missing Values Handling ---
    print("Handling missing values...")
    # Map generic names to likely column names
    # User said: Coffee, Beer, Meal
    # Available: Cappuccino, Beer_Domestic, Meal_Inexpensive (or Meal_Restaurant_3Course)
    # I will use Cappuccino for Coffee, Beer_Domestic for Beer, Meal_Inexpensive for Meal based on context.
    
    fill_cols_map = {
        'Cappuccino': 'Cappuccino',
        'Beer_Domestic': 'Beer_Domestic',
        'Meal_Inexpensive': 'Meal_Inexpensive'
    }
    
    for friendly_name, col in fill_cols_map.items():
        if col in df.columns:
            # Fill with Country Mean
            if 'country' in df.columns:
                df[col] = df[col].fillna(df.groupby('country')[col].transform('mean'))
            
            # If still NaN (e.g. country has no data at all), fill with global mean
            if df[col].isna().sum() > 0:
                df[col] = df[col].fillna(df[col].mean())

    # University
    if 'University' in df.columns:
        df['University'] = df['University'].fillna("No University Listed")
    elif 'University_Name' in df.columns: # fallback if name is different
         df['University_Name'] = df['University_Name'].fillna("No University Listed")

    # --- 3. Duplicate Cities ---
    print("Handling duplicates...")
    # Create City_Is_Unique
    # True for first occurrence, False for others.
    # Sort by city/country to be deterministic.
    df = df.sort_values(by=['country', 'city'])
    df['City_Is_Unique'] = ~df.duplicated(subset=['city', 'country'], keep='first')

    # --- 4. Feature Engineering ---
    print("Feature engineering...")
    
    # Rent_to_Income_Ratio: (Rent_Studio_Center / Avg_Monthly_Net_Salary) * 100
    if 'Rent_Studio_Center' in df.columns and 'Avg_Monthly_Net_Salary' in df.columns:
        # Avoid division by zero
        df['Rent_to_Income_Ratio'] = (df['Rent_Studio_Center'] / df['Avg_Monthly_Net_Salary'].replace(0, np.nan)) * 100
    
    # Daily_Survival_Budget: Meal_Inexpensive + 2*Transport_OneWay + Cappuccino
    # Needed cols: Meal_Inexpensive, Transport_OneWay, Cappuccino
    budget_cols = ['Meal_Inexpensive', 'Transport_OneWay', 'Cappuccino']
    if all(col in df.columns for col in budget_cols):
        df['Daily_Survival_Budget'] = df['Meal_Inexpensive'] + (2 * df['Transport_OneWay']) + df['Cappuccino']

    # --- 5. Verification & Formatting ---
    print("Verifying types and formatting...")
    
    numeric_cols = [
        'Rent_Studio_Center', 'Meal_Inexpensive', 'Avg_Monthly_Net_Salary',
        'Cappuccino', 'Beer_Domestic', 'Transport_OneWay', 
        'Rent_to_Income_Ratio', 'Daily_Survival_Budget',
        'Student_Score', 'Tourist_Score' # From previous step
    ]
    
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').round(2)

    # Output
    print(f"Saving to {output_path}...")
    df.to_csv(output_path, index=False)
    print("Polishing complete.")

    # Verification Print
    print("\n--- Verification Stats ---")
    print(f"Shape: {df.shape}")
    print("Missing Values in key columns:")
    print(df[outlier_cols].isna().sum())
    if 'City_Is_Unique' in df.columns:
        print(f"Unique Cities marked: {df['City_Is_Unique'].sum()}")

if __name__ == "__main__":
    polish_data()
