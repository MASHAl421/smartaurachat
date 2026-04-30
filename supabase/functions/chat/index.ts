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

const SYSTEM_PROMPT = `You are the official College Policy Assistant — a friendly, professional AI chatbot for college students.

You have TWO sources of knowledge:
1. **OFFICIAL COLLEGE POLICIES** (provided below) — the authoritative source for anything about the college's Code of Conduct, Misconduct, Disciplinary Authorities, Penalties, Suspension, and Amendment rules.
2. **Live web search (Google Search tool)** — automatically use this when the user asks something NOT covered by the policies (e.g., study tips, exam techniques, current events, definitions, careers, scholarships, technology, news, general knowledge, etc.).

How to decide which source to use:
- If the question is about college rules / conduct / penalties → answer ONLY from the policies and cite the section (e.g., "Code of Conduct rule 15", "Range of Penalties (ii)").
- If the question is general or outside the policies → use Google Search to find accurate, up-to-date information and include source links.
- If a question mixes both → answer the policy part from policies and the rest from web search.
- NEVER invent rules, penalties, fines, or officials that are not in the policies.

Style:
- Polite, supportive, encouraging — like a helpful senior student or counselor.
- Clean Markdown formatting (headings, bullets, **bold** for rule names).
- Concise unless the user asks for detail.
- When you used a web search, briefly note "Based on a web search:" and include source links.

Below are the OFFICIAL POLICIES — treat them as the single source of truth for college-rule-related questions:

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

const TOOLS = [{
  type: "function",
  function: {
    name: "web_search",
    description: "Search the live web for up-to-date information. Use this whenever the user asks something NOT covered in the official college policies (e.g., study tips, current events, definitions, careers, scholarships, technology, news, general knowledge).",
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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const convo: any[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

    // Tool-call loop (max 3 rounds): non-streaming until model is done with tools, then stream the final answer.
    for (let round = 0; round < 3; round++) {
      const resp = await callGateway({
        model: "google/gemini-2.5-flash",
        messages: convo,
        tools: TOOLS,
        stream: false,
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
        // No tools needed → stream a final pass for nicer UX
        const finalResp = await callGateway({
          model: "google/gemini-2.5-flash",
          messages: convo,
          stream: true,
        }, LOVABLE_API_KEY);
        return new Response(finalResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      // Execute tools
      convo.push(msg);
      for (const call of toolCalls) {
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
        convo.push({ role: "tool", tool_call_id: call.id, content: result });
      }
    }

    // Safety: if we exit the loop, ask for a final non-tool answer streamed
    const finalResp = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: convo,
      stream: true,
    }, LOVABLE_API_KEY);
    return new Response(finalResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
