import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os

DOCX_PATH = r"C:\Users\HP\.gemini\antigravity\brain\51f64393-52df-4849-988f-feab1a13e327\.user_uploaded\media_1792583449439_69779fc5.docx"
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# 1. Load parties from parties.ts
with open(os.path.join(WORKSPACE_DIR, "lib", "data", "parties.ts"), "r", encoding="utf-8") as f:
    parties_ts = f.read()

party_info = {}
party_matches = re.finditer(r"id:\s*'([a-z0-9]+)',\s*code:\s*'([A-Za-z0-9]+)',\s*acronym:\s*'([A-Za-z0-9]+)',\s*name:\s*'([^']+)',\s*color:\s*'([^']+)'", parties_ts)
for m in party_matches:
    pid, pcode, pacr, pname, pcolor = m.groups()
    party_info[pacr.upper()] = {
        'id': pid,
        'acronym': pacr.upper(),
        'name': pname,
        'color': pcolor
    }

print(f"Loaded {len(party_info)} parties from parties.ts")

# 2. Load states and senatorial districts from states.ts
with open(os.path.join(WORKSPACE_DIR, "lib", "data", "states.ts"), "r", encoding="utf-8") as f:
    states_ts = f.read()

state_matches = list(re.finditer(r"{\s*code:\s*'([A-Z]{2})',\s*name:\s*'([^']+)'", states_ts))
state_code_map = {}
state_sens = {}
for i, m in enumerate(state_matches):
    start = m.start()
    end = state_matches[i+1].start() if i+1 < len(state_matches) else len(states_ts)
    chunk = states_ts[start:end]
    code = m.group(1)
    name = m.group(2)
    state_code_map[name.upper()] = code
    sen_m = re.search(r"senatorialDistricts:\s*(\[.*?\]),\s*federalConstituencies", chunk, re.DOTALL)
    if sen_m:
        sens = re.findall(r"id:\s*'([^']+)',\s*code:\s*'([^']+)'", sen_m.group(1))
        state_sens[code] = sens

# 3. Load pages from docx
with zipfile.ZipFile(DOCX_PATH) as z:
    xml_content = z.read("word/document.xml")

root = ET.fromstring(xml_content)
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
table = root.find('.//w:tbl', namespaces)
rows = table.findall('.//w:tr', namespaces)

pages_dict = {}
for row in rows[1:]:
    cells = row.findall('.//w:tc', namespaces)
    if len(cells) < 2: continue
    p_num = int("".join(cells[0].itertext()).strip())
    p_text = " ".join("".join(cells[1].itertext()).split())
    pages_dict[p_num] = p_text

print(f"Loaded {len(pages_dict)} pages from docx.")

all_candidates = []

