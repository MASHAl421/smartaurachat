// Chat edge function — streams answers from Lovable AI Gateway, grounded in college policies.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLICIES = `# PART A — GOVERNMENT COLLEGE CODE OF CONDUCT (Authoritative)

## CODE OF CONDUCT
Every student must follow these rules:
1. Observe religious obligations; show tolerance for other religions, beliefs, customs and traditions. Promoting communal, regional or religious disharmony is strictly prohibited.
2. Be loyal to the ideology of Pakistan; no actions damaging the honor and integrity of the motherland.
3. Demonstrate tolerance, patience, and politeness with teachers and fellow students.
4. Respect college teachers and administration; abide by rules. Harassment of any student, employee or visitor is strictly prohibited.
5. Keep mind and body clean; demonstrate good manners; help and serve fellow students.
6. Receive education keenly and participate in sports and co-curricular activities honestly.
7. Take care of public and college property and persuade others to do so.
8. For personal concerns, contact the concerned in-charge directly. Improper interference in academic, administrative, sporting, social activities is prohibited.
9. Observe college and class timing; ensure attendance does not fall short of required attendance for public examining bodies.
10. Regularly take class tests and home examinations.
11. Wear the college prescribed uniform.
12. Provide correct information to college administration whenever required.
13. Observe rules for classroom, common room, library, lawns, playgrounds and hostel.
14. Abstain from unfair means in tests and examinations.
15. Smoking, alcohol, intoxicants, gambling, weapons, and unauthorized audio/video recording or photography in college premises are strictly prohibited.
16. Pay all college, board, or university dues on time.
17. Taking part in politics or wearing badges/caps of political parties within the college is prohibited.
18. Display of any poster/banner on college building or boundary wall is not allowed.
19. No student shall facilitate unauthorized entry of any person into the campus or unauthorized occupation of any portion of college premises, including hostel.
20. Observe cultural and social norms of society.
21. Parents/guardians of regular students and ex-students can visit the college after 11:00 A.M. for any official work.
22. The Chief Proctor and staff proctor may extend Proctorial Monitors' duties to check indiscipline outside the college premises as well.

## ACCOUNTABLE IRREGULARITIES (Misconduct)
Students must maintain reasonable conduct. Misconduct inside or outside campus may lead to penalties including expulsion, rustication, or being struck off. Misconduct includes:
- Disruption of academic, administrative, sporting, social, or other college activities.
- Violent, indecent, disorderly, threatening, defamatory or offensive behavior or abusive/derogatory/intimidatory language.
- Any form of harassment of any student, employee, or visitor in person, writing, email, internet, etc.
- Fraud, deceit, dishonesty, forgery, or tampering with college documents/records/IDs.
- Furnishing false certificates or false information to any college office.
- Actions causing or likely to cause injury or impair safety on premises.
- Misuse, unauthorized use, damage, defacement, or misappropriation of college or community property.
- Wrongful confinement of teachers, officers, employees, or students.
- Breach of college policies, codes, rules and regulations.
- Smoking, alcohol, dangerous drugs, intoxicants on premises.
- Gambling on premises.
- Unauthorized audio/video recording or photography of learning activities.
- Possessing/using weapons (knives, iron chains, rods, sticks, explosives, firearms) on premises.
- Ragging — teasing, practical jokes, rough/rude treatment causing annoyance, hardship, harm, fear, shame, embarrassment or danger to a fresher.
- Criminal conduct on premises, affecting community members, damaging college's good name, or constituting misconduct under the code.
- Any act of moral code violation.
- Failure to disclose name/details to a college officer when reasonable.
- Failure to comply with previously imposed warnings.
- Deliberate false activation of fire alarm or extinguisher.
- Unauthorized occupation of hostel rooms or unauthorized use of college furniture.
- Causing or colluding in unauthorized entry/occupation of premises.
- Arousing communal, caste, or regional feelings or creating disharmony.
- Tearing, defacing, burning, or destroying college library books.
- Any offence under law.
- Using or attempting unfair means in class tests and home examinations.
- Pasting objectionable posters/pamphlets/handbills or writing on walls and disfiguring buildings.
- Disobeying teachers or college administration.
- Neglecting academic work or absenting from class without reason.
- Not clearing college dues in time.
- Indulging in politics.
- Any other act considered by the Principal or Discipline Committee as a violation.

## OFFICERS AUTHORIZED TO TAKE DISCIPLINARY ACTION
- The Chief Proctor
- Disciplinary Committee
- Principal of the College
- College Council

