from openai import OpenAI
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
KEY = os.getenv("API_KEY")

client= OpenAI(
    base_url = "https://api.scaleway.ai/8a6d212d-73c8-46cd-95f9-6d111cf79241/v1",
    api_key = "82e7772a-9978-489f-b0d8-d5ca693336bc" # Replace SCW_SECRET_KEY with your IAM API key
)

async def get_answer(conversation):
    data = collect_user_info(conversation)
    answer = ''
    if data['is_complete']:
        answer = run_rag_pipeline(data['user_summary'])
    else:
        answer = data['assistant']
    return answer

def embed_text(text: str):
    response = client.embeddings.create(
        input=text,
        model="bge-multilingual-gemma2",
    )
    return response.data[0].embedding


def retrieve_context(query: str, top_k: int = 1):
    embedding = embed_text(query)
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT content,
               1 - (embedding <#> %s::vector) AS similarity
        FROM items
        ORDER BY embedding <#> %s::vector
        LIMIT %s;
    """, (embedding, embedding, top_k))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [row['content'] for row in rows]


def collect_user_info(conversation: list[dict]) -> dict:
    system_prompt = {
    "role": "system",
    "content": (
        "You are a professional e-sales assistant for a telecom company offering data and mobile plans. "
        "Your task is to identify the user's profile and needs in order to recommend the best matching plan. "
        "Ask short, focused questions about the user's lifestyle, usage habits, and preferences. "
        "Specifically, gather at least 2–3 of the following details: "
        "1) number of people or devices to connect, "
        "2) average monthly data use or type of internet usage (streaming, travel, work, etc.), "
        "3) travel habits (local, EU, global), "
        "4) desired flexibility (contract vs. no commitment), "
        "5) special interests (students, family, eco, smart home, business). "
        "Ask only necessary questions to make a confident plan match. "
        "Be concise, professional, and keep the tone neutral."
        "If the user refuses to share more or you have enough information, clearly say: 'OK, I have all the data.' "
    ),
}

    messages = [system_prompt] + conversation

    response = client.chat.completions.create(
        model="qwen3-235b-a22b-instruct-2507",
        messages=messages,
        max_tokens=2048,
        temperature=0.7,
        top_p=0.8,
        presence_penalty=0,
        stream=False,
    )

    reply = response.choices[0].message.content.strip()
    is_complete = any(
        phrase in reply.lower()
        for phrase in ["i have all the data", "mam wszystko"]
    )

    user_summary = " ".join(
        m.content for m in conversation if m.role == "user"
    )

    return {
        "assistant": reply,
        "is_complete": is_complete,
        "user_summary": user_summary if is_complete else None,
    }


def run_rag_pipeline(user_summary: str) -> str:
    """
    Przyjmuje podsumowanie potrzeb użytkownika (tekst),
    wyszukuje kontekst w bazie i generuje finalną odpowiedź.
    """
    context = retrieve_context(user_summary, 1)
    context_text = "\n\n".join(context)

    prompt = f"""
            You are a telecom e-sales assistant.

            User summary:
            {user_summary}

            Context (selected plan details):
            {context_text}

            Task:
            Describe the plan clearly and completely, using the context text as the base. Then explain how each of its key features meets the user's stated needs.
            Sound confident and professional — like a skilled merchant who knows their product inside out.

            Instructions:
            - Start by presenting the plan exactly as in the context (price, description, features).
            - Then interpret its value for the user in 2–4 sentences.
            - Always relate features to user needs (speed, travel, flexibility, etc.).
            - Stay factual, clear, and persuasive without exaggeration.
            - End with one short concluding line confirming the fit.

            Output only the final explanation, no extra formatting or sections.
            """

    response = client.chat.completions.create(

        model="qwen3-235b-a22b-instruct-2507",
        messages=[
                { "role": "system", "content": prompt},
                { "role": "user", "content": "" },
        ],
        max_tokens=2048,
        temperature=0.7,
        top_p=0.8,
        presence_penalty=0,
        stream=False
    )

    return response.choices[0].message.content.strip()