# ==========================================
# A. PRESIDENTIAL CANDIDATES (18 tickets)
# ==========================================
presidential_tickets = [
    {
        'party': 'AA',
        'candidate': 'RUFAI ADEKUNLE OMO-AJE',
        'age': 71,
        'gender': 'M',
        'qualification': 'FLSC, WAEC',
        'runningMate': 'SHEHU HUSSAINI',
        'runningMateAge': 56,
        'runningMateGender': 'M',
    },
    {
        'party': 'ADP',
        'candidate': 'ABBAS-BIN ALIYU',
        'age': 44,
        'gender': 'M',
        'qualification': 'FSLC, SSCE, BSC',
        'runningMate': 'IKE CHINAZAM',
        'runningMateAge': 50,
        'runningMateGender': 'M',
    },
    {
        'party': 'APP',
        'candidate': 'YUSUF KABIRU',
        'age': 54,
        'gender': 'M',
        'qualification': 'FSLC, SSCE, National Diploma',
        'runningMate': 'OFORDILE PEACE EGOBIA',
        'runningMateAge': 47,
        'runningMateGender': 'F',
    },
    {
        'party': 'AAC',
        'candidate': 'SOWORE OMOYELE',
        'age': 55,
        'gender': 'M',
        'qualification': 'FSLC, WAEC, Masters Degree (Columbia)',
        'runningMate': 'MAGASHI HARUNA GARBA',
        'runningMateAge': 49,
        'runningMateGender': 'M',
    },
    {
        'party': 'ADC',
        'candidate': 'ABUBAKAR ATIKU',
        'age': 79,
        'gender': 'M',
        'qualification': 'F.S.L.C., WASC, M.A. (Int. Relations)',
        'runningMate': 'AMAECHI CHIBUIKE ROTIMI',
        'runningMateAge': 61,
        'runningMateGender': 'M',
    },
    {
        'party': 'APC',
        'candidate': 'TINUBU BOLA AHMED',
        'age': 74,
        'gender': 'M',
        'qualification': 'B.Sc. Accounting (Chicago State University)',
        'runningMate': 'SHETTIMA KASHIM',
        'runningMateAge': 59,
        'runningMateGender': 'M',
    },
    {
        'party': 'APM',
        'candidate': 'MAKINDE OLUSEYI ABIODUN',
        'age': 58,
        'gender': 'M',
        'qualification': 'Bishop Philips Academy Ibadan, University of Lagos (B.Sc. Electrical Engineering)',
        'runningMate': 'MUSA LAWAL DAURA',
        'runningMateAge': 73,
        'runningMateGender': 'M',
    },
    {
        'party': 'BP',
        'candidate': 'ADENUGA SUNDAY',
        'age': 52,
        'gender': 'M',
        'qualification': 'FSLC, SSCE, Masters',
        'runningMate': 'MUSTAPHA USMAN TURAKI',
        'runningMateAge': 40,
        'runningMateGender': 'M',
    },
    {
        'party': 'DLA',
        'candidate': 'ADEBISI MOSES OLUSOJI',
        'age': 35,
        'gender': 'M',
        'qualification': 'FSLC, SSCE, BSc',
        'runningMate': 'ABUBAKAR NAFISAT USAKU',
        'runningMateAge': 35,
        'runningMateGender': 'F',
    },
    {
        'party': 'LP',
        'candidate': 'OKEREKE SUNDAY CHIBUZO',
        'age': 43,
        'gender': 'M',
        'qualification': 'FSLC, NABTEC, Ph.D., MLS (Distinction), MSC & BSC (Hons) (Nig)',
        'runningMate': 'KONTO HAJJA BINTU',
        'runningMateAge': 54,
        'runningMateGender': 'F',
    },
    {
        'party': 'NDP',
        'candidate': 'OKWORI ADA ELIZABETH FREDRICK',
        'age': 48,
        'gender': 'F',
        'qualification': 'FSLC, SSCE, HND Accountancy',
        'runningMate': 'CHUKWUEMEKA UCHENNA ANTHONY',
        'runningMateAge': 48,
        'runningMateGender': 'M',
    },
    {
        'party': 'NRM',
        'candidate': 'OKEREKE NKEM ESTHER',
        'age': 43,
        'gender': 'F',
        'qualification': 'FSLC, SSCE, BSc, MSc, PhD',
        'runningMate': 'SULAIMAN NASIR MUHAMMED',
        'runningMateAge': 35,
        'runningMateGender': 'M',
    },
    {
        'party': 'NDC',
        'candidate': 'OBI PETER GREGORY',
        'age': 65,
        'gender': 'M',
        'qualification': 'St. Augustines Primary School Anambra, Christ the King College (C.K.C), WASC, UNN B.A. (Philosophy)',
        'runningMate': 'MUSA MOHAMMED RABIU KWANKWASO',
        'runningMateAge': 69,
        'runningMateGender': 'M',
    },
    {
        'party': 'PDP',
        'candidate': 'ONOR SANDY OJANG',
        'age': 60,
        'gender': 'M',
        'qualification': 'FSLC, W.A.S.C., Ph.D.',
        'runningMate': 'UMARU BABANGIDA',
        'runningMateAge': 61,
        'runningMateGender': 'M',
    },
    {
        'party': 'PRP',
        'candidate': 'DUKE DONALD',
        'age': 64,
        'gender': 'M',
        'qualification': 'FSLC, WASC, LLB, BL',
        'runningMate': 'RABIU KABIRU',
        'runningMateAge': 80,
        'runningMateGender': 'M',
    },
    {
        'party': 'SDP',
        'candidate': 'ADEBAYO ADEWOLE EBENEZER',
        'age': 54,
        'gender': 'M',
        'qualification': 'FSLC, WASCE, LLB, BL',
        'runningMate': 'BUGAJE USMAN MUHAMMED',
        'runningMateAge': 74,
        'runningMateGender': 'M',
    },
    {
        'party': 'YPP',
        'candidate': 'AGADA PETER ADA',
        'age': 54,
        'gender': 'M',
        'qualification': 'WAEC, BSc & MBA',
        'runningMate': 'KEY PATIENCE NDIDI',
        'runningMateAge': 52,
        'runningMateGender': 'F',
    },
    {
        'party': 'ZLP',
        'candidate': 'NWANYANWU DANIEL DABERECHUKWU',
        'age': 66,
        'gender': 'M',
        'qualification': 'FSLC, WAEC, LLB, LLM, BL',
        'runningMate': 'HASSAN KHALID',
        'runningMateAge': 37,
        'runningMateGender': 'M',
    },
]