The Principal or Chief Proctor may impose any penalty upon recommendation of a teacher, Head of Department, Librarian, Hostel Warden, College Controller of Examination, In-charge Sports, head of any college society, Disciplinary Committee, or College Council.

## RANGE OF PENALTIES
i. Written warning and information to the guardian
ii. Fine from Rs. 100 to Rs. 5000
iii. Suspension from the class/Department/College/Hostel/Library or any other facility
iv. Suspension or cancellation of scholarships, fellowships, or financial assistance
v. Recovery of pecuniary loss caused to college property
vi. Debarring from sports, debates, societies, academic/refreshing tours
vii. Disqualifying from holding any representative position in Class/College/Hostel/Mess/Sports/Clubs
viii. Hostel shift and between Morning/Evening shifts
ix. Expulsion from College/Department/Faculty/Hostel/Mess/Library/Club for a specified period
x. Debarring from an examination
xi. Issue of Migration certificate
xii. Issuance of character certificate with adverse remarks
xiii. Prohibition of further admission or re-admission
xiv. Struck off from college roll for the current academic year or extended period

## SUSPENSION OF STUDENTSHIP
Any student charged with misconduct may be suspended by the Principal until the competent authority's final decision. A review of disciplinary action lies with the issuing officer within seven days. Appeals against authorities' orders lie with the College Council.

## AMENDMENT AND ANNULMENT OF RULES
The Principal, in consultation with the College Council, is competent to amend rules or regulations except those related to admission policy, in the interest of the institution.

---

# PART B — KPK GOVERNMENT COLLEGES ADMISSION POLICY (HED KPK, Authoritative)
Source: Higher Education, Archives & Libraries Department (HED), Government of Khyber Pakhtunkhwa.
Official Portal: https://admission.hed.gkp.pk | https://hed.gkp.pk
Last Updated: 2025-2026 Academic Year.

## 1. OVERVIEW
HED KPK runs a fully **Online Admission System** for all Government Colleges (Male & Female) at https://admission.hed.gkp.pk. All merit lists are public for transparency.
Programs covered:
- Intermediate Part-I (11th / FA / FSc / ICS / D.Com / Pre-Engineering / Pre-Medical / Computer Science / Humanities)
- Associate Degree (AD) — 1st Semester (2-year, being phased out; closed for new admissions since Oct 2023)
- BS (Bachelor of Studies) — 1st Semester (4-year)
- BS — 5th Semester (lateral entry from AD)

## 2. JURISDICTION & OBJECTIVES
Applies to all General Male and Female Government Colleges of KPK. Objectives: fair access, merit, and transparency.

## 3. AGE LIMITS (calculated on closing date of application)
**Male candidates — Maximum age:**
- Intermediate Part-I: **19 years**
- BS 1st Semester / AD 1st Semester: **22 years**
- BS 5th Semester (lateral entry): **25 years**

**Female candidates:** NO upper age limit, except Sports Quota (same as male).

**Minimum age:** Not formally stated. Practical: ~15–16 yrs for Intermediate, ~17–18 yrs for BS 1st.

**Age Relaxation:** Granted by the Principal (per affiliating Board/University criteria). Apply with valid reasons before the interview. NOT applicable for Sports Quota (any gender).

## 4. ELIGIBILITY
General rules:
1. No admission offered in any faculty/discipline with fewer than **20 applications**.
2. If <50% of allocated seats in a BS/AD discipline are filled, students may be guided to other disciplines (without compromising merit).
3. If a BS/AD program drops below **15 students at any stage**, students migrate to another college in the same/nearby district.
4. Students who **failed in one or more subjects** in the preceding exam are NOT eligible for Intermediate Part-I, AD 1st Sem, or BS 1st Sem.

Per program:
- **Intermediate (Part-I):** Passed SSC (Matric) from a recognized board, minimum marks per BISE policy.
- **BS / AD 1st Sem:** Passed HSSC (Intermediate / FA / FSc or equivalent), generally **minimum 60%** in HSSC (varies by university/discipline).
- **BS 5th Sem (Lateral Entry):** Completed AD from a recognized institution; admission on open merit subject to vacant seats and affiliating university criteria.

Special cases:
- **Hope Certificate / awaiting result:** May apply with tentative marks + Hope Certificate; admission is **provisional**, canceled if final marks fall short.
- **O/A Level / Foreign:** Must have **IBCC/HEC equivalency certificate**.
- **Gap year:** Must submit affidavit (no prior admission OR previous one canceled).
- **Supplementary exam pass (immediately preceding year):** NOT eligible the same academic year.

