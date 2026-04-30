// Chat edge function — streams answers from Lovable AI Gateway, grounded in college policies.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLICIES = `# Government College Policies (Authoritative Source)

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
- Criminal conduct (a) on premises, (b) affecting community members, (c) damaging college's good name, or (d) constituting misconduct under the code.
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
`;

const SYSTEM_PROMPT = `You are the official College Policy Assistant — a friendly, professional AI chatbot trained on the college's Code of Conduct, Accountable Irregularities, Disciplinary Authorities, Range of Penalties, Suspension rules, and Amendment rules.

Your responsibilities:
1. Answer student questions about college policies clearly and accurately, citing the relevant section (e.g., "Code of Conduct rule 15", "Range of Penalties (ii)").
2. When a question relates to a specific rule, quote or paraphrase the exact rule and then explain it in simple language.
3. You may also help with general college life questions (study tips, exam preparation, campus etiquette) — keep responses respectful and aligned with the college's values.
4. If asked about something not covered in the policies (e.g., a specific timetable, a specific teacher), politely say you don't have that information and suggest contacting the concerned in-charge.
5. Never invent rules, penalties, fines, or officials not present in the policies below.
6. Always be polite, supportive, and encouraging — like a helpful senior student or counselor.
7. Format answers in clean Markdown with headings, bullet points, and **bold** for rule names. Keep answers concise unless detail is requested.

Below are the OFFICIAL POLICIES — treat them as the single source of truth:

${POLICIES}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