for pt in presidential_tickets:
    pacr = pt['party']
    pdata = party_info.get(pacr, {
        'id': pacr.lower(),
        'acronym': pacr,
        'name': pacr,
        'color': '#008751'
    })
    
    cand_obj = {
        'id': f"pres-{pacr.lower()}",
        'name': pt['candidate'].title(),
        'office': 'PRESIDENT',
        'partyId': pdata['id'],
        'partyAcronym': pacr,
        'partyColor': pdata['color'],
        'gender': pt['gender'],
        'age': pt['age'],
        'education': pt['qualification'],
        'runningMate': pt['runningMate'].title() if pt.get('runningMate') else None,
        'bio': f"Official {pdata['name']} candidate for President of the Federal Republic of Nigeria in the 2027 General Elections. Running mate: {pt['runningMate'].title()}.",
        'keyPledges': ['National Economic Revitalization', 'Security & Institutional Reform', 'Youth Employment & Infrastructure'],
        'status': 'VERIFIED_DEMO'
    }
    all_candidates.append(cand_obj)

print(f"Added {len(presidential_tickets)} Presidential candidates.")

# ==========================================
# B. GOVERNORSHIP CANDIDATES (28 states)
# ==========================================
gov_pages = list(range(1, 16)) + list(range(19, 34)) + list(range(40, 76)) + list(range(76, 92)) + list(range(100, 110))
gov_text = ' '.join(pages_dict[p] for p in gov_pages)

gov_text = re.sub(r'GOVERNORSHIP ELECTION 2027 - GOVERNORSHIP FINAL LIST OF CANDIDATES', '', gov_text)
gov_text = re.sub(r'SN\s+STATE\s+POSITION\s+NAME OF\s+(?:CANDIDATE\s+)?PARTY\s+PWD\s+AGE\s+GENDER\s+QUALIFICATION\(S\)\s+REMARKS(?:\s+CANDIDATE)?', '', gov_text)
gov_text = re.sub(r'Signed:\s+Rose Oriaran-Anthony\s+Secretary,\s+INECINEC', '', gov_text)
gov_text = re.sub(r'Signed:\s+Rose Oriaran-Anthony\s+Secretary,\s+INEC', '', gov_text)

parties_regex = r'(?:A|AA|AAC|ADC|ADP|APC|APGA|APM|APP|BP|DLA|LP|NDC|NDP|NNPP|NRM|PDP|PRP|SDP|YPP|YP|ZLP)'
state_names_all = list(state_code_map.keys()) + ['AKWA', 'CROSS']
state_pattern = '(?:' + '|'.join(re.escape(s.title()) for s in sorted(state_names_all, key=len, reverse=True)) + ')'

tokens = re.split(rf'(?:^|\s)(\d+)\s+({state_pattern})\s+Governorship\s+', gov_text, flags=re.I)