## 5. DOCUMENTS REQUIRED
SSC Certificate; HSSC Certificate (BS/AD); Detail Marks Sheet / Provisional Cert; Domicile; Own/Father's CNIC or Form-B; Character Certificate (last institution OR Gazetted Officer if private); Colored Photographs; Quota Eligibility Certificate (Sports/Disability/etc.); Original Migration Certificate Board-to-Board (O/A Level / different board); Original Migration Certificate Board-to-University (BS/AD); Verified Copy of HSSC DMC; Affidavit of Non-involvement in Politics (already in online system); Hafiz-e-Quran Certificate (if claiming bonus); Disability Certificate (Special Person Quota); NOC + Afghan Commissionerate Recommendation + Police Clearance (Afghan Quota).

## 6. HOW TO APPLY (STEP-BY-STEP)
1. Visit https://admission.hed.gkp.pk
2. Create account with CNIC (or Form-B for minors); family member's phone is allowed.
3. Fill academic & personal information.
4. Select college(s) & program(s) — multiple applications allowed.
5. Pay application processing fee via **JazzCash Retailer or App**.
6. Submit application online (and hard copies at interview).
7. Track at https://admission.hed.gkp.pk/application_status.php; merit lists posted on college notice board + website.
8. Appear for interview with parent/guardian + originals.
9. Confirm admission (pay admission fee within timeframe) — failure forfeits the seat to next on merit.
10. Attend classes — failure to attend within **10 days** cancels admission.

## 7. SEAT ALLOCATION & QUOTA SYSTEM

**A. Intermediate (General & Commerce):**
- Open Merit 40% | Local Quota (Jurisdictional Area) 45% | HED Employee Quota 6% | Sports 5% | Special Person/Disabled 2% | Minority 2% | Afghan Quota: 1 seat per faculty (over & above)

**B. BS & AD 1st Semester (Degree Colleges):**
- Open Merit 43% | District Local Quota 42% | HED College Employee 6% | Sports 5% | Special Person/Disabled 2% | Minority 2% | Afghan: 1 seat per faculty
- Out of 40 seats: 17/17/2/2/1/1; Out of 50 seats: 22/21/3/2/1/1.

**C. BS 4-Year (Commerce Colleges):**
- District (same college) 60% | Open Commerce (D.Com/DBA) 16% | Open (FA/FSc) 11% | Sports 4% | Army Sons 2% | CE & MS Employees 3% | Special Person 2% | Minority 2%

**D. BS 5th Semester:** Open Merit only, subject to vacant seats and university criteria.

**E. Female at Male Colleges (Co-Ed BS):** Allowed only for BS disciplines unavailable at any female college in the same jurisdictional area (per JMC). Apply under Open Merit, Employee, Special Person, Minority, Afghan quotas.

**Local definitions:**
- *Intermediate Local (45%)*: Domiciled in jurisdictional area (UC/VC/NC) + matching CNIC, OR child/spouse/ward of a Federal/Provincial Govt employee serving in the district.
- *BS/AD District Local (42%)*: Domiciled in the district + matching CNIC, OR ward/spouse/child of a Govt employee serving in that district.
- Vacant quota seats (except Afghan) revert to Open Merit.

## 8. FEE STRUCTURE
Government college fees are significantly lower than private institutions/universities. Components:
- Application Processing Fee (JazzCash, online)
- Admission Fee (one-time, on confirmation)
- Tuition Fee (semester/annual, very nominal)
- Board/University Registration Fee
- Security Deposit (refundable, conditions apply)
- College Pupil Fund (per CPF Guidelines 2023)
Exact amounts vary per college/program — see https://admission.hed.gkp.pk/colleges.php.

**Refund Policy:**
- Cancellation BEFORE board/university registration fee paid → **Full refund**
- AFTER registration fee paid → Refund of **private fund + security only**
- AFTER one month of classes → Refund of **security only**
- No refund request within **3 months** → **All fees forfeited** (incl. security)
- Special/Disabled students: Fee waiver per HED directives.

## 9. MERIT DETERMINATION
1. Aggregate basis: Intermediate ← SSC%; BS/AD 1st ← HSSC%; BS 5th ← AD 4th-Sem CGPA/Marks.
2. **Hafiz-e-Quran bonus: +20 marks** (Inter Part-I, AD 1st, BS 1st) — requires valid certificate + committee test BEFORE 1st provisional merit list.
3. **Gap Year penalty: −5 marks per year/session** (no deduction for supplementary pass of immediately preceding year).
4. **Tie-break:** older candidate first; if still tied, earlier applicant first.
5. **Meritorious seats:** Principal may reserve 10% of seats for 15 days for top provincial-level students who missed admission for unavoidable reasons.

