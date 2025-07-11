# Central repository for data & materials from the Forecasting Proficiency Test - Study 2.

## Preprints
[The Forecasting Proficiency Test: A General Use Assessment of Forecasting Ability](https://osf.io/preprints/psyarxiv/a7kdx)
Himmelstein, M., Zhu, S. M., Petrov, S., Karger, E., Helmer, J., Livnat, S., Bennett, A., Hedley, P. Tetlock, P. (May 2025)

[The Psychometric Properties of Probability and Quantile Forecasts](https://osf.io/preprints/psyarxiv/2m4ya)
Zhu, S. M., Budescu, D., Petrov, N., Karger, E., Himmelstein, M. (May 2025)

[Identifying good forecasters via adaptive cognitive tests](https://arxiv.org/abs/2411.11126)
Merkle, E., Petrov, N., Zhu, S. M., Karger, E., Tetlock, P., Himmelstein, M. (November 2024)

## Anonymization procedure

Done in Python; pseudo-code:

```python
subject_id_to_anon_code = {}

def get_or_create_anon_code(sid):
	if pd.isna(sid):
		return ""
	# this is for the Qualtrics-generated metadata
	if "quorumId" in sid or "ImportId" in sid:
		return ""
	
	if len(sid) == 36:
		sid = f"Q_{sid}"
	if sid not in subject_id_to_anon_code:
		# Generate a new 20-character random code
		new_anon_code = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
		subject_id_to_anon_code[sid] = new_anon_code
	return subject_id_to_anon_code[sid]

for metadata_filename in ["session.csv", "subject_id_group.csv", "final_completers.csv"]
    df = pd.read_csv(os.path.join("data", "metadata_tables", metadata_filename))
    df['subject_id'] = df['subject_id'].apply(get_or_create_anon_code)
    df.to_csv(file_path, index=False)

raw_session_files_filepath = os.path.join("data", "raw_session_data")
for raw_session_filename in os.listdir(raw_session_files_filepath):
	file_path = os.path.join(raw_session_files_filepath, f)
	df = pd.read_csv(file_path)
	df['subject_id'] = df['subject_id'].apply(get_or_create_anon_code)
	df.to_csv(file_path, index=False)

for forecasting_dataset in ["Study 2 Wave 0 Final.csv", "Study 2 Wave 17 Final.csv", "Study 2 Wave 246 Final.csv"]:
	df = pd.read_csv(os.path.join("data_forecasting", file_name))
	df['subject_id'] = df['quorumId'].apply(get_or_create_anon_code)
	df = df.drop(columns=["ResponseId", "IPAddress", "LocationLatitude", "LocationLongitude", "quorumId"])
	df.to_csv(os.path.join("data_forecasting", file_name), index=False)
```