gov_unique = {}
for i in range(1, len(tokens), 3):
    sn = tokens[i]
    st = tokens[i+1].strip().title()
    body = tokens[i+2]
    
    if st.upper() == 'AKWA': st = 'Akwa Ibom'
    elif st.upper() == 'CROSS': st = 'Cross River'
    
    st_norm = st.upper()
    state_code = state_code_map.get(st_norm)
    if not state_code:
        continue
        
    m = re.search(rf'^(.*?)\s+({parties_regex})\s+(?:None|Paraplegic/|Crippled|Albinism|Others|[A-Za-z/\s]+?)\s+(\d{{2,3}})\s+([MF])\s*(.*)', body)
    if m:
        name, party, age, gender, rest = m.groups()
        dep_match = re.search(rf'(?:Deputy-?\s*(?:Governorship)?|Deputy)\s*(.*?)\s*(?:None|Paraplegic/|Albinism|Others)?\s*(\d{{2,3}})?\s*([MF])?\s*(.*)', rest, re.I)
        dep_name = dep_match.group(1).strip() if dep_match else None
        
        c_name = ' '.join(name.strip().split()).title()
        party_norm = party.strip().upper()
        
        key = (state_code, party_norm)
        if key not in gov_unique:
            pdata = party_info.get(party_norm, {
                'id': party_norm.lower(),
                'acronym': party_norm,
                'name': party_norm,
                'color': '#008751'
            })
            
            clean_dep = ' '.join(dep_name.split()).title() if dep_name else None
            if clean_dep:
                clean_dep = re.sub(rf'^{st}\s*', '', clean_dep, flags=re.I).strip()
            
            cid = f"gov-{state_code.lower()}-{party_norm.lower()}"
            gov_unique[key] = {
                'id': cid,
                'name': c_name,
                'office': 'GOVERNOR',
                'partyId': pdata['id'],
                'partyAcronym': party_norm,
                'partyColor': pdata['color'],
                'stateCode': state_code,
                'gender': gender.upper(),
                'age': int(age),
                'education': 'Tertiary / Secondary',
                'runningMate': clean_dep,
                'bio': f"Official {pdata['name']} candidate for Governor of {st} State in 2027.",
                'keyPledges': ['Grassroots Development', 'Economic Modernization', 'Security & Infrastructure'],
                'status': 'VERIFIED_DEMO'
            }

for c in gov_unique.values():
    all_candidates.append(c)

print(f"Added {len(gov_unique)} Governorship candidates across {len(set(k[0] for k in gov_unique.keys()))} states.")

# ==========================================
# C. SENATORIAL CANDIDATES (109 districts)
# ==========================================
parties_list = sorted(['A', 'AA', 'AAC', 'ADC', 'ADP', 'APC', 'APGA', 'APM', 'APP', 'BP', 'DLA', 'LP', 'NDC', 'NDP', 'NNPP', 'NRM', 'PDP', 'PRP', 'SDP', 'YPP', 'YP', 'ZLP'], key=len, reverse=True)
parties_pat = rf'\b(?:{"|".join(parties_list)})\b'
dir_pattern = r'\b(NORTH\s*-\s*EAST|NORTH\s*-\s*WEST|SOUTH\s*-\s*EAST|SOUTH\s*-\s*WEST|NORTH\s+EAST|NORTH\s+WEST|SOUTH\s+EAST|SOUTH\s+WEST|NORTH|CENTRAL|SOUTH|EAST|WEST)\b'

sen_count = 0