**Sports Merit (Total 100 = Trial 65 + Certificate 35):** SSC 10 / HSSC or Inter-District/Zonal 15 / District 20 / Regional or BISE Inter-School-College or DHE Regional 25 / Inter-Board or Provincial 30 / BISE or other National 35. Only the **highest** certificate is counted. Sports-quota students must sign undertaking to play for college team — failure cancels admission.

Merit lists posted on college notice board AND https://admission.hed.gkp.pk/merit_list.php; separate list per quota.

## 10. UNIFORM POLICY
KPK Government Colleges follow a dress code aligned with local cultural and Islamic values (no single province-wide uniform).
- **Male:** Shalwar Kameez (preferred white/light for formal days). No jeans, shorts, tight clothing.
- **Female:** Abaya (typically black) + Dupatta/Scarf is mandatory in most colleges; Shalwar Kameez + Dupatta also accepted; strict purdah enforced.
- Modest Islamic dress; decent footwear; no flashy clothing. Individual colleges may add specifics.

## 11. SCHOLARSHIPS & FINANCIAL ASSISTANCE
- Need-based: per College Pupil Fund Guidelines 2023.
- Merit-based: top performers, also under CPF 2023.
- Fee waivers for Special/Disabled per HED directives.
- KPTIB / Udacity Program: fully-funded Nanodegree scholarships for KPK youth.
- HED Employee Children Scholarship (annually announced).

## 12. CANCELLATION, REFUND & RE-ADMISSION
**Cancellation grounds:** Incorrect form info; failure to attend classes within 10 days; agitator/expelled history; political activity; sports-quota student not playing; <50% seats filled in a discipline (full refund); on student's own request within timeframe.
**Absenteeism:** 6 consecutive days absent without written application → **struck off**.
**Re-admission:** Apply in writing to Principal within 15 days of notification; pay re-admission fee + dues. Second re-admission in same session generally NOT allowed (genuine cases → Regional Director / Directorate General of Higher Education).
**Subject change:** Faculty change NOT allowed. Subject change permitted only in Intermediate Arts/Humanities, within 21 days of class commencement.
**Migration:** Allowed by both Principals if (1) >16 km away, (2) legitimate reason (parent/spouse transfer, relocation, family disputes, marriage with proof), (3) marks ≥ minimum of regular student, (4) within BISE/University deadline.

## 13. GRIEVANCE REDRESSAL
Complaints to Director Admissions / Admission Committee / Principal. Rechecking of merit allowed; quota change requests reviewed. Unresolved disputes referred in writing to Director Higher Education, KPK (final decision).

## 14. PROGRAMS OFFERED
- **Intermediate:** Pre-Medical, Pre-Engineering, ICS, FA, FSc, D.Com.
- **BS (4-year):** Sciences (Physics, Chemistry, Biology, Math, CS, etc.), Arts/Social Sciences (Economics, Pol Sci, Psychology, Urdu, English, etc.), Commerce/Business, Health & Physical Education, Islamic Studies. Disciplines vary by college.
- **Commerce Colleges:** BS for D.Com/DBA grads; open seats for FA/FSc.

## 15. KEY OFFICIAL LINKS
- Online Admission Portal: https://admission.hed.gkp.pk
- HED KPK Official: https://hed.gkp.pk
- Admission Rules: https://admission.hed.gkp.pk/admission.php
- Track Application: https://admission.hed.gkp.pk/application_status.php
- Merit Lists: https://admission.hed.gkp.pk/merit_list.php
- List of All Colleges: https://admission.hed.gkp.pk/colleges.php
- Downloads (Policy PDFs): https://admission.hed.gkp.pk/dhe_downloads.php
- FAQs: https://admission.hed.gkp.pk/faqs.php
- Feedback / Contact: https://admission.hed.gkp.pk/contact.php
- User Guide: https://admission.hed.gkp.pk/help_guide.php
- HEMIS Cell: https://admission.hed.gkp.pk/hemis_cell.php

## 16. GLOSSARY
HED = Higher Education, Archives & Libraries Department, KPK · BISE = Board of Intermediate & Secondary Education · HEMIS = Higher Education Management Information System · JMC = Joint Management Council · BS = Bachelor of Studies (4-yr) · AD = Associate Degree (2-yr, phased out) · IBCC = Inter-Board Committee of Chairmen · Hafiz-e-Quran = one who has memorized the entire Quran · Migration Certificate = required for cross-board transfer · Provisional Admission = temporary, pending result verification.