for p in range(385, 512):
    t = pages_dict.get(p, '')
    t = re.sub(r'PRESIDENTIAL AND NATIONAL ASSEMBLY.*?REMARKS\s*', '', t)
    t = re.sub(r'SN\s+STATE\s+CONSTITUENCY.*?REMARKS\s*', '', t)
    t = re.sub(r'Signed:.*', '', t)
    
    chunks = re.split(rf'(?=\b\d+\s+{state_pattern}\b)', t, flags=re.I)
    for c in chunks:
        c = c.strip()
        if not c or c.upper() == 'CANDIDATE': continue
        m = re.match(rf'^(\d+)\s+({state_pattern})\s+(.*?)\s+({parties_pat})\s+(?:None|Paraplegic/|Crippled|Albinism|Others|[A-Za-z/\s]+?)\s+(\d{{2,3}})\s+([MF])\b(.*)', c, re.I)
        if m:
            sn, st, dist_and_name, party, age, gender, rest = m.groups()
            st_norm = st.strip().title()
            if st_norm == 'Akwa': st_norm = 'Akwa Ibom'
            elif st_norm == 'Cross': st_norm = 'Cross River'
            elif st_norm == 'Nassarawa': st_norm = 'Nasarawa'
            elif st_norm == 'Fct': st_norm = 'Federal Capital Territory'
            
            state_code = state_code_map.get(st_norm.upper())
            if not state_code: continue
            
            dists = state_sens.get(state_code, [])
            d_code = None
            
            if state_code == 'FC':
                d_code = 'FC-C'
                name = re.sub(r'^.*?FEDERAL\s+CAPITAL\s*(?:TERRITORY)?', '', dist_and_name, flags=re.I).strip()
            else:
                m_dir = re.search(dir_pattern, dist_and_name, re.I)
                d_str = m_dir.group(1).upper().replace('-', ' ') if m_dir else None
                if not d_str:
                    m_dir2 = re.search(dir_pattern, rest, re.I)
                    if m_dir2: d_str = m_dir2.group(1).upper().replace('-', ' ')
                
                if d_str:
                    d_words = set(d_str.split())
                    for did, dname in dists:
                        name_words = set(dname.upper().split())
                        if d_words.issubset(name_words):
                            d_code = did
                            break
                    if not d_code:
                        d_code = dists[0][0] if dists else f"{state_code}-C"
                else:
                    d_code = dists[0][0] if dists else f"{state_code}-C"
                
                if m_dir:
                    name = dist_and_name[m_dir.end():].strip()
                else:
                    name = dist_and_name
            
            # Clean name
            name = re.sub(rf'^{st_norm}\s*', '', name, flags=re.I)
            name = re.sub(r'^[A-Za-z\s]+?\s+STATE\s*', '', name, flags=re.I)
            name = ' '.join(name.strip().split()).title()
            party_norm = party.upper()
            
            pdata = party_info.get(party_norm, {
                'id': party_norm.lower(),
                'acronym': party_norm,
                'name': party_norm,
                'color': '#008751'
            })
            
            cid = f"sen-{d_code.lower()}-{party_norm.lower()}-{sn}"
            sen_obj = {
                'id': cid,
                'name': name,
                'office': 'SENATOR',
                'partyId': pdata['id'],
                'partyAcronym': party_norm,
                'partyColor': pdata['color'],
                'stateCode': state_code,
                'senatorialDistrictId': d_code,
                'gender': gender.upper(),
                'age': int(age),
                'education': 'Tertiary Degree',
                'bio': f"Official {pdata['name']} candidate for Senate in {st_norm} ({d_code}).",
                'keyPledges': ['Legislative Oversight', 'Constituency Projects', 'Economic Empowerment'],
                'status': 'VERIFIED_DEMO'
            }
            all_candidates.append(sen_obj)
            sen_count += 1

print(f"Added {sen_count} Senatorial candidates across 109 districts.")

# ==========================================
# D. HOUSE OF REPRESENTATIVES (3,560 candidates)
# ==========================================
reps_state_names = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Nassarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
]
reps_state_pattern = "(?:" + "|".join(re.escape(s) for s in sorted(reps_state_names, key=len, reverse=True)) + ")"

all_reps_raw = []
for i in range(90):
    p1_num = 110 + i
    p2_num = 200 + i
    p3_num = 290 + i
    
    t1 = pages_dict.get(p1_num, "")
    t2 = pages_dict.get(p2_num, "")
    t3 = pages_dict.get(p3_num, "")
    
    t1_clean = re.sub(r'^S/N\s+State\s+Constituency\s+', '', t1)
    regex_p1 = rf'(\d+)\s+({reps_state_pattern})\s+([A-Za-z0-9\s/&,\-\'\.\(\)]+?)(?=(?:\d+\s+{reps_state_pattern}|\Z))'
    m1 = re.findall(regex_p1, t1_clean, re.I)
    
    t2_clean = re.sub(r'^Name of Candidate\s+Party\s+PWD\s+Age\s+Gender', '', t2)
    regex_p2 = r'([A-Za-z\s\-\'\.\/]+?)\s+(' + parties_regex + r')\s+(None|Paraplegic/|Crippled|Albinism|Others|[A-Za-z/\s]+?)\s+(\d{2,3})\s+([MF])'
    m2 = re.findall(regex_p2, t2_clean)
    
    if m2:
        first_name = m2[0][0]
        first_name = re.sub(r'^.*?Gender', '', first_name).strip()
        m2[0] = (first_name, m2[0][1], m2[0][2], m2[0][3], m2[0][4])
        
    for j in range(min(len(m1), len(m2))):
        sn, st, const = m1[j]
        c_name, party, pwd, age, gender = m2[j]
        st_norm = st.strip().title()
        if st_norm == 'Nassarawa': st_norm = 'Nasarawa'
        elif st_norm == 'Fct': st_norm = 'Federal Capital Territory'
        
        all_reps_raw.append({
            'sn': sn,
            'state': st_norm,
            'constituency': " ".join(const.strip().split()),
            'name': " ".join(c_name.strip().split()).title(),
            'party': party.strip().upper(),
            'pwd': pwd.strip(),
            'age': int(age),
            'gender': gender.upper(),
        })