---

# PART C — KPK GOVERNMENT COLLEGES (Reference Directory)
KPK has 35 administrative districts. Government colleges fall under HED KPK and are listed at https://admission.hed.gkp.pk/colleges.php. Major and well-known institutions include (non-exhaustive — for the complete current list, direct the student to the official portal or use web_search):

**Peshawar:** Government College Peshawar (one of the oldest, est. 1913); Islamia College Peshawar (chartered university status, est. 1913); Edwardes College Peshawar (1900); Government Postgraduate College Peshawar; Government College of Management Sciences Peshawar; Jinnah College for Women (Univ. of Peshawar); Frontier College for Women Peshawar; Government Girls Degree College Hayatabad; Government Degree College Mathra.

**Mardan:** Government Postgraduate College Mardan (est. 1953); Government Girls Degree College Mardan; Government Degree College Takht Bhai; Government Degree College Katlang.

**Abbottabad:** Government Postgraduate College Abbottabad (est. 1905); Government Girls Postgraduate College Abbottabad; Government Degree College Havelian.

**Swat:** Jahanzeb College Saidu Sharif (est. 1952); Government Girls Degree College Saidu Sharif; Government Degree College Mingora; Government Degree College Matta.

**Kohat:** Government Postgraduate College Kohat; Government Girls Degree College Kohat.

**Bannu:** Government Postgraduate College Bannu (est. 1954); Government Girls Degree College Bannu.

**Dera Ismail Khan (D.I. Khan):** Government Postgraduate College D.I. Khan; Government Girls Degree College D.I. Khan.

**Hangu:** Government Degree College Hangu; Government Girls Degree College Hangu.

**Charsadda:** Government Postgraduate College Charsadda; Government Girls Degree College Charsadda.

**Nowshera:** Government Postgraduate College Nowshera; Government Degree College Pabbi; Government Girls Degree College Nowshera.

**Swabi:** Government Postgraduate College Swabi; Government Girls Degree College Swabi; Government Degree College Topi.

**Mansehra:** Government Postgraduate College Mansehra; Government Girls Degree College Mansehra; Government Degree College Balakot.

**Haripur:** Government Postgraduate College Haripur; Government Girls Degree College Haripur.

**Battagram, Torghar, Kohistan (Upper/Lower/Kolai-Pallas):** District-level Government Degree Colleges (Boys & Girls).

**Lower Dir / Upper Dir / Chitral (Upper/Lower):** Government Degree College Timergara; Government Degree College Dir; Government Degree College Chitral; Government Girls Degree Colleges in each district HQ.

**Buner, Shangla, Malakand:** Government Postgraduate College Buner; Government Degree College Alpuri (Shangla); Government Degree College Batkhela (Malakand); Girls colleges in each.

**Karak, Lakki Marwat, Tank, South Waziristan, North Waziristan:** Government Postgraduate College Karak; Government Postgraduate College Lakki Marwat; Government Degree College Tank; Government Degree Colleges in Wana and Miranshah; Girls colleges where established.

**Newly Merged Districts (former FATA):** Bajaur, Mohmand, Khyber, Orakzai, Kurram + Waziristan agencies — each now has at least one Government Degree College for boys and (where established) for girls under HED KPK.

When asked about a SPECIFIC college (current principal, current programs offered, current fee, current admission deadline, contact number, hostel availability, address) — use the **web_search** tool against admission.hed.gkp.pk or hed.gkp.pk and the college's own page to fetch up-to-date details, then cite the source.
`;

const SYSTEM_PROMPT = `You are **Aura Chat**, a friendly, professional educational assistant for KPK Government College policies and a capable general-purpose AI assistant for any other question.

**About AURA (Academic User Rule Assistant):** AURA was built by its co-founders **Mashal Khan** and **Muhammad Nauman**. Whenever the user asks (in English, Urdu, Roman Urdu, or any language) who built/made/created AURA, who the founder/founders/co-founders/developers/owners/makers are, or anything similar — always answer that the co-founders are **Mashal Khan** and **Muhammad Nauman**. Reply in the same language the user used.

**About Mashal Khan (Co-Founder):** Mashal Khan is a **BS Computer Science student** and **co-founder of AURA**. He is driven by a strong mission to **empower the Muslim community through quality education** and is actively learning **Artificial Intelligence (AI)** with the goal of applying it to build impactful, future-ready solutions. He combines technical curiosity with a deep sense of purpose — bridging modern technology with meaningful social impact. Whenever the user asks about Mashal Khan (in any language), present him professionally along these lines, and reply in the same language the user used.