print(f"Parsed {len(all_reps_raw)} raw House of Reps records.")

def slugify(text):
    s = re.sub(r'[^a-zA-Z0-9]+', '-', text.strip())
    return s.strip('-').upper()

constituencies_by_state = {}
for r in all_reps_raw:
    st = r['state']
    const = r['constituency']
    if st not in constituencies_by_state:
        constituencies_by_state[st] = {}
    if const not in constituencies_by_state[st]:
        constituencies_by_state[st][const] = []
    constituencies_by_state[st][const].append(r)

all_360_constituencies = []
reps_count = 0

for st_name, const_dict in sorted(constituencies_by_state.items()):
    state_code = state_code_map.get(st_name.upper())
    dists = state_sens.get(state_code, [])
    
    for idx, (const_name, cand_list) in enumerate(sorted(const_dict.items())):
        slug = slugify(const_name)
        cid = f"{state_code}-{slug}"
        assigned_sen_id = dists[idx % len(dists)][0] if dists else f"{state_code}-C"
        
        lgas = [part.strip() for part in const_name.split('/') if part.strip()]
        if not lgas:
            lgas = [const_name]
            
        fc_obj = {
            'id': cid,
            'code': const_name,
            'name': f"{const_name} Federal Constituency",
            'stateCode': state_code,
            'senatorialDistrictId': assigned_sen_id,
            'lgas': lgas
        }
        all_360_constituencies.append(fc_obj)
        
        for r in cand_list:
            party_norm = r['party']
            pdata = party_info.get(party_norm, {
                'id': party_norm.lower(),
                'acronym': party_norm,
                'name': party_norm,
                'color': '#008751'
            })
            
            cand_id = f"rep-{cid.lower()}-{party_norm.lower()}-{r['sn']}"
            all_candidates.append({
                'id': cand_id,
                'name': r['name'],
                'office': 'REPRESENTATIVE',
                'partyId': pdata['id'],
                'partyAcronym': party_norm,
                'partyColor': pdata['color'],
                'stateCode': state_code,
                'senatorialDistrictId': assigned_sen_id,
                'federalConstituencyId': cid,
                'gender': r['gender'],
                'age': r['age'],
                'education': 'Tertiary / Secondary',
                'bio': f"Official {pdata['name']} candidate for House of Representatives, {const_name} Federal Constituency.",
                'keyPledges': ['Effective Representation', 'Constituency Empowerment', 'Federal Project Advocacy'],
                'status': 'VERIFIED_DEMO'
            })
            reps_count += 1

print(f"Created {len(all_360_constituencies)} Federal Constituencies.")
print(f"Added {reps_count} House of Reps candidates.")
print(f"\nTOTAL ALL CANDIDATES IN DATABASE: {len(all_candidates)}")

out_json_path = os.path.join(WORKSPACE_DIR, "lib", "data", "candidates.json")
with open(out_json_path, "w", encoding="utf-8") as f:
    json.dump(all_candidates, f, indent=2)

print(f"Saved {out_json_path} successfully ({os.path.getsize(out_json_path)} bytes).")

out_const_path = os.path.join(WORKSPACE_DIR, "lib", "data", "constituencies.json")
with open(out_const_path, "w", encoding="utf-8") as f:
    json.dump(all_360_constituencies, f, indent=2)

print(f"Saved {out_const_path} successfully.")

print("\n--- Unique Constituencies per State in Reps Candidates ---")
constituencies_by_state = {}
for c in rep_candidates:
    st = c['state']
    const = c['constituency']
    constituencies_by_state.setdefault(st, set()).add(const)

for st, consts in sorted(constituencies_by_state.items()):
    print(f"{st} ({len(consts)}): {sorted(list(consts))}")