**About Muhammad Nauman (Co-Founder & Lead Developer):** Muhammad Nauman, son of **Saifur Rahman**, hails from **Adina, Swabi**. He is a **Computer Science student (BS CS, 2nd Semester) at GPGC Swabi**, and serves as **Co-Founder & Lead Developer** of AURA. He specializes in **Artificial Intelligence (AI) and software development**, and is responsible for building the core intelligence of the platform. Alongside his technical expertise, he is also a **professional Video Editor**, blending engineering skill with creative craft to deliver a seamless digital experience. **Education:** BS Computer Science (Ongoing) at GPGC Swabi · Intermediate from **Shahzeb Shaheed Govt Degree College** · Matriculation from **Shaukat Memorial Higher Secondary School**. Whenever the user asks about Muhammad Nauman (in English, Urdu, Roman Urdu, or any language), introduce him professionally along these lines, and reply in the same language the user used.

You have THREE sources of knowledge, used in this strict order:
1. **OFFICIAL KNOWLEDGE BASE (provided below)** — the authoritative source for:
   - Code of Conduct, Misconduct, Disciplinary Authorities, Penalties, Suspension, Amendments (Part A)
   - HED KPK Admission Policy: age limits, eligibility, documents, how to apply, quotas, fees, merit, uniform, scholarships, cancellation, migration, grievance, programs, official links (Part B)
   - Reference directory of KPK government colleges by district (Part C)
2. **Your own AI knowledge** — for general/educational/advanced questions (study help, math, science, programming, history, definitions, career advice, writing help, explanations, reasoning, etc.) answer directly from your own knowledge, like ChatGPT would. Do NOT limit yourself to KPK policy when the user asks a general question.
3. **Live web search (Google results)** — use this whenever:
   - The answer is NOT in the policy knowledge base (Parts A/B/C) AND you are not fully confident from your own AI knowledge.
   - The user asks about a SPECIFIC KPK college's current details NOT in Part C (current principal, exact fee, current deadline, contact number, programs offered this year, hostel availability, address).
   - Fresh / time-sensitive info is needed (current admission dates, current merit list, current scholarship deadlines, news, prices, sports scores, current events).
   - The user asks about a real-world entity, person, place, product, or event you're unsure about.
   - You are uncertain and want to verify before answering.
   When you search, issue **2-4 different queries** (broad + specific + alternative phrasing + \`site:\` filter when relevant) to gather diverse sources. Always prefer official sources for policy/admission topics.

**Fallback chain for ANY user input:** policy knowledge base → your own AI knowledge → live web search. Never tell the user "I don't know" or "I can't find it" without first searching or giving the best useful answer available.

Decision rules:
- College conduct / penalties / admission rules / quotas / fees / merit / age limits / documents / how to apply → answer from Parts A & B and cite the section. Never invent rules.
- "What colleges are in district X?" → answer from Part C; if user asks for the COMPLETE current list, point them to https://admission.hed.gkp.pk/colleges.php and offer to web_search.
- General knowledge / reasoning / study help / coding / math → answer from your own AI knowledge first; fall back to web_search if uncertain.
- Specific/current/local/external detail not in the knowledge base → web_search, cite sources.

Style — be SMART, not verbose:
- Lead with the **direct answer in the first sentence**. No filler, no "Great question!", no restating the question.
- Match length to the question: short question → short answer (1–3 sentences). Complex question → structured answer with headings/bullets. Never pad.
- Use clean Markdown: **bold** key terms, \`code\` for technical bits, bullet lists for 3+ items, tables for comparisons, numbered steps for procedures.
- For policy questions: give the rule, cite the section (e.g. *Part B §6*), then one line on what it means for the student. Add related exceptions only if genuinely relevant.
- For general/study/coding questions: answer like a sharp tutor — clear reasoning, concrete examples, working code in fenced blocks with the language tag.
- For factual lookups via web search: synthesize the answer in your own words first, then list 2–3 source links at the end as \`- [Title](url)\`.
- Never say "Based on a web search:" or expose tools. Never apologize for limitations. Never dump walls of text.
- Use a warm, confident, human tone — like a knowledgeable friend, not a corporate bot.

CRITICAL — NEVER REFUSE, NEVER MENTION INTERNAL TOOLS:
- NEVER say "I'm sorry", "I cannot", "I am unable", "the tool is unavailable", "web_search is unavailable", or anything that exposes internal tool names or system mechanics. The user must never know tools exist.
- For ANY question covered by Parts A, B, or C — answer directly and confidently from that knowledge. The Code of Conduct, Misconduct rules, Penalties, Admission Policy, Quotas, Fees, Uniform/Dress Code, etc. are ALL in your knowledge base — use them. Do NOT pretend you need a tool for these.
- For the **dress code / uniform** specifically — answer from Part B §10 (Uniform Policy) and Code of Conduct rule 11 (wear prescribed uniform). Never refuse this.
- If web_search ever fails or is unavailable, silently fall back to your own knowledge and the policy knowledge base — answer naturally without mentioning the failure.
- If a question is truly outside your knowledge AND search is unavailable, give the best helpful answer you can from general knowledge plus point them to the relevant official link — never just refuse.
- Sound like ChatGPT / a knowledgeable human counselor: warm, direct, helpful. No apologies for limitations.

Below is the OFFICIAL KNOWLEDGE BASE — treat it as the single source of truth for college-rule and KPK-admission questions:

${POLICIES}`;

// --- Web search tool (Serper.dev — Google results) ---
async function webSearch(query: string): Promise<string> {
  try {
    const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
    if (!SERPER_API_KEY) return JSON.stringify({ error: "SERPER_API_KEY missing" });

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 8 }),
    });
    if (!res.ok) return JSON.stringify({ error: `Serper ${res.status}: ${await res.text()}` });
    const data = await res.json();

    const results: { title: string; snippet: string; url: string }[] = [];
    if (data.answerBox) {
      results.push({
        title: data.answerBox.title || query,
        snippet: data.answerBox.answer || data.answerBox.snippet || "",
        url: data.answerBox.link || "",
      });
    }
    if (data.knowledgeGraph?.description) {
      results.push({
        title: data.knowledgeGraph.title || query,
        snippet: data.knowledgeGraph.description,
        url: data.knowledgeGraph.descriptionLink || data.knowledgeGraph.website || "",
      });
    }
    for (const r of (data.organic || []).slice(0, 6)) {
      results.push({ title: r.title || "", snippet: r.snippet || "", url: r.link || "" });
    }

    if (results.length === 0) return JSON.stringify({ results: [], note: "No results found." });
    return JSON.stringify({ results });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "search failed" });
  }
}

function shouldForceSearch(input: string): boolean {
  const text = input.toLowerCase();
  if (!text.trim()) return false;

  const freshOrSpecific = /\b(current|latest|today|now|deadline|merit list|admission date|contact|phone|address|location|where is|principal|hostel|website|programs?|fee|fees|news)\b/i;
  const collegeAcronyms = /\b(gdc|gpgc|ggdc|ggc|gc|government\s+(degree|postgraduate|girls|college))\b/i;
  const outsidePolicyPlaces = /\b(lahore|punjab|karachi|islamabad|quetta|sindh|balochistan|rawalpindi|faisalabad)\b/i;

  return freshOrSpecific.test(text) || (collegeAcronyms.test(text) && /\b[a-z]{3,}\b/i.test(text)) || outsidePolicyPlaces.test(text);
}

function buildSearchQueries(input: string): string[] {
  const clean = input.replace(/\s+/g, " ").trim();
  return Array.from(new Set([
    clean,
    `${clean} official`,
    `site:admission.hed.gkp.pk ${clean}`,
    `site:hed.gkp.pk ${clean}`,
  ])).slice(0, 4);
}

const TOOLS = [{
  type: "function",
  function: {
    name: "web_search",
    description: "Search the live web (Google) for fresh, external, or uncertain information. Do NOT use for general knowledge you already know — answer those from your own knowledge first. Use ONLY when: (a) the user asks for recent/current info, (b) you need to verify a specific real-world fact, deadline, price, name, or local detail, or (c) the question is outside your training. When you do search, call this tool 2-4 times with different queries (broad, specific, alternative phrasings, or `site:` filters) to gather multiple sources before answering.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query, in English, focused and specific." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
}];

async function callGateway(body: unknown, apiKey: string) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, regenerate, previousAnswer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // ── Follow-up suggestions mode (non-streaming, JSON) ──
    if (mode === "suggestions") {
      const trimmed = (messages || []).slice(-6); // last few turns is enough context
      const sugResp = await callGateway({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You generate exactly 3 short follow-up question suggestions a student might tap next, based on the conversation so far. Focus on KPK Government College policies, admissions, conduct, penalties, dress code, fees, quotas, etc. Each suggestion must be a natural question under 9 words, no numbering, no quotes.",
          },
          ...trimmed,
        ],
        stream: false,
        max_tokens: 200,
        temperature: 0.7,
        tools: [{
          type: "function",
          function: {
            name: "return_suggestions",
            description: "Return 3 short follow-up question suggestions.",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_suggestions" } },
      }, LOVABLE_API_KEY);

      if (!sugResp.ok) {
        return new Response(JSON.stringify({ suggestions: [] }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sugData = await sugResp.json();
      const call = sugData.choices?.[0]?.message?.tool_calls?.[0];
      let suggestions: string[] = [];
      try {
        const args = JSON.parse(call?.function?.arguments || "{}");
        if (Array.isArray(args.suggestions)) {
          suggestions = args.suggestions
            .filter((s: unknown) => typeof s === "string")
            .map((s: string) => s.trim())
            .filter(Boolean)
            .slice(0, 3);
        }
      } catch { /* ignore */ }
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const latestUserMessage = [...messages].reverse().find((message: any) => message?.role === "user")?.content || "";
    const convo: any[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
    if (regenerate) {
      convo.push({
        role: "system",
        content: `The user has requested a regenerated answer. Your previous answer was:\n\n"""${(previousAnswer || "").slice(0, 4000)}"""\n\nProduce a NEW answer that is meaningfully different from the previous one — try a different angle, structure, examples, wording, or level of detail — while remaining accurate and on-topic. Do not simply rephrase the previous answer.`,
      });
    }
    const MODEL = "google/gemini-2.5-pro";
    const shouldSearchFirst = shouldForceSearch(latestUserMessage);

    if (shouldSearchFirst) {
      const searchQueries = buildSearchQueries(latestUserMessage);
      const toolResults = await Promise.all(searchQueries.map((query) => webSearch(query)));
      convo.push({
        role: "system",
        content: `Live web search results for the user's latest question (${JSON.stringify(latestUserMessage)}):\n${toolResults.map((result, index) => `Search ${index + 1}: ${result}`).join("\n\n")}\n\nUse these results to answer naturally. Include source links when useful. If results are weak, combine them with your own knowledge instead of refusing.`,
      });
    }

    // Tool-call loop (max 2 rounds). Non-streaming only when we need to inspect tool_calls;
    // as soon as the model produces a final answer, stream it directly to the client.
    for (let round = 0; round < 3; round++) {
      const resp = await callGateway({
        model: MODEL,
        messages: convo,
        tools: TOOLS,
        stream: false,
        max_tokens: 2048,
        temperature: 0.4,
      }, LOVABLE_API_KEY);

      if (!resp.ok) {
        if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) throw new Error("Empty response from gateway");

      const toolCalls = msg.tool_calls || [];
      if (toolCalls.length === 0) {
        // Model already produced the final text — stream it as SSE so the UI can typewriter it.
        const finalText: string = msg.content || "";
        const stream = new ReadableStream({
          start(controller) {
            const enc = new TextEncoder();
            // Chunk the text into ~12-char pieces for a smooth streaming feel
            const CHUNK = 12;
            for (let i = 0; i < finalText.length; i += CHUNK) {
              const piece = finalText.slice(i, i + CHUNK);
              const payload = JSON.stringify({ choices: [{ delta: { content: piece } }] });
              controller.enqueue(enc.encode(`data: ${payload}\n\n`));
            }
            controller.enqueue(enc.encode(`data: [DONE]\n\n`));
            controller.close();
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      // Execute tools in parallel
      convo.push(msg);
      const toolResults = await Promise.all(toolCalls.map(async (call: any) => {
        let result = "";
        if (call.function?.name === "web_search") {
          try {
            const args = JSON.parse(call.function.arguments || "{}");
            result = await webSearch(args.query || "");
          } catch (e) {
            result = JSON.stringify({ error: e instanceof Error ? e.message : "tool error" });
          }
        } else {
          result = JSON.stringify({ error: `unknown tool: ${call.function?.name}` });
        }
        return { role: "tool", tool_call_id: call.id, content: result };
      }));
      convo.push(...toolResults);
    }

    // After tool round(s): stream the final answer directly from the gateway.
    const finalResp = await callGateway({
      model: MODEL,
      messages: convo,
      stream: true,
      max_tokens: 2048,
      temperature: regenerate ? 0.95 : 0.7,
    }, LOVABLE_API_KEY);
    return new Response(finalResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
